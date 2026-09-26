import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./dist/", import.meta.url));
const packageRoot = fileURLToPath(new URL("./node_modules/", import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".gz": "application/gzip",
  ".svg": "image/svg+xml"
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const packagedOcr = {
    "/ocr/tesseract.min.js": "tesseract.js/dist/tesseract.min.js",
    "/ocr/worker.min.js": "tesseract.js/dist/worker.min.js",
    "/ocr/tesseract-core-simd-lstm.wasm.js": "tesseract.js-core/tesseract-core-simd-lstm.wasm.js",
    "/ocr/chi_sim.traineddata.gz": "@tesseract.js-data/chi_sim/4.0.0_best_int/chi_sim.traineddata.gz",
    "/ocr/eng.traineddata.gz": "@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz"
  };
  const packagedPath = packagedOcr[pathname];
  const relative = normalize(pathname).replace(/^([/\\])+/, "");
  let file = packagedPath ? join(packageRoot, packagedPath) : join(root, relative || "index.html");
  const allowedRoot = packagedPath ? packageRoot : root;
  if (!file.startsWith(allowedRoot) || !existsSync(file) || statSync(file).isDirectory()) {
    file = join(root, "index.html");
  }
  response.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
  response.setHeader("Cache-Control", file.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable");
  createReadStream(file).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`Beisen attendance checker listening on port ${port}`);
});
