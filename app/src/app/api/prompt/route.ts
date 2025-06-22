import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import logger from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      logger.warn('Missing project_id in prompt fetch request');
      return NextResponse.json({ error: 'Missing project_id' }, { status: 400 });
    }

    logger.info('Fetching prompts', { projectId });

    const query = `SELECT * FROM prompts WHERE project_id = $1 ORDER BY created_at DESC`;
    const params = [projectId];

    const { rows } = await pool.query(query, params);
    logger.debug({ prompts: rows }, 'Fetched prompts');
    return NextResponse.json({ prompts: rows });
  } catch (error: any) {
    logger.error({ err: error }, 'Error fetching prompts');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id, role, content } = body;

    if (!project_id || !content) {
      logger.warn(`Missing required fields: project_id=${project_id} content=${!!content}`);
      return NextResponse.json(
        { error: 'Missing required fields: project_id, user_id, content' },
        { status: 400 }
      );
    }

    const promptInsertQuery = `
            INSERT INTO prompts (project_id, role, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
    const promptInsertParams = [
      project_id,
      role || 'user',
      content
    ];

    const { rows: promptRows } = await pool.query(promptInsertQuery, promptInsertParams);

    return NextResponse.json({
      prompt: promptRows[0],
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error(`POST /api/prompt error=${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
