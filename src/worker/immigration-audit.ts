import { z } from 'zod';
import { CountryData } from '../shared/types';

export const IMMIGRATION_AUDIT_CRON = '0 4 1 * *';
export const IMMIGRATION_SNAPSHOT_MAX_AGE_DAYS = 35;
const IMMIGRATION_AUDIT_MODEL = 'sonar';
const QUEUE_BATCH_SIZE = 50;
const MAX_QUEUE_ATTEMPTS = 4;

export const IMMIGRATION_SENSITIVE_CONCERN_IDS = new Set([
  'visa',
  'situation',
  'relocation_timeline',
  'senior_benefits',
]);

const ImmigrationAuditMessageSchema = z.object({
  runId: z.number().int().positive(),
  country: z.string().trim().min(1),
  requestedAt: z.string().datetime(),
  priority: z.enum(['monthly', 'manual', 'on-demand']),
});

export type ImmigrationAuditMessage = z.infer<typeof ImmigrationAuditMessageSchema>;

const OfficialSourceSchema = z.object({
  title: z.string().trim().min(1),
  authority: z.string().trim().min(1),
  url: z.string().url(),
  publishedOrEffectiveDate: z.string().trim().nullable().optional(),
  accessedAt: z.string().trim().optional(),
});

const ImmigrationOptionSchema = z.object({
  name: z.string().trim().min(1),
  category: z.enum([
    'work', 'remote_work', 'retirement', 'passive_income', 'investment',
    'entrepreneur', 'family', 'student', 'humanitarian', 'other',
  ]),
  status: z.enum(['open', 'closed', 'suspended', 'unclear']),
  eligibility: z.array(z.string().trim().min(1)),
  incomeOrInvestmentThresholds: z.array(z.string().trim().min(1)),
  governmentFees: z.array(z.string().trim().min(1)),
  processingTime: z.string().trim().min(1),
  workRights: z.string().trim().min(1),
  dependentRights: z.string().trim().min(1),
  renewalRules: z.string().trim().min(1),
  permanentResidencePath: z.string().trim().min(1),
  requiredDocuments: z.array(z.string().trim().min(1)),
  applicationUrl: z.string().url().nullable(),
  officialSources: z.array(OfficialSourceSchema).min(1),
});

const ImmigrationAuditContentSchema = z.object({
  country: z.string().trim().min(1),
  jurisdictionType: z.enum(['country', 'territory', 'special_administrative_region', 'unclear']),
  verifiedAsOf: z.string().trim().min(1),
  responsibleAuthorities: z.array(z.string().trim().min(1)).min(1),
  options: z.array(ImmigrationOptionSchema).min(1),
  generalEntryRequirements: z.array(z.string().trim().min(1)),
  postArrivalRequirements: z.array(z.string().trim().min(1)),
  warnings: z.array(z.string().trim().min(1)),
  verificationChecklist: z.array(z.string().trim().min(1)).min(1),
});

export type ImmigrationAuditContent = z.infer<typeof ImmigrationAuditContentSchema>;
export type ImmigrationOfficialSource = z.infer<typeof OfficialSourceSchema>;

const PerplexityResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({ content: z.string() }),
  })).min(1),
  citations: z.array(z.string().url()).optional().default([]),
  usage: z.object({
    prompt_tokens: z.number().int().nonnegative().optional().default(0),
    completion_tokens: z.number().int().nonnegative().optional().default(0),
    cost: z.object({
      request_cost: z.number().nonnegative().optional(),
      total_cost: z.number().nonnegative().optional(),
    }).passthrough().optional(),
  }).passthrough().optional(),
}).passthrough();

export interface ImmigrationSnapshotRecord {
  id: number;
  country: string;
  status: 'approved' | 'review_required' | 'rejected';
  content: ImmigrationAuditContent;
  contentHash: string;
  verifiedAt: string;
  approvedAt: string | null;
  officialSources: ImmigrationOfficialSource[];
}

export class ImmigrationSnapshotUnavailableError extends Error {
  constructor(country: string, reason: string) {
    super(`Verified immigration requirements for ${country} are unavailable: ${reason}`);
    this.name = 'ImmigrationSnapshotUnavailableError';
  }
}

const catalogLookup = new Map(CountryData.countries.map(country => [country.toLocaleLowerCase(), country]));

