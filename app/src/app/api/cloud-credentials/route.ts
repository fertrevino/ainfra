import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import logger from '@/lib/logger';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');

        if (!user_id) {
            logger.warn({ url: request.url }, '[GET /api/cloud-credentials] Missing user_id parameter');
            return NextResponse.json({ error: 'Missing user_id parameter' }, { status: 400 });
        }

        const { rows } = await pool.query(
            `SELECT * FROM cloud_credentials WHERE user_id = $1`, [user_id]
        );

        logger.info({ user_id: user_id }, '[GET /api/cloud-credentials] Success');
        return NextResponse.json({ credentials: rows });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('[GET /api/cloud-credentials] Exception:', err);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user_id, name, provider, credentials } = body;

        if (!user_id || !name || !provider || !credentials) {
            return NextResponse.json(
                { error: 'Missing required fields: user_id, name, provider, credentials' },
                { status: 400 }
            );
        }

        // Validate provider
        if (!['aws', 'azure', 'gcp'].includes(provider)) {
            return NextResponse.json(
                { error: 'Invalid provider. Must be aws, azure, or gcp' },
                { status: 400 }
            );
        }

        const { rows } = await pool.query(
            `SELECT id FROM cloud_credentials WHERE user_id = $1 AND name = $2`,
            [user_id, name]
        );

        if (rows.length > 0) {
            return NextResponse.json(
                { error: 'A credential set with this name already exists' },
                { status: 409 }
            );
        }

        const res = await pool.query(
            `INSERT INTO cloud_credentials (user_id, name, provider, credentials, is_active)
       VALUES ($1, $2, $3, $4, false)
       RETURNING *`,
            [user_id, name, provider, credentials]
        );

        return NextResponse.json({ credential: res.rows[0] }, { status: 201 });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error occurred';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// PUT - Update existing cloud credentials
export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();
        const { name, credentials } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }

        if (!name || !credentials) {
            return NextResponse.json(
                { error: 'Missing required fields: name, credentials' },
                { status: 400 }
            );
        }

        const res = await pool.query(
            `UPDATE cloud_credentials
             SET name = $1, credentials = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING *`,
            [name, credentials, id]
        );

        return NextResponse.json({ credential: res.rows[0] }, { status: 200 });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error occurred';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }

        const res = await pool.query(
            `DELETE FROM cloud_credentials WHERE id = $1 RETURNING *`,
            [id]
        );

        return NextResponse.json({ message: 'Credentials deleted successfully' });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error occurred';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
