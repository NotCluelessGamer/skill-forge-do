// Import node-fetch dynamically if needed (Vercel environment might have fetch globally)
let fetch;
try {
  fetch = globalThis.fetch || await import('node-fetch').then(mod => mod.default);
} catch (e) {
  console.error("Failed to load fetch:", e);
  // Fallback or handle error appropriately if fetch isn't available
}

// Ensure you have OPENAI_API_KEY set in your Vercel Environment Variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'; // Or your preferred model endpoint

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  if (!OPENAI_API_KEY) {
     console.error('OpenAI API key is missing');
     return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
  }

  if (!fetch) {
     console.error('Fetch is not available');
     return res.status(500).json({ error: 'Server configuration error: Fetch unavailable.' });
  }

  const { taskDescription, userInput } = req.body;

  // Basic validation
  if (!taskDescription || !userInput) {
    return res.status(400).json({ error: 'Missing taskDescription or userInput in request body' });
  }

  const prompt = `Act as a friendly and encouraging tutor for a 'Learn By Doing' platform. Briefly review the following user's work based on the task description provided. Provide 1-3 sentences of feedback. Focus on being positive, offering a small, actionable suggestion if appropriate, or confirming understanding if the work looks correct. Do not be overly critical. Keep it concise.

Task Description:
"""
${taskDescription}
"""

User's Work:
"""
${userInput}
"""

Feedback:`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Or another model like gpt-4o-mini
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, // Adjust creativity
        max_tokens: 100, // Limit response length
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI API Error:', response.status, errorBody);
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Extract the feedback text
    const feedback = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate feedback right now.";

    // Send the feedback back to the frontend
    res.status(200).json({ feedback: feedback });

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to get feedback from AI. ' + (error.message || '') });
  }
}
