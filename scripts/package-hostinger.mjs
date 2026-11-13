import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'dist-hostinger');
const outZip = path.join(outDir, 'craftique-yard-hostinger.zip');

fs.mkdirSync(outDir, { recursive: true });
if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

const excludes = [
  'node_modules',
  '*/node_modules',
  '.next',
  '*/.next',
  '.local-data',
  '.pdf-deps',
  '.sites-runtime',
  '.git',
  'dist-hostinger',
  'docs',
  'ADMIN-ACCESS.txt',
  '.env.local',
  '*.zip',
  'research/*.pdf',
  'research/image-review-*',
  '.DS_Store',
  '._*',
];

const isWindows = process.platform === 'win32';

try {
  if (isWindows) {
    // Windows 10/11 native tar with zip extension
    const args = ['-a', '-c', '-f', outZip];
    for (const pattern of excludes) {
      args.push(`--exclude=${pattern}`);
    }
    args.push('*');
    execFileSync('tar.exe', args, { cwd: root, stdio: 'inherit' });
  } else {
    const args = ['-r', '-q', outZip, '.'];
    for (const pattern of excludes) {
      args.push('-x', `${pattern}/*`, '-x', pattern);
    }
    execFileSync('zip', args, { cwd: root, stdio: 'inherit' });
  }
  const sizeMb = (fs.statSync(outZip).size / (1024 * 1024)).toFixed(2);
  console.log(`Created clean Hostinger upload archive: ${outZip} (${sizeMb} MB)`);
} catch (err) {
  console.error('Packaging failed:', err.message);
  process.exit(1);
}
