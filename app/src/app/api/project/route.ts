import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import logger from '@/lib/logger';

const OWNER_ID = '00000000-0000-0000-0000-000000000000'; // Default owner ID

export async function GET(request: Request) {
  try {
    logger.info('Fetching all projects');
    const { rows } = await pool.query(
      `SELECT * FROM projects WHERE deleted_on IS NULL ORDER BY created_at DESC`
    );
    logger.debug({ projects: rows }, 'Fetched projects');
    return NextResponse.json({ projects: rows });
  } catch (error: any) {
    logger.error({ err: error }, 'Error fetching projects');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name) {
    logger.warn('Missing name in project creation request');
    return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  }
  try {
    logger.info({ name }, 'Inserting new project');
    const { rows } = await pool.query(
      `INSERT INTO projects (name, owner_id) VALUES ($1, $2) RETURNING *`,
      [name, OWNER_ID]
    );
    logger.debug({ project: rows[0] }, 'Inserted project');
    return NextResponse.json({ project: rows[0] });
  } catch (error: any) {
    logger.error({ err: error }, 'Error inserting project');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name } = await request.json();
    if (!id || !name) {
      return NextResponse.json({ error: 'Missing id or name' }, { status: 400 });
    }
    logger.info({ id, name }, 'Updating project');
    const { rows } = await pool.query(
      `UPDATE projects SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    logger.debug({ project: rows[0] }, 'Updated project');
    return NextResponse.json({ project: rows[0] });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }
    logger.info({ id }, 'Soft deleting project');
    const { rows } = await pool.query(
      `UPDATE projects SET deleted_on = $1 WHERE id = $2 RETURNING *`,
      [new Date().toISOString(), id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    logger.debug({ project: rows[0] }, 'Soft deleted project');
    return NextResponse.json({ success: true, project: rows[0] });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
