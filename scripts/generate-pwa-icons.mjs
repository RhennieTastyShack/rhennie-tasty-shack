import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "public", "images", "logo.png");
const cream = { r: 248, g: 246, b: 242, alpha: 1 };

async function squarePng(size, outPath, { paddingRatio = 0.12 } = {}) {
  const pad = Math.round(size * paddingRatio);
  const inner = size - pad * 2;
  const resized = await sharp(src)
    .resize(inner, inner, {
      fit: "contain",
      background: cream,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: cream,
    },
  })
    .composite([{ input: resized, left: pad, top: pad }])
    .png()
    .toFile(outPath);

  console.log("wrote", path.relative(root, outPath), size);
}

async function faviconIco(outPath) {
  // Multi-size ICO via PNG pages sharp supports through toFormat ico on some builds;
  // fall back to 32x32 PNG embedded as .ico-compatible single PNG renamed if needed.
  const png32 = await sharp(src)
    .resize(32, 32, { fit: "contain", background: cream })
    .png()
    .toBuffer();

  try {
    await sharp(png32).toFormat("ico").toFile(outPath);
    console.log("wrote", path.relative(root, outPath), "(ico)");
  } catch {
    // Sharp may not support ico; write a valid multi-size ICO manually from PNGs.
    const sizes = [16, 32, 48];
    const images = [];
    for (const size of sizes) {
      const buf = await sharp(src)
        .resize(size, size, { fit: "contain", background: cream })
        .png()
        .toBuffer();
      images.push({ size, buf });
    }
    const headerSize = 6 + 16 * images.length;
    let offset = headerSize;
    const entries = [];
    const payloads = [];
    for (const img of images) {
      entries.push({ size: img.size, bytes: img.buf.length, offset });
      payloads.push(img.buf);
      offset += img.buf.length;
    }
    const total = offset;
    const out = Buffer.alloc(total);
    out.writeUInt16LE(0, 0);
    out.writeUInt16LE(1, 2);
    out.writeUInt16LE(images.length, 4);
    let entryAt = 6;
    for (const e of entries) {
      out.writeUInt8(e.size === 256 ? 0 : e.size, entryAt);
      out.writeUInt8(e.size === 256 ? 0 : e.size, entryAt + 1);
      out.writeUInt8(0, entryAt + 2);
      out.writeUInt8(0, entryAt + 3);
      out.writeUInt16LE(1, entryAt + 4);
      out.writeUInt16LE(32, entryAt + 6);
      out.writeUInt32LE(e.bytes, entryAt + 8);
      out.writeUInt32LE(e.offset, entryAt + 12);
      entryAt += 16;
    }
    let writeAt = headerSize;
    for (const p of payloads) {
      p.copy(out, writeAt);
      writeAt += p.length;
    }
    await writeFile(outPath, out);
    console.log("wrote", path.relative(root, outPath), "(ico manual)");
  }
}

async function main() {
  await mkdir(path.join(root, "public"), { recursive: true });
  await mkdir(path.join(root, "app"), { recursive: true });

  await squarePng(16, path.join(root, "public", "favicon-16.png"), {
    paddingRatio: 0.08,
  });
  await squarePng(32, path.join(root, "public", "favicon-32.png"), {
    paddingRatio: 0.08,
  });
  await squarePng(48, path.join(root, "public", "favicon-48.png"), {
    paddingRatio: 0.08,
  });
  await squarePng(180, path.join(root, "public", "apple-icon.png"), {
    paddingRatio: 0.1,
  });
  await squarePng(180, path.join(root, "app", "apple-icon.png"), {
    paddingRatio: 0.1,
  });
  await squarePng(192, path.join(root, "public", "icon-192.png"), {
    paddingRatio: 0.12,
  });
  await squarePng(512, path.join(root, "public", "icon-512.png"), {
    paddingRatio: 0.12,
  });
  // Maskable-friendly with more safe-zone padding
  await squarePng(512, path.join(root, "public", "icon-512-maskable.png"), {
    paddingRatio: 0.18,
  });
  await squarePng(32, path.join(root, "app", "icon.png"), {
    paddingRatio: 0.08,
  });

  await faviconIco(path.join(root, "public", "favicon.ico"));
  await faviconIco(path.join(root, "app", "favicon.ico"));

  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
