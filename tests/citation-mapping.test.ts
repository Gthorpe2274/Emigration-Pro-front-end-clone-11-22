import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getReferencedCitationIndexes,
  keepReferencedSources,
  normalizeCitationUrl,
  reconcileCitationMarkers,
  type IndexedReportSource,
} from '../src/worker/citation-mapping.ts';

const sources: IndexedReportSource[] = [
  { title: 'One', uri: 'https://example.gov/one', citationIndex: 1 },
  { title: 'Two', uri: 'https://example.gov/two', citationIndex: 2 },
  { title: 'Three', uri: 'https://example.gov/three', citationIndex: 3 },
  { title: 'Four', uri: 'https://example.gov/four', citationIndex: 4 },
];

test('keeps only citations actually referenced by the report text', () => {
  assert.deepEqual([...getReferencedCitationIndexes('Claim [2]. More [4, 2].', 4)], [2, 4]);
  assert.deepEqual(keepReferencedSources('Claim [2]. More [4].', sources).map(source => source.citationIndex), [2, 4]);
});

test('keeps all provider citations when structured content has no inline markers', () => {
  assert.equal(keepReferencedSources('{"budgetItems":[]}', sources).length, 4);
});

test('renumbers retained citations and removes references to rejected URLs', () => {
  const retained = [sources[1], sources[3]];
  assert.equal(
    reconcileCitationMarkers('First [1]. Second [2]. Combined [2, 3, 4].', retained, 4),
    'First . Second [1]. Combined [1, 2].',
  );
});

test('normalizes fragments and trailing slashes for search-result title matching', () => {
  assert.equal(
    normalizeCitationUrl('https://example.gov/path/#details'),
    'https://example.gov/path',
  );
});
