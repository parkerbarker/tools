// R2 Object Storage Demo - File Upload/List
// Route: /api/demo/storage
// Binding: env.DEMO_BUCKET

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Max file size for demo (100KB)
const MAX_FILE_SIZE = 100 * 1024;

export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  
  // Check if R2 is bound
  if (!env.DEMO_BUCKET) {
    return new Response(
      JSON.stringify({
        error: 'R2 not configured',
        hint: 'Run scripts/setup.sh and update wrangler.toml with your bucket binding',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
  
  try {
    const url = new URL(request.url);
    const filename = url.searchParams.get('file');
    
    // GET - List files or download specific file
    if (request.method === 'GET') {
      // If filename specified, download it
      if (filename) {
        const object = await env.DEMO_BUCKET.get(filename);
        
        if (!object) {
          return new Response(
            JSON.stringify({ error: 'File not found' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            }
          );
        }
        
        // Return file info as JSON (not the actual file for simplicity)
        return new Response(
          JSON.stringify({
            filename: filename,
            size: object.size,
            uploaded: object.uploaded?.toISOString(),
            etag: object.etag,
            httpMetadata: object.httpMetadata,
            customMetadata: object.customMetadata,
          }),
          {
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          }
        );
      }
      
      // List all files
      const listed = await env.DEMO_BUCKET.list({ limit: 20 });
      
      const files = listed.objects.map(obj => ({
        name: obj.key,
        size: obj.size,
        uploaded: obj.uploaded?.toISOString(),
      }));
      
      return new Response(
        JSON.stringify({
          files,
          count: files.length,
          truncated: listed.truncated,
          storage: 'R2 (Object Storage)',
        }),
        {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }
    
    // POST - Upload a file
    if (request.method === 'POST') {
      const body = await request.json();
      const { name, content, contentType } = body;
      
      if (!name || !content) {
        return new Response(
          JSON.stringify({ error: 'Name and content are required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          }
        );
      }
      
      // Sanitize filename
      const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
      
      // Decode base64 content
      let fileData;
      try {
        // Content can be base64 or plain text
        if (body.isBase64) {
          fileData = Uint8Array.from(atob(content), c => c.charCodeAt(0));
        } else {
          fileData = new TextEncoder().encode(content);
        }
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid content encoding' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          }
        );
      }
      
      // Check file size
      if (fileData.length > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({ 
            error: `File too large. Max size is ${MAX_FILE_SIZE / 1024}KB for demo.` 
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          }
        );
      }
      
      // Upload to R2
      const object = await env.DEMO_BUCKET.put(safeName, fileData, {
        httpMetadata: {
          contentType: contentType || 'application/octet-stream',
        },
        customMetadata: {
          uploadedBy: 'demo',
          uploadedAt: new Date().toISOString(),
        },
      });
      
      return new Response(
        JSON.stringify({
          success: true,
          file: {
            name: safeName,
            size: fileData.length,
            etag: object.etag,
          },
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }
    
    // DELETE - Delete a file
    if (request.method === 'DELETE') {
      if (!filename) {
        return new Response(
          JSON.stringify({ error: 'Specify file to delete with ?file=filename' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          }
        );
      }
      
      await env.DEMO_BUCKET.delete(filename);
      
      return new Response(
        JSON.stringify({
          success: true,
          deleted: filename,
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
        error: 'R2 error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
}