export const canonicalCountryName = (country: string): string | null =>
  catalogLookup.get(country.trim().toLocaleLowerCase()) ?? null;

const trustedOfficialHostPatterns = [
  /(^|\.)gov(\.[a-z]{2,3})?$/,
  /(^|\.)go\.[a-z]{2,3}$/,
  /(^|\.)gob\.[a-z]{2,3}$/,
  /(^|\.)gouv\.[a-z]{2,3}$/,
  /(^|\.)gv\.[a-z]{2,3}$/,
  /(^|\.)govt\.nz$/,
  /(^|\.)gc\.ca$/,
  /(^|\.)admin\.ch$/,
  /(^|\.)europa\.eu$/,
  /(^|\.)usembassy\.gov$/,
];

const trustedOfficialHosts = new Set([
  'travel.state.gov',
  'state.gov',
  'make-it-in-germany.com',
  'service-public.fr',
  'ind.nl',
  'ibz.be',
  'migrationsverket.se',
  'udi.no',
  'nyidanmark.dk',
  'migri.fi',
  'island.is',
]);

export const isOfficialImmigrationSourceUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return false;
    const hostname = url.hostname.toLocaleLowerCase().replace(/^www\./, '').replace(/\.$/, '');
    if (!hostname || hostname === 'localhost' || hostname.includes(':')) return false;
    if (trustedOfficialHosts.has(hostname)) return true;
    return trustedOfficialHostPatterns.some(pattern => pattern.test(hostname));
  } catch {
    return false;
  }
};

const stripJsonEnvelope = (value: string): string => {
  const trimmed = value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  return first >= 0 && last > first ? trimmed.slice(first, last + 1) : trimmed;
};

const normalizedSource = (source: ImmigrationOfficialSource, verifiedAt: string): ImmigrationOfficialSource => ({
  title: source.title.trim(),
  authority: source.authority.trim(),
  url: source.url,
  publishedOrEffectiveDate: source.publishedOrEffectiveDate?.trim() || null,
  accessedAt: verifiedAt,
});

export const collectOfficialSources = (
  content: ImmigrationAuditContent,
  citationUrls: string[],
  verifiedAt: string,
): ImmigrationOfficialSource[] => {
  const declared = content.options.flatMap(option => option.officialSources)
    .map(source => normalizedSource(source, verifiedAt));
  const cited = citationUrls
    .filter(isOfficialImmigrationSourceUrl)
    .map(url => {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      return {
        title: hostname,
        authority: hostname,
        url,
        publishedOrEffectiveDate: null,
        accessedAt: verifiedAt,
      } satisfies ImmigrationOfficialSource;
    });

  const sources = [...declared, ...cited]
    .filter(source => isOfficialImmigrationSourceUrl(source.url));
  return Array.from(new Map(sources.map(source => [source.url, source])).values());
};

const canonicalMaterial = (content: ImmigrationAuditContent): unknown => ({
  country: content.country,
  jurisdictionType: content.jurisdictionType,
  responsibleAuthorities: [...content.responsibleAuthorities].sort(),
  options: [...content.options]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(option => ({
      ...option,
      eligibility: [...option.eligibility].sort(),
      incomeOrInvestmentThresholds: [...option.incomeOrInvestmentThresholds].sort(),
      governmentFees: [...option.governmentFees].sort(),
      requiredDocuments: [...option.requiredDocuments].sort(),
      officialSources: option.officialSources
        .map(({ accessedAt: _accessedAt, ...source }) => source)
        .sort((a, b) => a.url.localeCompare(b.url)),
    })),
  generalEntryRequirements: [...content.generalEntryRequirements].sort(),
  postArrivalRequirements: [...content.postArrivalRequirements].sort(),
  warnings: [...content.warnings].sort(),
  verificationChecklist: [...content.verificationChecklist].sort(),
});

export const hashImmigrationContent = async (content: ImmigrationAuditContent): Promise<string> => {
  const bytes = new TextEncoder().encode(JSON.stringify(canonicalMaterial(content)));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
};

