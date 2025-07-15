// netlify/functions/gemini-proxy.js

// This Netlify Function acts as a secure proxy to the Gemini API.
// It hides your Gemini API Key from the client-side.

// The handler function is the entry point for the Netlify Function.
// It receives an 'event' object (containing request details) and a 'context' object.
exports.handler = async (event, context) => {
  // Ensure the request method is POST, as we expect a prompt in the body.
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Method Not Allowed
      body: JSON.stringify({ error: 'Method Not Allowed. Only POST requests are accepted.' })
    };
  }

  try {
    // Retrieve the Gemini API Key from Netlify Environment Variables.
    // You MUST set this environment variable in your Netlify site settings.
    // Go to Site settings > Build & deploy > Environment variables.
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not set.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error: API key missing.' })
      };
    }

    // Parse the request body to get the prompt from the client-side app.
    const requestBody = JSON.parse(event.body);
    const userPrompt = requestBody.prompt;
    const currentLanguage = requestBody.language || 'en'; // Get language from client

    if (!userPrompt) {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ error: 'Prompt is missing in the request body.' })
      };
    }

    // Construct the payload for the Gemini API
    const payload = {
      contents: [{ role: "user", parts: [{ text: userPrompt }] }]
    };

    // Define the Gemini API URL
    // UPDATED to use gemini-2.0-flash model
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Make the request to the Gemini API
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Check if the Gemini API response was successful
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
      return {
        statusCode: geminiResponse.status,
        body: JSON.stringify({ error: `Failed to get response from Gemini API: ${errorText}` })
      };
    }

    const geminiResult = await geminiResponse.json();

    // Extract the generated text from the Gemini response
    if (geminiResult.candidates && geminiResult.candidates.length > 0 &&
        geminiResult.candidates[0].content && geminiResult.candidates[0].content.parts &&
        geminiResult.candidates[0].content.parts.length > 0) {
      const generatedText = geminiResult.candidates[0].content.parts[0].text;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: generatedText })
      };
    } else {
      console.warn("Gemini API response structure unexpected:", geminiResult);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Unexpected response from AI model.' })
      };
    }

  } catch (error) {
    console.error('Error in Netlify Function (gemini-proxy):', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error processing request.' })
    };
  }
};
