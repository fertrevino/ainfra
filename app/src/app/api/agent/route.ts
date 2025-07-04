import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import logger from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id } = body;

    if (!project_id) {
      logger.warn('Missing project_id in agent process request');
      return NextResponse.json(
        { error: 'Missing required field: project_id' },
        { status: 400 }
      );
    }

    logger.info('Processing agent for project', { project_id });

    // Fetch the latest user prompt for this project
    const latestPromptQuery = `
      SELECT * FROM prompts
      WHERE project_id = $1 AND role = 'user'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const { rows: promptRows } = await pool.query(latestPromptQuery, [project_id]);

    if (promptRows.length === 0) {
      logger.warn('No user prompts found for project', { project_id });
      return NextResponse.json(
        { error: 'No user prompts found for this project' },
        { status: 404 }
      );
    }

    const latestPrompt = promptRows[0];
    logger.debug('Latest prompt found', { prompt: latestPrompt });

    // Call the FastAPI backend agent endpoint
    const backendUrl = process.env.BACKEND_URL;
    const agentResponse = await fetch(`${backendUrl}/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: latestPrompt.content,
        project_id: project_id
      }),
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      logger.error('Agent backend error', {
        status: agentResponse.status,
        error: errorText
      });
      return NextResponse.json(
        { error: 'Agent processing failed' },
        { status: 500 }
      );
    }

    const agentResult = await agentResponse.json();
    logger.debug('Agent response received', { agentResult });

    // Store the agent's response as a new prompt with role 'assistant'
    const assistantPromptQuery = `
      INSERT INTO prompts (project_id, role, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const assistantPromptParams = [
      project_id,
      'assistant',
      agentResult.response
    ];

    const { rows: assistantRows } = await pool.query(
      assistantPromptQuery,
      assistantPromptParams
    );

    logger.info('Agent response stored successfully', {
      prompt_id: assistantRows[0].id
    });

    return NextResponse.json({
      success: true,
      agent_response: agentResult.response,
      prompt: assistantRows[0]
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error(`POST /api/agent error=${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
