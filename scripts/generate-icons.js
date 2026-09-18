import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const toCrc = Buffer.concat([typeBuf, data]);
  const crc = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createFinancialAppIcon(size, isMaskable = false) {
  // RGBA buffer: size * (1 + size * 4) bytes
  const rowSize = 1 + size * 4;
  const rawData = Buffer.alloc(size * rowSize);

  const center = size / 2;
  const radius = isMaskable ? size * 0.46 : size * 0.44;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: none
    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background gradient: Deep slate/emerald (#041e17 to #0f172a)
      const gradT = (y / size);
      let bgR = Math.round(15 + 5 * (1 - gradT));
      let bgG = Math.round(23 + 35 * (1 - gradT));
      let bgB = Math.round(42 - 10 * gradT);
      let bgA = 255;

      // Outer rounded border or circular boundary if not maskable
      if (!isMaskable) {
        const cornerDist = Math.max(Math.abs(dx), Math.abs(dy));
        // Soft rounded rect
        const rx = Math.max(0, Math.abs(dx) - (size * 0.36));
        const ry = Math.max(0, Math.abs(dy) - (size * 0.36));
        const rDist = Math.sqrt(rx * rx + ry * ry);
        const maxR = size * 0.12;
        if (rDist > maxR) {
          // outside rounded rect
          rawData[pxOffset] = 0;
          rawData[pxOffset + 1] = 0;
          rawData[pxOffset + 2] = 0;
          rawData[pxOffset + 3] = 0;
          continue;
        }
      }

      // Draw emblem in center: A sleek glowing emerald circle with currency / growth symbol
      const innerScale = isMaskable ? 0.72 : 0.8;
      const innerEmblemDist = dist / (center * innerScale);

      let r = bgR;
      let g = bgG;
      let b = bgB;
      let a = bgA;

      // Concentric metallic emerald ring
      if (innerEmblemDist >= 0.78 && innerEmblemDist <= 0.88) {
        // Gold/Emerald border ring
        r = 16;
        g = 185;
        b = 129; // Emerald-500
      } else if (innerEmblemDist < 0.78) {
        // Inner badge background: emerald-950
        r = 6;
        g = 44;
        b = 35;

        // Draw Stylized '₦' or Growth Vault Shield
        // Center vertical double bars and 'N' or shield
        const nx = dx / (size * 0.3);
        const ny = dy / (size * 0.3);

        // Stylized N glyph:
        const inLeftCol = (nx >= -0.55 && nx <= -0.32 && Math.abs(ny) <= 0.55);
        const inRightCol = (nx >= 0.32 && nx <= 0.55 && Math.abs(ny) <= 0.55);
        // Diagonal: from (-0.45, -0.5) to (0.45, 0.5)
        const diagDist = Math.abs(ny - (nx * 1.15));
        const inDiag = (diagDist <= 0.16 && nx >= -0.45 && nx <= 0.45 && Math.abs(ny) <= 0.55);

        // Horizontal cross-strokes for Naira currency '₦'
        const inHBar1 = (Math.abs(ny - (-0.12)) <= 0.05 && nx >= -0.65 && nx <= 0.65);
        const inHBar2 = (Math.abs(ny - (0.12)) <= 0.05 && nx >= -0.65 && nx <= 0.65);

        if (inLeftCol || inRightCol || inDiag || inHBar1 || inHBar2) {
          // Crisp bright emerald-400 / gold
          r = 52;
          g = 211;
          b = 153;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression: deflate
  ihdrData[11] = 0; // Filter: default
  ihdrData[12] = 0; // Interlace: none
  const ihdr = makeChunk('IHDR', ihdrData);

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate 192x192 PNG
const pwa192 = createFinancialAppIcon(192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// 2. Generate 512x512 PNG
const pwa512 = createFinancialAppIcon(512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// 3. Generate 512x512 Maskable PNG
const pwaMaskable = createFinancialAppIcon(512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

// 4. Generate 180x180 Apple Touch Icon
const appleTouch = createFinancialAppIcon(180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

// 5. Generate Favicon
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createFinancialAppIcon(64, false));

console.log('Successfully generated all PWA icon assets in /public!');