export const describeImmigrationChange = (
  previous: ImmigrationAuditContent | null,
  current: ImmigrationAuditContent,
  unchanged: boolean,
): { type: 'baseline' | 'unchanged' | 'modified'; severity: 'none' | 'medium' | 'high'; summary: string; details: unknown } => {
  if (!previous) {
    return {
      type: 'baseline',
      severity: 'none',
      summary: `Initial verified immigration baseline for ${current.country}`,
      details: { addedOptions: current.options.map(option => option.name) },
    };
  }
  if (unchanged) {
    return {
      type: 'unchanged',
      severity: 'none',
      summary: `No material immigration requirement changes detected for ${current.country}`,
      details: {},
    };
  }

  const previousByName = new Map(previous.options.map(option => [option.name.toLocaleLowerCase(), option]));
  const currentByName = new Map(current.options.map(option => [option.name.toLocaleLowerCase(), option]));
  const addedOptions = current.options.filter(option => !previousByName.has(option.name.toLocaleLowerCase())).map(option => option.name);
  const removedOptions = previous.options.filter(option => !currentByName.has(option.name.toLocaleLowerCase())).map(option => option.name);
  const statusChanges = current.options.flatMap(option => {
    const old = previousByName.get(option.name.toLocaleLowerCase());
    return old && old.status !== option.status ? [{ option: option.name, from: old.status, to: option.status }] : [];
  });
  const severity = addedOptions.length || removedOptions.length || statusChanges.length ? 'high' : 'medium';
  return {
    type: 'modified',
    severity,
    summary: `Material immigration requirements changed for ${current.country}; administrator approval is required`,
    details: { addedOptions, removedOptions, statusChanges },
  };
};

export const buildImmigrationAuditPrompt = (country: string, verifiedAt: string): string => `
Return ONLY a complete JSON object. Audit the immigration and long-stay residence options for a United States citizen moving to ${country}, using information published by official government immigration authorities, ministries, embassies, consulates, or official application portals as of ${verifiedAt}.

Do not use law firms, relocation companies, blogs, social media, forums, Wikipedia, or unsourced summaries as evidence. If an item cannot be verified from an official source, put it in warnings and do not state it as settled fact. Use exact absolute dates and quote no source text.

Cover every applicable work, skilled-worker, remote-work/digital-nomad, retirement, passive-income, investor, entrepreneur, family/dependent, student, humanitarian, and other material long-stay pathway. For each pathway capture its status, eligibility, income/investment thresholds, government fees, official processing estimate, work rights, dependent rights, renewals, permanent-residence path, required documents, official application URL, and one or more official sources. Identify entry requirements, registration and post-arrival deadlines, insurance, police/medical certificates, translations, and apostilles where applicable. Treat territories and special jurisdictions according to their actual legal status.

Use this exact shape:
{
  "country": "${country}",
  "jurisdictionType": "country|territory|special_administrative_region|unclear",
  "verifiedAsOf": "${verifiedAt}",
  "responsibleAuthorities": ["authority name"],
  "options": [{
    "name": "official program or route name",
    "category": "work|remote_work|retirement|passive_income|investment|entrepreneur|family|student|humanitarian|other",
    "status": "open|closed|suspended|unclear",
    "eligibility": ["requirement"],
    "incomeOrInvestmentThresholds": ["amount, currency, period, and effective date"],
    "governmentFees": ["amount, currency, applicant type, and effective date"],
    "processingTime": "official estimate or explicitly not published",
    "workRights": "verified rule",
    "dependentRights": "verified rule",
    "renewalRules": "verified rule",
    "permanentResidencePath": "verified rule or no verified route",
    "requiredDocuments": ["document"],
    "applicationUrl": "https://official.example/path or null",
    "officialSources": [{
      "title": "official page title",
      "authority": "government authority",
      "url": "https://official.example/path",
      "publishedOrEffectiveDate": "YYYY-MM-DD, another absolute date, or null",
      "accessedAt": "${verifiedAt}"
    }]
  }],
  "generalEntryRequirements": ["requirement"],
  "postArrivalRequirements": ["requirement and deadline"],
  "warnings": ["conflict, missing official publication, or uncertainty"],
  "verificationChecklist": ["official authority and fact to reconfirm before acting"]
}`;

const latestSnapshotSql = (freshOnly: boolean): string => `
  SELECT id, country, status, content_json, content_hash, verified_at, approved_at, source_manifest
    FROM immigration_snapshots
   WHERE country = ? AND status = 'approved'
   ${freshOnly ? "AND verified_at >= datetime('now', ?)" : ''}
   ORDER BY datetime(verified_at) DESC, id DESC
   LIMIT 1`;

