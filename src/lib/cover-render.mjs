/**
 * Renders cover SVGs to PNG outside the browser (share images, previews).
 *
 * Scene covers contain JetBrains Mono text. resvg only reads TrueType/OpenType
 * files, and @fontsource ships WOFF, so the WOFF files are unpacked to plain
 * TTF in the OS temp folder once per build.
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);

/** WOFF 1.0 → TTF: the same tables, decompressed, behind a plain sfnt header. */
function woffToTtf(woff) {
  const flavor = woff.readUInt32BE(4);
  const numTables = woff.readUInt16BE(12);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const e = 44 + i * 20;
    const tag = woff.readUInt32BE(e);
    const offset = woff.readUInt32BE(e + 4);
    const compLength = woff.readUInt32BE(e + 8);
    const origLength = woff.readUInt32BE(e + 12);
    const checksum = woff.readUInt32BE(e + 16);
    const raw = woff.subarray(offset, offset + compLength);
    const data = compLength < origLength ? inflateSync(raw) : raw;
    tables.push({ tag, checksum, data });
  }
  const pow = 2 ** Math.floor(Math.log2(numTables));
  const header = Buffer.alloc(12 + numTables * 16);
  header.writeUInt32BE(flavor, 0);
  header.writeUInt16BE(numTables, 4);
  header.writeUInt16BE(pow * 16, 6);
  header.writeUInt16BE(Math.log2(pow), 8);
  header.writeUInt16BE(numTables * 16 - pow * 16, 10);
  let offset = header.length;
  const bodies = [];
  tables.forEach(({ tag, checksum, data }, i) => {
    const e = 12 + i * 16;
    header.writeUInt32BE(tag, e);
    header.writeUInt32BE(checksum, e + 4);
    header.writeUInt32BE(offset, e + 8);
    header.writeUInt32BE(data.length, e + 12);
    const padded = Buffer.alloc(Math.ceil(data.length / 4) * 4);
    data.copy(padded);
    bodies.push(padded);
    offset += padded.length;
  });
  return Buffer.concat([header, ...bodies]);
}

let fontFiles;
async function coverFonts() {
  if (fontFiles) return fontFiles;
  const dir = path.join(tmpdir(), 'jdegbau-cover-fonts');
  await mkdir(dir, { recursive: true });
  fontFiles = await Promise.all(
    [500, 700].map(async (weight) => {
      const name = `jetbrains-mono-latin-${weight}-normal`;
      const out = path.join(dir, `${name}.ttf`);
      try {
        await access(out);
      } catch {
        const woff = await readFile(require.resolve(`@fontsource/jetbrains-mono/files/${name}.woff`));
        await writeFile(out, woffToTtf(woff));
      }
      return out;
    }),
  );
  return fontFiles;
}

const publicDir = fileURLToPath(new URL('../../public/', import.meta.url));

/**
 * A cover SVG string → PNG buffer at `width` pixels wide. Images on the
 * cover (`scene: image`) are site paths like /assets/img/covers/x.jpg and
 * are read from public/.
 */
export async function renderCoverPng(svg, width) {
  const files = await coverFonts();
  // resvg only reads images that are inline, so site paths become data URIs.
  const hrefs = [...new Set([...svg.matchAll(/<image\b[^>]*?\shref="(\/[^"]+)"/g)].map((m) => m[1]))];
  for (const href of hrefs) {
    const file = path.join(publicDir, decodeURI(href.replace(/^\/+/, '').split(/[?#]/)[0]));
    if (!file.startsWith(publicDir)) throw new Error(`Cover image outside public/: ${href}`);
    let data;
    try {
      data = await readFile(file);
    } catch (error) {
      throw new Error(`Cover image ${href} not found in public/ (${error.code ?? error.message}).`);
    }
    const type = /\.png$/i.test(file) ? 'image/png' : 'image/jpeg';
    svg = svg.replaceAll(`href="${href}"`, `href="data:${type};base64,${data.toString('base64')}"`);
  }
  return new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles: files, loadSystemFonts: false, defaultFontFamily: 'JetBrains Mono' },
  }).render().asPng();
}
