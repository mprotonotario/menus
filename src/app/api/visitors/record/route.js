import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { extractClientIp, recordVisitorAccess, getVisitorsStats } from '../../../../utils/visitorLogger';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return handleLogRequest(request);
}

export async function POST(request) {
  return handleLogRequest(request);
}

async function handleLogRequest(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Consulta de estadísticas para el panel administrativo
    if (searchParams.get('stats') === 'true' || searchParams.get('action') === 'stats') {
      const stats = getVisitorsStats();
      return NextResponse.json({
        success: true,
        stats,
      });
    }

    // Si se pide ver el log directamente en texto plano
    if (searchParams.get('view') === 'raw' || searchParams.get('format') === 'text') {
      const logFilePath = path.join(process.cwd(), 'logs', 'visitors.log');
      if (fs.existsSync(logFilePath)) {
        const text = fs.readFileSync(logFilePath, 'utf8');
        return new NextResponse(text, {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
      return new NextResponse('Aún no hay visitas registradas en logs/visitors.log', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const headers = request.headers;
    const ip = extractClientIp(headers);
    const userAgent = headers.get('user-agent') || '';

    let pathVisited = '/';
    try {
      if (request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        if (body?.path) pathVisited = body.path;
      } else {
        pathVisited = searchParams.get('path') || '/';
      }
    } catch {}

    const result = recordVisitorAccess({
      ip,
      userAgent,
      pathVisited,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error registrando visitante en log:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