const mapSnapshot = (row: Record<string, unknown> | null): ImmigrationSnapshotRecord | null => {
  if (!row) return null;
  const content = ImmigrationAuditContentSchema.parse(JSON.parse(String(row.content_json)));
  const officialSources = z.array(OfficialSourceSchema).parse(JSON.parse(String(row.source_manifest)));
  return {
    id: Number(row.id),
    country: String(row.country),
    status: String(row.status) as ImmigrationSnapshotRecord['status'],
    content,
    contentHash: String(row.content_hash),
    verifiedAt: String(row.verified_at),
    approvedAt: row.approved_at ? String(row.approved_at) : null,
    officialSources,
  };
};

export const getLatestApprovedImmigrationSnapshot = async (
  db: D1Database,
  country: string,
  maxAgeDays?: number,
): Promise<ImmigrationSnapshotRecord | null> => {
  const canonical = canonicalCountryName(country);
  if (!canonical) return null;
  const freshOnly = typeof maxAgeDays === 'number';
  let statement = db.prepare(latestSnapshotSql(freshOnly)).bind(canonical);
  if (freshOnly) statement = db.prepare(latestSnapshotSql(true)).bind(canonical, `-${Math.max(1, Math.floor(maxAgeDays))} days`);
  const row = await statement.first<Record<string, unknown>>();
  return mapSnapshot(row);
};

export const formatImmigrationSnapshotForPrompt = (snapshot: ImmigrationSnapshotRecord): string =>
  JSON.stringify({
    snapshotId: snapshot.id,
    verifiedAt: snapshot.verifiedAt,
    contentHash: snapshot.contentHash,
    requirements: snapshot.content,
    officialSources: snapshot.officialSources,
  });

const getPreviousSnapshot = async (db: D1Database, country: string): Promise<ImmigrationSnapshotRecord | null> => {
  const row = await db.prepare(latestSnapshotSql(false)).bind(country).first<Record<string, unknown>>();
  return mapSnapshot(row);
};

const derivePublishedDate = (sources: ImmigrationOfficialSource[]): string | null => {
  const dates = sources
    .map(source => source.publishedOrEffectiveDate)
    .filter((date): date is string => Boolean(date))
    .sort();
  return dates.at(-1) ?? null;
};

