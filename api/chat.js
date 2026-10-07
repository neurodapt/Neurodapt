export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model, temperature = 0.2, response_format = null } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing messages array.' });
    }

    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'LLM_API_KEY is not configured on the server.' });
    }

    const baseURL = (process.env.LLM_BASE_URL || 'https://api.aicredits.in/v1').replace(/\/$/, '');
    const resolvedModel = model || process.env.LLM_MODEL || 'openai/gpt-5-nano';

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages,
        temperature,
        ...(response_format ? { response_format } : {})
      })
    });

    const payloadText = await response.text();
    if (!response.ok) {
      return res.status(response.status).send(payloadText);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(payloadText);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}