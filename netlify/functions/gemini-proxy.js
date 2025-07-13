// netlify/functions/gemini-proxy.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    try {
        const requestBody = JSON.parse(event.body);
        const promptText = requestBody.promptText;
        const currentLanguage = requestBody.currentLanguage; // Pass language from client

        // Use process.env.GEMINI_API_KEY to securely access the API key
        // You need to set this environment variable in your Netlify project settings
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(promptText);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ generatedText: text }),
        };
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate content from AI." }),
        };
    }
};