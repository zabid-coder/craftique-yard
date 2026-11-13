import fs from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://handicraftcobd.live';
const imageDirectory = path.resolve('public/images');
const products = [];
const decode = s => s.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').trim();
for (const page of [1,2,3,4,5,6]) {
  const url = `${origin}/store/brandon?page=${page}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Catalog page ${page}: ${response.status}`);
  const html = await response.text();
  const matches = [...html.matchAll(/<img\s[^>]*src="([^"]*\/is_cover_image\/[^\"]*)"[^>]*alt="([^"]*)"[^>]*>/g)];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const before = html.slice(Math.max(0,match.index - 1100),match.index);
    const slug = [...before.matchAll(/href="[^\"]*\/product\/([^\"]+)"/g)].at(-1)?.[1];
    const after = html.slice(match.index, matches[i+1]?.index ?? match.index + 5000);
    const price = Number(after.match(/BDT\s*([\d.]+)/)?.[1]);
    if (!slug || !Number.isFinite(price) || price <= 0) throw new Error(`Invalid product: ${match[2]}`);
    const src = new URL(decode(match[1]),origin).href;
    const extension = path.extname(new URL(src).pathname).toLowerCase() || '.jpg';
    const image = `/images/product-${slug}${extension}`;
    const target = path.resolve(`public${image}`);
    try { await fs.access(target); } catch {
      const asset = await fetch(src);
      if (!asset.ok) throw new Error(`Image ${slug}: ${asset.status}`);
      await fs.writeFile(target, Buffer.from(await asset.arrayBuffer()));
    }
    products.push({id:slug,name:decode(match[2]),price,image,sourceUrl:`${origin}/store/brandon/product/${slug}`,referenceAvailable:!after.includes('Out of Stock')});
  }
  console.log(`Imported page ${page}: ${matches.length} products`);
}
if (new Set(products.map(p=>p.id)).size !== 104) throw new Error(`Expected 104 unique products, got ${products.length}`);
await fs.mkdir('research',{recursive:true});
await fs.writeFile('research/catalog.json',JSON.stringify(products,null,2));
console.log(`Saved ${products.length} products and local images`);