const auditCountry = async (
  env: Env,
  runId: number,
  country: string,
): Promise<ImmigrationSnapshotRecord> => {
  if (!env.PERPLEXITY_API_KEY) throw new Error('PERPLEXITY_API_KEY is not configured');
  const canonical = canonicalCountryName(country);
  if (!canonical) throw new Error(`Country is not in the active catalog: ${country}`);

  const verifiedAt = new Date().toISOString();
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: IMMIGRATION_AUDIT_MODEL,
      messages: [
        { role: 'system', content: 'You are a cautious immigration-requirements auditor. Use only official government evidence and return valid JSON.' },
        { role: 'user', content: buildImmigrationAuditPrompt(canonical, verifiedAt.slice(0, 10)) },
      ],
      temperature: 0,
      max_tokens: 3000,
      search_context_size: 'high',
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 1000);
    throw new Error(`Perplexity audit failed (${response.status}): ${detail}`);
  }

  const apiResponse = PerplexityResponseSchema.parse(await response.json());
  const parsedJson = JSON.parse(stripJsonEnvelope(apiResponse.choices[0].message.content));
  const parsed = ImmigrationAuditContentSchema.parse(parsedJson);
  if (canonicalCountryName(parsed.country) !== canonical) {
    throw new Error(`Audit returned the wrong jurisdiction: ${parsed.country}`);
  }
  parsed.country = canonical;
  parsed.verifiedAsOf = verifiedAt;

  const officialSources = collectOfficialSources(parsed, apiResponse.citations, verifiedAt);
  if (officialSources.length === 0) throw new Error('Audit returned no recognized official government sources');
  const optionsWithoutOfficialEvidence = parsed.options.filter(option =>
    !option.officialSources.some(source => isOfficialImmigrationSourceUrl(source.url))
  );
  if (optionsWithoutOfficialEvidence.length > 0) {
    throw new Error(`Official evidence is missing for: ${optionsWithoutOfficialEvidence.map(option => option.name).join(', ')}`);
  }

  const contentHash = await hashImmigrationContent(parsed);
  const previous = await getPreviousSnapshot(env.DB, canonical);
  const change = describeImmigrationChange(previous?.content ?? null, parsed, previous?.contentHash === contentHash);
  const status: ImmigrationSnapshotRecord['status'] = change.type === 'modified' ? 'review_required' : 'approved';
  const usage = apiResponse.usage;
  const inputTokens = usage?.prompt_tokens ?? 0;
  const outputTokens = usage?.completion_tokens ?? 0;
  const requestCost = usage?.cost?.request_cost ?? 0.012;
  const totalCost = usage?.cost?.total_cost ?? requestCost + ((inputTokens + outputTokens) / 1_000_000);

  await env.DB.prepare(`
    INSERT INTO immigration_snapshots (
      run_id, country, status, content_json, content_hash, source_manifest,
      official_source_count, verified_at, published_or_effective_at, approved_at,
      supersedes_snapshot_id, change_summary, provider, model, input_tokens,
      output_tokens, request_cost_usd, total_cost_usd
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'perplexity', ?, ?, ?, ?, ?)
    ON CONFLICT(run_id, country) DO UPDATE SET
      status = excluded.status,
      content_json = excluded.content_json,
      content_hash = excluded.content_hash,
      source_manifest = excluded.source_manifest,
      official_source_count = excluded.official_source_count,
      verified_at = excluded.verified_at,
      published_or_effective_at = excluded.published_or_effective_at,
      approved_at = excluded.approved_at,
      supersedes_snapshot_id = excluded.supersedes_snapshot_id,
      change_summary = excluded.change_summary,
      input_tokens = excluded.input_tokens,
      output_tokens = excluded.output_tokens,
      request_cost_usd = excluded.request_cost_usd,
      total_cost_usd = excluded.total_cost_usd
  `).bind(
    runId,
    canonical,
    status,
    JSON.stringify(parsed),
    contentHash,
    JSON.stringify(officialSources),
    officialSources.length,
    verifiedAt,
    derivePublishedDate(officialSources),
    status === 'approved' ? verifiedAt : null,
    previous?.id ?? null,
    change.summary,
    IMMIGRATION_AUDIT_MODEL,
    inputTokens,
    outputTokens,
    requestCost,
    totalCost,
  ).run();

  const snapshotRow = await env.DB.prepare(
    'SELECT id FROM immigration_snapshots WHERE run_id = ? AND country = ?'
  ).bind(runId, canonical).first<{ id: number }>();
  if (!snapshotRow?.id) throw new Error('Snapshot was not persisted');

  await env.DB.prepare(`
    INSERT INTO immigration_changes (
      snapshot_id, previous_snapshot_id, country, change_type, severity,
      summary, details_json, review_status, reviewed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(snapshot_id) DO UPDATE SET
      previous_snapshot_id = excluded.previous_snapshot_id,
      change_type = excluded.change_type,
      severity = excluded.severity,
      summary = excluded.summary,
      details_json = excluded.details_json,
      review_status = excluded.review_status,
      reviewed_at = excluded.reviewed_at
  `).bind(
    snapshotRow.id,
    previous?.id ?? null,
    canonical,
    change.type,
    change.severity,
    change.summary,
    JSON.stringify(change.details),
    status === 'approved' ? 'not_required' : 'pending',
    status === 'approved' ? verifiedAt : null,
  ).run();

  await env.DB.prepare(`
    UPDATE immigration_audit_items
       SET status = ?, snapshot_id = ?, last_error = NULL,
           completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE run_id = ? AND country = ?
  `).bind(status, snapshotRow.id, runId, canonical).run();

  return {
    id: Number(snapshotRow.id),
    country: canonical,
    status,
    content: parsed,
    contentHash,
    verifiedAt,
    approvedAt: status === 'approved' ? verifiedAt : null,
    officialSources,
  };
};

