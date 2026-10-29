import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('./', import.meta.url));
const output = join(root, 'static-site');
const packages = join(root, 'node_modules');
const assets = {
  'tesseract.min.js': 'tesseract.js/dist/tesseract.min.js',
  'worker.min.js': 'tesseract.js/dist/worker.min.js',
  'tesseract-core-simd-lstm.wasm.js': 'tesseract.js-core/tesseract-core-simd-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm': 'tesseract.js-core/tesseract-core-simd-lstm.wasm',
  'chi_sim.traineddata.gz': '@tesseract.js-data/chi_sim/4.0.0_best_int/chi_sim.traineddata.gz',
  'eng.traineddata.gz': '@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz',
  'tesseract.min.js.LICENSE.txt': 'tesseract.js/dist/tesseract.min.js.LICENSE.txt',
  'worker.min.js.LICENSE.txt': 'tesseract.js/dist/worker.min.js.LICENSE.txt',
  'tesseract-core.LICENSE': 'tesseract.js-core/LICENSE',
};
// Confirm all inputs before replacing a prior build.
await stat(join(root, 'dist/index.html'));
for (const source of Object.values(assets)) await stat(join(packages, source));
await rm(output, { recursive: true, force: true });
await mkdir(join(output, 'ocr'), { recursive: true });
await cp(join(root, 'dist'), output, { recursive: true });
for (const [name, source] of Object.entries(assets)) {
  await cp(join(packages, source), join(output, 'ocr', name));
}
const html = await readFile(join(output, 'index.html'), 'utf8');
if (!html.includes('loadOcrScript')) throw new Error('Expected nonblocking OCR loader');
console.log('Static site ready: static-site/ (homepage, OCR worker, WASM, Chinese and English data)');
