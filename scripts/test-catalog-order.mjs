import assert from 'node:assert/strict';
import {
  CATEGORY_PRESETS,
  sortProductsByOrder,
  applyProductPosition,
  slugifyProductId,
} from '../app/lib/catalog-order.ts';

assert.ok(
  CATEGORY_PRESETS.some((c) => c.category === 'Chenille stems' && c.categoryBn === 'পাইপ ক্লিনার'),
  'CATEGORY_PRESETS includes canonical bilingual categories'
);

const sample = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
const sorted = sortProductsByOrder(sample, ['c', 'a'], ['b', 'a', 'c']);
assert.deepEqual(
  sorted.map((p) => p.id),
  ['c', 'a', 'b'],
  'Custom order comes first, fallback order determines unranked tail'
);

const moved = applyProductPosition(['a', 'b', 'c'], 'c', 1);
assert.deepEqual(moved, ['c', 'a', 'b'], 'Moves existing item to position 1');

const inserted = applyProductPosition(['a', 'b'], 'new-item', 2);
assert.deepEqual(inserted, ['a', 'new-item', 'b'], 'Inserts new item at 1-based position 2');

const clamped = applyProductPosition(['a', 'b'], 'new-item', 99);
assert.deepEqual(clamped, ['a', 'b', 'new-item'], 'Clamps oversized position to end');

assert.equal(slugifyProductId('Pastel Pink Ribbon (2m)', new Set()), 'pastel-pink-ribbon-2m');
assert.equal(
  slugifyProductId('Pastel Pink Ribbon (2m)', new Set(['pastel-pink-ribbon-2m'])),
  'pastel-pink-ribbon-2m-2'
);
assert.ok(/^[a-z0-9][a-z0-9-]{0,99}$/.test(slugifyProductId('রিবন প্যাক', new Set())));

console.log('PASS all catalog ordering and preset checks');
