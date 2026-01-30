// D1 SQLite Database Demo - Guestbook
// Route: /api/demo/db
// Binding: env.DB

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Initialize the guestbook table if it doesn't exist
async function initializeDB(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  
  // Check if D1 is bound
  if (!env.DB) {
    return new Response(
      JSON.stringify({
        error: 'D1 not configured',
        hint: 'Run scripts/setup.sh and update wrangler.toml with your database_id',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
  
  try {
    // Initialize table on first request
    await initializeDB(env.DB);
    
    const url = new URL(request.url);
    
    // GET - List all guestbook entries
    if (request.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit')) || 10;
      
      const { results } = await env.DB.prepare(
        'SELECT * FROM guestbook ORDER BY created_at DESC LIMIT ?'
      ).bind(limit).all();
      
      return new Response(
        JSON.stringify({
          entries: results,
          count: results.length,
          database: 'D1 (SQLite)',
        }),
        {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }
    
    // POST - Add a new entry
    if (request.method === 'POST') {
      const body = await request.json();
      const { name, message } = body;
      
      if (!name || !message) {
        return new Response(
          JSON.stringify({ error: 'Name and message are required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          }
        );
      }
      
      const { success, meta } = await env.DB.prepare(
        'INSERT INTO guestbook (name, message) VALUES (?, ?)'
      ).bind(name.slice(0, 100), message.slice(0, 500)).run();
      
      if (success) {
        // Fetch the newly created entry
        const { results } = await env.DB.prepare(
          'SELECT * FROM guestbook WHERE id = ?'
        ).bind(meta?.last_row_id).all();
        
        return new Response(
          JSON.stringify({
            success: true,
            entry: results[0],
            meta: {
              rows_written: meta?.rows_written ?? meta?.changes ?? 1,
              duration_ms: meta?.duration ?? null,
            },
          }),
          {
            status: 201,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          }
        );
      }
    }
    
    // DELETE - Clear all entries (with confirmation)
    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const confirm = url.searchParams.get('confirm');
      
      if (confirm !== 'true') {
        return new Response(
          JSON.stringify({ error: 'Add ?confirm=true to delete all entries' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          }
        );
      }
      
      const { meta } = await env.DB.prepare('DELETE FROM guestbook').run();
      
      return new Response(
        JSON.stringify({
          success: true,
          deleted: meta?.rows_written ?? meta?.changes ?? 0,
        }),
        {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Database error',
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
}
