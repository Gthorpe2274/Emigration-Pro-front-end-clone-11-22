# Relocation Hub Update Cost Analysis - Gemini API

## Pricing Overview (Gemini 2.0 Flash Model)

**Base Pricing:**
- Input tokens: **$0.10 per 1 million tokens**
- Output tokens: **$0.40 per 1 million tokens**

**Additional Features:**
- Google Search Grounding: **$35 per 1,000 requests** (first 1,500/day free)
- Context Caching: **$0.01875 per 1M tokens** (storage) + **$1.00 per 1M tokens/hour**

---

## Scenario Analysis

### Update Frequency
- Updates occur **every 6 months**
- Annual updates: **2x per year per page**

---

## Scenario 1: Light Update (Basic Content Refresh)

**Assumptions:**
- 2,000 input tokens (current content + search query)
- 1,500 output tokens (updated sections)
- No Google Search Grounding (using cached/known data)

**Cost per Page Update:**
- Input: (2,000 / 1,000,000) × $0.10 = **$0.0002**
- Output: (1,500 / 1,000,000) × $0.40 = **$0.0006**
- **Total per update: $0.0008**

| Pages | Updates/Year | Cost per Update | Annual Cost |
|-------|--------------|-----------------|-------------|
| 10,000 | 20,000 | $0.0008 | **$16.00** |
| 50,000 | 100,000 | $0.0008 | **$80.00** |
| 100,000 | 200,000 | $0.0008 | **$160.00** |

---

## Scenario 2: Moderate Update (With Google Search Grounding)

**Assumptions:**
- 3,000 input tokens (current content + comprehensive search query)
- 2,500 output tokens (detailed updated sections)
- Google Search Grounding enabled (for current/accurate data)

**Cost per Page Update:**
- Input: (3,000 / 1,000,000) × $0.10 = **$0.0003**
- Output: (2,500 / 1,000,000) × $0.40 = **$0.0010**
- Google Search Grounding: **$0.035** per request (after free tier)
- **Total per update: $0.0363**

**Free Tier Calculation:**
- 1,500 free grounded requests per day
- Over 6 months: ~273,750 free requests
- For 10,000 pages: 20,000 updates (all covered by free tier)
- For 50,000 pages: 100,000 updates (all covered by free tier)
- For 100,000 pages: 200,000 updates (all covered by free tier)

| Pages | Updates/Year | Token Cost | Grounding Cost* | Annual Cost |
|-------|--------------|------------|-----------------|-------------|
| 10,000 | 20,000 | $26.00 | $0 (free tier) | **$26.00** |
| 50,000 | 100,000 | $130.00 | $0 (free tier) | **$130.00** |
| 100,000 | 200,000 | $260.00 | $0 (free tier) | **$260.00** |

*If updates are spread throughout the year, all should be covered by free tier

---

## Scenario 3: Comprehensive Update (Full Content Refresh)

**Assumptions:**
- 5,000 input tokens (full assessment data + comprehensive search queries)
- 4,000 output tokens (multiple updated sections: visa, cost of living, healthcare, etc.)
- Google Search Grounding enabled
- Context caching for efficiency

**Cost per Page Update:**
- Input: (5,000 / 1,000,000) × $0.10 = **$0.0005**
- Output: (4,000 / 1,000,000) × $0.40 = **$0.0016**
- Google Search Grounding: **$0.035** (after free tier)
- **Total per update (without caching): $0.0371**

| Pages | Updates/Year | Token Cost | Grounding Cost* | Annual Cost |
|-------|--------------|------------|-----------------|-------------|
| 10,000 | 20,000 | $42.00 | $0 (free tier) | **$42.00** |
| 50,000 | 100,000 | $210.00 | $0 (free tier) | **$210.00** |
| 100,000 | 200,000 | $420.00 | $0 (free tier) | **$420.00** |

---

## Scenario 4: Maximum Coverage (If Free Tier Exceeded)

**If updates exceed 1,500 per day** (need to batch or exceed free tier):

For 100,000 pages with 200,000 updates/year:
- Spread evenly: ~548 updates/day (within free tier)
- Batched twice/year: 100,000 updates over ~3 days = **33,333 updates/day** (exceeds free tier)

**Grounding cost if batching:**
- Free requests: 1,500/day × 6 days = 9,000 free
- Paid requests: 191,000 updates
- Grounding cost: (191,000 / 1,000) × $35 = **$6,685.00**

**Total Annual Cost (100,000 pages, batched):**
- Token cost: $420.00
- Grounding cost: $6,685.00
- **Total: $7,105.00**

---

## Recommended Approach: Staggered Updates

**Strategy:** Spread updates evenly throughout the year to maximize free tier usage

| Pages | Daily Updates Needed | Free Tier Coverage | Annual Cost |
|-------|---------------------|-------------------|-------------|
| 10,000 | ~55/day | ✅ Full coverage | **$26-$42** |
| 50,000 | ~274/day | ✅ Full coverage | **$130-$210** |
| 100,000 | ~548/day | ✅ Full coverage | **$260-$420** |

---

## Cost Summary Table (Annual)

| Scenario | 10,000 Pages | 50,000 Pages | 100,000 Pages |
|----------|--------------|--------------|---------------|
| **Light Update** | $16.00 | $80.00 | $160.00 |
| **Moderate Update** | $26.00 | $130.00 | $260.00 |
| **Comprehensive Update** | $42.00 | $210.00 | $420.00 |
| **Batched (100K only)** | - | - | $7,105.00 |

---

## Recommendations

1. **Use staggered updates** - Spread updates throughout the year to stay within free tier
2. **Use Gemini 2.0 Flash** - Most cost-effective model for this use case
3. **Implement caching** - Cache common queries/templates to reduce token usage
4. **Batch similar destinations** - Group updates by country to reuse context
5. **Monitor usage** - Track token consumption to optimize prompts

---

## Additional Considerations

- **Infrastructure costs:** Cloudflare Workers execution time
- **Database storage:** D1 database storage for updated content
- **API rate limits:** May need to implement queuing/throttling
- **Error handling:** Retry logic may increase costs slightly

---

*Last updated: 2025-01-17*
*Pricing source: Google AI Gemini API Documentation*

