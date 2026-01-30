// Workers AI Demo - Text Generation & Analysis
// Route: /api/demo/ai
// Binding: env.AI

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Available tasks and their models
const TASKS = {
  // Text generation - conversational
  chat: {
    model: '@cf/meta/llama-3.1-8b-instruct',
    description: 'Chat/conversation completion',
  },
  // Text summarization
  summarize: {
    model: '@cf/facebook/bart-large-cnn',
    description: 'Summarize long text',
  },
  // Sentiment analysis
  sentiment: {
    model: '@cf/huggingface/distilbert-sst-2-int8',
    description: 'Analyze text sentiment',
  },
  // Translation
  translate: {
    model: '@cf/meta/m2m100-1.2b',
    description: 'Translate between languages',
  },
};

export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  
  // Only POST allowed
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'POST required',
        availableTasks: Object.entries(TASKS).map(([key, val]) => ({
          task: key,
          description: val.description,
        })),
      }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
  
  // Check if AI is bound
  if (!env.AI) {
    return new Response(
      JSON.stringify({
        error: 'Workers AI not configured',
        hint: 'Add [ai] binding to wrangler.toml',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
  
  try {
    const body = await request.json();
    const { task, text, prompt, targetLang } = body;
    
    if (!task) {
      return new Response(
        JSON.stringify({
          error: 'Task is required',
          availableTasks: Object.keys(TASKS),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }
    
    if (!TASKS[task]) {
      return new Response(
        JSON.stringify({
          error: `Unknown task: ${task}`,
          availableTasks: Object.keys(TASKS),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }
    
    const taskConfig = TASKS[task];
    let result;
    let inputUsed;
    
    switch (task) {
      case 'chat': {
        const userPrompt = prompt || text || 'Hello!';
        inputUsed = userPrompt.slice(0, 500); // Limit input for demo
        
        result = await env.AI.run(taskConfig.model, {
          messages: [
            { role: 'system', content: 'You are a helpful assistant. Keep responses brief and friendly.' },
            { role: 'user', content: inputUsed },
          ],
          max_tokens: 256,
        });
        break;
      }
      
      case 'summarize': {
        if (!text) {
          return new Response(
            JSON.stringify({ error: 'Text is required for summarization' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            }
          );
        }
        inputUsed = text.slice(0, 1000); // Limit for demo
        
        result = await env.AI.run(taskConfig.model, {
          input_text: inputUsed,
          max_length: 150,
        });
        break;
      }
      
      case 'sentiment': {
        if (!text) {
          return new Response(
            JSON.stringify({ error: 'Text is required for sentiment analysis' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            }
          );
        }
        inputUsed = text.slice(0, 500);
        
        result = await env.AI.run(taskConfig.model, {
          text: inputUsed,
        });
        break;
      }
      
      case 'translate': {
        if (!text) {
          return new Response(
            JSON.stringify({ error: 'Text is required for translation' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            }
          );
        }
        inputUsed = text.slice(0, 500);
        const target = targetLang || 'es'; // Default to Spanish
        
        result = await env.AI.run(taskConfig.model, {
          text: inputUsed,
          source_lang: 'en',
          target_lang: target,
        });
        break;
      }
    }
    
    return new Response(
      JSON.stringify({
        task,
        model: taskConfig.model,
        input: inputUsed,
        result,
        service: 'Workers AI',
      }),
      {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'AI processing error',
        message: error.message,
        hint: 'Workers AI requires an internet connection and may have rate limits on free tier',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
}
