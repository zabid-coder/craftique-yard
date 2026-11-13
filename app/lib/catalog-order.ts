export type CategoryPreset = {
  category: string;
  categoryBn: string;
};

export const CATEGORY_PRESETS: CategoryPreset[] = [
  { category: 'Chenille stems', categoryBn: 'পাইপ ক্লিনার' },
  { category: 'Ribbons', categoryBn: 'রিবন' },
  { category: 'Wrapping paper', categoryBn: 'র‍্যাপিং পেপার' },
  { category: 'Bouquet bags', categoryBn: 'বুকেট ব্যাগ' },
  { category: 'Bouquet mesh', categoryBn: 'বুকেট মেশ' },
  { category: 'Fairy lights', categoryBn: 'ফেয়ারি লাইট' },
  { category: 'Floral tape', categoryBn: 'ফ্লোরাল টেপ' },
  { category: 'Flower stamens', categoryBn: 'ফুলের রেণু' },
  { category: 'Tools & accessories', categoryBn: 'টুলস ও অ্যাকসেসরিজ' },
];

/**
 * Sorts products by saved custom order, then fallback order, preserving original relative order for ties.
 */
export function sortProductsByOrder<T extends { id: string }>(
  products: T[],
  customOrder: string[] | null,
  fallbackOrder: string[]
): T[] {
  const rank = new Map<string, number>();
  let nextRank = 0;

  if (customOrder) {
    for (const id of customOrder) {
      if (!rank.has(id)) rank.set(id, nextRank++);
    }
  }
  for (const id of fallbackOrder) {
    if (!rank.has(id)) rank.set(id, nextRank++);
  }

  return [...products].sort((a, b) => {
    const ar = rank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const br = rank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return ar - br;
  });
}

/**
 * Inserts or moves a product ID to a 1-based serial position inside a deduplicated order list.
 */
export function applyProductPosition(order: string[], id: string, position: number): string[] {
  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const item of order) {
    if (item && item !== id && !seen.has(item)) {
      seen.add(item);
      deduped.push(item);
    }
  }
  const index = Math.max(0, Math.min(deduped.length, Math.floor(position) - 1));
  deduped.splice(index, 0, id);
  return deduped;
}

/**
 * Generates a unique schema-safe product ID slug from an English or mixed product name.
 */
export function slugifyProductId(name: string, existingIds: Set<string>): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 88);
  const base = cleaned || `item-${Date.now().toString(36)}`;
  if (!existingIds.has(base)) return base;

  let suffix = 2;
  while (suffix < 10000) {
    const tail = `-${suffix}`;
    const candidate = `${base.slice(0, 100 - tail.length)}${tail}`;
    if (!existingIds.has(candidate)) return candidate;
    suffix++;
  }
  return `item-${Date.now().toString(36)}`;
}
