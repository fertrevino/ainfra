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

    // Fetch the full conversation history for this project
    const conversationQuery = `
      SELECT * FROM prompts
      WHERE project_id = $1
      ORDER BY created_at ASC
    `;
    const { rows: conversationHistory } = await pool.query(conversationQuery, [project_id]);

    if (conversationHistory.length === 0) {
      logger.warn('No prompts found for project', { project_id });
      return NextResponse.json(
        { error: 'No conversation history found for this project' },
        { status: 404 }
      );
    }

    // Get the latest user prompt specifically
    const userPrompts = conversationHistory.filter(p => p.role === 'user');
    if (userPrompts.length === 0) {
      logger.warn('No user prompts found for project', { project_id });
      return NextResponse.json(
        { error: 'No user prompts found for this project' },
        { status: 404 }
      );
    }

    const latestUserPrompt = userPrompts[userPrompts.length - 1];
    logger.debug('Conversation history fetched', {
      totalMessages: conversationHistory.length,
      latestUserPrompt: latestUserPrompt.content.substring(0, 100) + '...'
    });

    // Call the FastAPI backend agent endpoint
    const backendUrl = process.env.BACKEND_URL;
    const agentResponse = await fetch(`${backendUrl}/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: latestUserPrompt.content,
        project_id: project_id,
        conversation_history: conversationHistory
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
