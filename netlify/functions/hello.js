// netlify/functions/hello.js

// This is a simple Netlify Serverless Function written in JavaScript.
// It demonstrates a basic "Hello World" response.

// The handler function is the entry point for the Netlify Function.
// It receives an 'event' object (containing request details) and a 'context' object.
exports.handler = async (event, context) => {
  try {
    // You can access query parameters, headers, and other request details from the 'event' object.
    // For example, to get a 'name' query parameter:
    const name = event.queryStringParameters.name || 'World'; // Default to 'World' if no name is provided

    // Return a response object with a statusCode, headers, and body.
    // The body must be a string. If you're sending JSON, stringify it.
    return {
      statusCode: 200, // HTTP status code for success
      headers: {
        "Content-Type": "application/json" // Specify content type as JSON
      },
      body: JSON.stringify({ // Convert JavaScript object to a JSON string
        message: `Hello, ${name}! This is a Netlify Function.`
      })
    };
  } catch (error) {
    // Handle any errors that occur during function execution
    console.error('Error in Netlify Function:', error);
    return {
      statusCode: 500,/ // Internal Server Error status code
      body: JSON.stringify({ error: 'Failed to process your request.' })
    };
  }
};