const refreshRunSummary = async (db: D1Database, runId: number): Promise<void> => {
  const counts = await db.prepare(`
    SELECT COUNT(*) AS total,
           SUM(CASE WHEN status IN ('approved', 'review_required') THEN 1 ELSE 0 END) AS completed,
           SUM(CASE WHEN status = 'review_required' THEN 1 ELSE 0 END) AS review_required,
           SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
           SUM(CASE WHEN status IN ('queued', 'processing') THEN 1 ELSE 0 END) AS pending
      FROM immigration_audit_items
     WHERE run_id = ?
  `).bind(runId).first<Record<string, unknown>>();
  const costs = await db.prepare(`
    SELECT COALESCE(SUM(total_cost_usd), 0) AS total_cost
      FROM immigration_snapshots
     WHERE run_id = ?
  `).bind(runId).first<{ total_cost: number }>();

  const total = Number(counts?.total ?? 0);
  const completed = Number(counts?.completed ?? 0);
  const reviewRequired = Number(counts?.review_required ?? 0);
  const failed = Number(counts?.failed ?? 0);
  const pending = Number(counts?.pending ?? 0);
  const finished = total > 0 && pending === 0 && completed + failed === total;
  const status = finished
    ? failed === total ? 'failed' : failed > 0 ? 'completed_with_errors' : 'completed'
    : 'running';

  await db.prepare(`
    UPDATE immigration_audit_runs
       SET status = ?, total_countries = ?, completed_count = ?,
           changed_count = ?, review_required_count = ?, failed_count = ?,
           actual_cost_usd = ?, started_at = COALESCE(started_at, CURRENT_TIMESTAMP),
           completed_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END,
           updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
  `).bind(
    status,
    total,
    completed,
    reviewRequired,
    reviewRequired,
    failed,
    Number(costs?.total_cost ?? 0),
    finished ? 1 : 0,
    runId,
  ).run();
};

const insertRun = async (
  db: D1Database,
  runKey: string,
  triggerType: 'monthly' | 'manual' | 'on_demand',
  scheduledFor: string,
  countries: string[],
): Promise<{ id: number; created: boolean }> => {
  const insert = await db.prepare(`
    INSERT OR IGNORE INTO immigration_audit_runs (
      run_key, trigger_type, scheduled_for, status, total_countries
    ) VALUES (?, ?, ?, 'seeding', ?)
  `).bind(runKey, triggerType, scheduledFor, countries.length).run();
  const run = await db.prepare(
    'SELECT id FROM immigration_audit_runs WHERE run_key = ?'
  ).bind(runKey).first<{ id: number }>();
  if (!run?.id) throw new Error('Immigration audit run could not be created');
  return { id: Number(run.id), created: Number(insert.meta?.changes ?? 0) > 0 };
};

const seedRunItems = async (db: D1Database, runId: number, countries: string[]): Promise<void> => {
  for (let start = 0; start < countries.length; start += QUEUE_BATCH_SIZE) {
    const chunk = countries.slice(start, start + QUEUE_BATCH_SIZE);
    await db.batch(chunk.map(country => db.prepare(`
      INSERT OR IGNORE INTO immigration_audit_items (run_id, country, status)
      VALUES (?, ?, 'queued')
    `).bind(runId, country)));
  }
};

const enqueueRunItems = async (
  queue: Queue<ImmigrationAuditMessage>,
  runId: number,
  countries: string[],
  priority: ImmigrationAuditMessage['priority'],
  requestedAt: string,
): Promise<void> => {
  for (let start = 0; start < countries.length; start += QUEUE_BATCH_SIZE) {
    const chunk = countries.slice(start, start + QUEUE_BATCH_SIZE);
    await queue.sendBatch(chunk.map(country => ({
      body: { runId, country, requestedAt, priority },
      contentType: 'json' as const,
    })));
  }
};

