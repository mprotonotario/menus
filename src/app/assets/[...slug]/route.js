import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

export async function GET(request, { params }) {
  try {
    const slug = params?.slug || [];
    if (!slug.length) {
      return new NextResponse('Not found', { status: 404 });
    }

    const relativePath = slug.join('/');
    const parsed = path.parse(relativePath);
    const searchDirs = [
      path.join(process.cwd(), 'assets'),
      path.join(process.cwd(), 'public', 'assets'),
      path.join(process.cwd(), 'public'),
    ];

    // Candidatos de extensiones alternativas (jpg, jpeg, png, webp, svg)
    const extAlternatives = [
      parsed.ext.toLowerCase(),
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.svg',
    ].filter(Boolean);
    const uniqueExts = [...new Set(extAlternatives)];

    let targetFilePath = null;
    let foundExt = parsed.ext.toLowerCase();

    // 1. Buscar coincidencia exacta
    for (const dir of searchDirs) {
      const p = path.join(dir, relativePath);
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        targetFilePath = p;
        foundExt = path.extname(p).toLowerCase();
        break;
      }
    }

    // 2. Si no se encontró exacto, buscar con extensiones alternativas (ej. .jpg <-> .png)
    if (!targetFilePath) {
      for (const dir of searchDirs) {
        for (const ext of uniqueExts) {
          const altPath = path.join(dir, parsed.dir, `${parsed.name}${ext}`);
          if (fs.existsSync(altPath) && fs.statSync(altPath).isFile()) {
            targetFilePath = altPath;
            foundExt = ext;
            break;
          }
        }
        if (targetFilePath) break;
      }
    }

    if (!targetFilePath) {
      return new NextResponse('Asset not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(targetFilePath);
    const contentType = MIME_TYPES[foundExt] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('Error serving asset:', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
