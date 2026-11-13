import sharp from "sharp";
import fs from "node:fs/promises";
const entries=JSON.parse(await fs.readFile("research/generated-home-sources.json","utf8"));
const mapping={};
for(const e of entries){await sharp(e.path).resize({width:1200,withoutEnlargement:true}).webp({quality:90}).toFile(`public/images/home-${e.id}.webp`);mapping[e.id]=`/images/home-${e.id}.webp`;}
await fs.writeFile("research/home-images.json",JSON.stringify(mapping,null,2)+"\n");
let page=await fs.readFile("app/storefront.tsx","utf8");
for(const e of entries){page=page.replaceAll(`/images/product-${e.id}.jpg`,mapping[e.id]).replaceAll(`/images/product-${e.id}.png`,mapping[e.id]);}
await fs.writeFile("app/storefront.tsx",page);
console.log(`Installed ${entries.length} homepage images`);