export const startImmigrationAudit = async (
  env: Env,
  options: {
    triggerType: 'monthly' | 'manual';
    scheduledFor?: Date;
    countries?: string[];
    runKey?: string;
  },
): Promise<{ runId: number; queued: number; alreadyStarted: boolean }> => {
  const scheduledFor = options.scheduledFor ?? new Date();
  const requestedCountries = options.countries?.length ? options.countries : [...CountryData.countries];
  const countries = Array.from(new Set(requestedCountries.map(country => {
    const canonical = canonicalCountryName(country);
    if (!canonical) throw new Error(`Country is not in the active catalog: ${country}`);
    return canonical;
  })));
  const runKey = options.runKey ?? (options.triggerType === 'monthly'
    ? `monthly:${scheduledFor.toISOString().slice(0, 7)}`
    : `manual:${crypto.randomUUID()}`);
  const run = await insertRun(env.DB, runKey, options.triggerType, scheduledFor.toISOString(), countries);
  if (!run.created) return { runId: run.id, queued: 0, alreadyStarted: true };

  await seedRunItems(env.DB, run.id, countries);
  await enqueueRunItems(env.IMMIGRATION_AUDIT_QUEUE, run.id, countries, options.triggerType, scheduledFor.toISOString());
  await env.DB.prepare(`
    UPDATE immigration_audit_runs
       SET status = 'queued', updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
  `).bind(run.id).run();
  return { runId: run.id, queued: countries.length, alreadyStarted: false };
};

export const runMonthlyImmigrationAudit = async (
  env: Env,
  scheduledTime: number,
): Promise<{ runId: number; queued: number; alreadyStarted: boolean }> =>
  startImmigrationAudit(env, {
    triggerType: 'monthly',
    scheduledFor: new Date(scheduledTime),
  });

export const processImmigrationAuditBatch = async (
  batch: MessageBatch<ImmigrationAuditMessage>,
  env: Env,
): Promise<void> => {
  await Promise.all(batch.messages.map(async message => {
    const parsed = ImmigrationAuditMessageSchema.safeParse(message.body);
    if (!parsed.success) {
      console.error(JSON.stringify({ event: 'immigration_audit_invalid_message', messageId: message.id }));
      message.ack();
      return;
    }
    const job = parsed.data;
    const item = await env.DB.prepare(`
      SELECT status FROM immigration_audit_items WHERE run_id = ? AND country = ?
    `).bind(job.runId, job.country).first<{ status: string }>();
    if (!item || ['approved', 'review_required', 'failed'].includes(item.status)) {
      message.ack();
      return;
    }

    await env.DB.prepare(`
      UPDATE immigration_audit_items
         SET status = 'processing', attempts = attempts + 1,
             started_at = COALESCE(started_at, CURRENT_TIMESTAMP),
             updated_at = CURRENT_TIMESTAMP
       WHERE run_id = ? AND country = ?
    `).bind(job.runId, job.country).run();

    try {
      const snapshot = await auditCountry(env, job.runId, job.country);
      await refreshRunSummary(env.DB, job.runId);
      console.log(JSON.stringify({
        event: 'immigration_audit_country_complete',
        runId: job.runId,
        country: job.country,
        snapshotId: snapshot.id,
        status: snapshot.status,
      }));
      message.ack();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      const finalAttempt = message.attempts >= MAX_QUEUE_ATTEMPTS;
      await env.DB.prepare(`
        UPDATE immigration_audit_items
           SET status = ?, last_error = ?,
               completed_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END,
               updated_at = CURRENT_TIMESTAMP
         WHERE run_id = ? AND country = ?
      `).bind(finalAttempt ? 'failed' : 'queued', detail.slice(0, 2000), finalAttempt ? 1 : 0, job.runId, job.country).run();
      await refreshRunSummary(env.DB, job.runId);
      console.error(JSON.stringify({
        event: 'immigration_audit_country_failed',
        runId: job.runId,
        country: job.country,
        attempt: message.attempts,
        finalAttempt,
        error: detail,
      }));
      if (finalAttempt) message.ack();
      else message.retry({ delaySeconds: Math.min(3600, 60 * (2 ** Math.max(0, message.attempts - 1))) });
    }
  }));
};

