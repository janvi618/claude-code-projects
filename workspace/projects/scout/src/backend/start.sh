#!/bin/bash
set -e

echo "Running database schema..."
python3 -c "
import asyncio
import asyncpg
import os

async def init_db():
    conn = await asyncpg.connect(os.environ['DATABASE_URL'].replace('+asyncpg', ''))
    with open('schema.sql', 'r') as f:
        schema = f.read()
    await conn.execute(schema)
    await conn.close()
    print('Schema applied.')

asyncio.run(init_db())
" || echo "Schema already exists or skipped."

echo "Starting SCOUT backend..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 1
