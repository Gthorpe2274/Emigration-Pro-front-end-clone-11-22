export type IndexedReportSource = {
  title: string;
  uri: string;
  isVideo?: boolean;
  citationIndex: number;
};

const CITATION_GROUP = /\[(\d+(?:\s*(?:,|-)\s*\d+)*)\]/g;

const expandCitationGroup = (value: string, maximum: number): number[] => {
  const indexes: number[] = [];

  for (const part of value.split(',')) {
    const range = /^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(part);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start > 0 && end >= start && end - start <= maximum) {
        for (let index = start; index <= Math.min(end, maximum); index++) indexes.push(index);
      }
      continue;
    }

    const index = Number(part.trim());
    if (index > 0 && index <= maximum) indexes.push(index);
  }

  return indexes;
};

export const getReferencedCitationIndexes = (content: string, citationCount: number): Set<number> => {
  const referenced = new Set<number>();
  for (const match of content.matchAll(CITATION_GROUP)) {
    for (const index of expandCitationGroup(match[1], citationCount)) referenced.add(index);
  }
  return referenced;
};

/**
 * Keep the provider's original citation position attached to each URL. The
 * report may later reject weak or broken URLs, so array position alone is not
 * a safe citation identifier.
 */
export const keepReferencedSources = <T extends IndexedReportSource>(content: string, sources: T[]): T[] => {
  const referenced = getReferencedCitationIndexes(content, sources.length);
  if (referenced.size === 0) return sources;
  return sources.filter(source => referenced.has(source.citationIndex));
};

/**
 * Rewrites inline citation numbers after filtering. References to rejected
 * URLs are removed instead of silently pointing at a different resource.
 */
export const reconcileCitationMarkers = (content: string, retainedSources: IndexedReportSource[], originalCount: number): string => {
  const newIndexByOriginal = new Map(
    retainedSources.map((source, index) => [source.citationIndex, index + 1]),
  );

  return content.replace(CITATION_GROUP, (_match, group: string) => {
    const mapped = expandCitationGroup(group, originalCount)
      .map(index => newIndexByOriginal.get(index))
      .filter((index): index is number => index !== undefined)
      .filter((index, position, all) => all.indexOf(index) === position);

    return mapped.length > 0 ? `[${mapped.join(', ')}]` : '';
  });
};

export const normalizeCitationUrl = (value: string): string => {
  try {
    const url = new URL(value);
    url.hash = '';
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch {
    return value.trim();
  }
};