export const ensureFreshImmigrationSnapshot = async (env: Env, country: string): Promise<ImmigrationSnapshotRecord> => {
  const canonical = canonicalCountryName(country);
  if (!canonical) throw new ImmigrationSnapshotUnavailableError(country, 'destination is not in the active catalog');
  const fresh = await getLatestApprovedImmigrationSnapshot(env.DB, canonical, IMMIGRATION_SNAPSHOT_MAX_AGE_DAYS);
  if (fresh) return fresh;

  const requestedAt = new Date();
  const runKey = `on-demand:${canonical}:${requestedAt.toISOString()}:${crypto.randomUUID()}`;
  const run = await insertRun(env.DB, runKey, 'on_demand', requestedAt.toISOString(), [canonical]);
  await seedRunItems(env.DB, run.id, [canonical]);
  await env.DB.prepare(`
    UPDATE immigration_audit_items
       SET status = 'processing', attempts = attempts + 1, started_at = CURRENT_TIMESTAMP
     WHERE run_id = ? AND country = ?
  `).bind(run.id, canonical).run();

  try {
    const snapshot = await auditCountry(env, run.id, canonical);
    await refreshRunSummary(env.DB, run.id);
    if (snapshot.status !== 'approved') {
      throw new ImmigrationSnapshotUnavailableError(canonical, 'a material change is awaiting administrator review');
    }
    return snapshot;
  } catch (error) {
    if (error instanceof ImmigrationSnapshotUnavailableError) throw error;
    const detail = error instanceof Error ? error.message : String(error);
    await env.DB.prepare(`
      UPDATE immigration_audit_items
         SET status = 'failed', last_error = ?, completed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
       WHERE run_id = ? AND country = ?
    `).bind(detail.slice(0, 2000), run.id, canonical).run();
    await refreshRunSummary(env.DB, run.id);
    throw new ImmigrationSnapshotUnavailableError(canonical, detail);
  }
};

export const getImmigrationAuditAdminSummary = async (db: D1Database, limit = 12): Promise<unknown> => {
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
  const [runs, reviews, stale] = await Promise.all([
    db.prepare(`
      SELECT * FROM immigration_audit_runs ORDER BY id DESC LIMIT ?
    `).bind(safeLimit).all(),
    db.prepare(`
      SELECT c.id AS change_id, c.country, c.severity, c.summary, c.details_json,
             c.created_at, s.id AS snapshot_id, s.verified_at, s.source_manifest
        FROM immigration_changes c
        JOIN immigration_snapshots s ON s.id = c.snapshot_id
       WHERE c.review_status = 'pending'
       ORDER BY CASE c.severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
                c.created_at ASC
       LIMIT 100
    `).all(),
    db.prepare(`
      SELECT catalog.country
        FROM (SELECT DISTINCT country FROM immigration_audit_items) catalog
        LEFT JOIN immigration_snapshots s
          ON s.id = (
            SELECT s2.id FROM immigration_snapshots s2
             WHERE s2.country = catalog.country AND s2.status = 'approved'
             ORDER BY datetime(s2.verified_at) DESC, s2.id DESC LIMIT 1
          )
       WHERE s.id IS NULL OR s.verified_at < datetime('now', ?)
       ORDER BY catalog.country
    `).bind(`-${IMMIGRATION_SNAPSHOT_MAX_AGE_DAYS} days`).all(),
  ]);
  return { runs: runs.results, pendingReviews: reviews.results, staleOrMissing: stale.results };
};

export const approveImmigrationSnapshot = async (db: D1Database, snapshotId: number): Promise<boolean> => {
  const result = await db.prepare(`
    UPDATE immigration_snapshots
       SET status = 'approved', approved_at = CURRENT_TIMESTAMP
     WHERE id = ? AND status = 'review_required'
  `).bind(snapshotId).run();
  if (Number(result.meta?.changes ?? 0) === 0) return false;
  await db.prepare(`
    UPDATE immigration_changes
       SET review_status = 'approved', reviewed_at = CURRENT_TIMESTAMP
     WHERE snapshot_id = ?
  `).bind(snapshotId).run();
  await db.prepare(`
    UPDATE immigration_audit_items
       SET status = 'approved', updated_at = CURRENT_TIMESTAMP
     WHERE snapshot_id = ?
  `).bind(snapshotId).run();
  return true;
};

export const rejectImmigrationSnapshot = async (db: D1Database, snapshotId: number): Promise<boolean> => {
  const result = await db.prepare(`
    UPDATE immigration_snapshots
       SET status = 'rejected'
     WHERE id = ? AND status = 'review_required'
  `).bind(snapshotId).run();
  if (Number(result.meta?.changes ?? 0) === 0) return false;
  await db.prepare(`
    UPDATE immigration_changes
       SET review_status = 'rejected', reviewed_at = CURRENT_TIMESTAMP
     WHERE snapshot_id = ?
  `).bind(snapshotId).run();
  return true;
};
