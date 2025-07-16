// netlify/functions/gemini-proxy.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        // Access your API key as an environment variable.
        // You MUST set this in your Netlify site settings under:
        // Site settings > Build & deploy > Environment variables
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Gemini API Key not configured in Netlify Environment Variables." }),
            };
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        // netlify/functions/gemini-proxy.js
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const chat = model.startChat({
            history: [], // Start with empty history for a single prompt
            generationConfig: {
                maxOutputTokens: 200, // Limit output to prevent excessively long responses
            },
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                candidates: [{
                    content: {
                        parts: [{ text: text }]
                    }
                }]
            }),
        };
    } catch (error) {
        console.error("Error in Netlify Function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message || "Internal Server Error" }),
        };
    }
};
