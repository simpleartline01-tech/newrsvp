// netlify/functions/rsvp.js
//
// CORS bridge between a Canva website (frontend) and a Google Apps Script
// Web App (backend). Canva's fetch() calls this Netlify Function instead
// of calling Google Apps Script directly, which avoids CORS issues.

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwIwbx-ypmWUQKJIkiAxEdvMLEHz2GDYxsbHibwdVYcc-FNWNtvepf5uuaSthUp_2mTGA/exec";

// Change "*" to your exact Canva/custom domain later if you want to lock this down.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  // Only allow POST for the actual RSVP submission
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Method Not Allowed. Use POST." }),
    };
  }

  try {
    // event.body is the raw JSON string sent from Canva's fetch()
    const incomingBody = event.body || "{}";

    // Forward the exact JSON body to the Google Apps Script Web App
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: incomingBody,
      redirect: "follow", // Apps Script often responds with a 302 redirect
    });

    const responseText = await googleResponse.text();

    // Try to pass through JSON as JSON; fall back to raw text if it isn't JSON
    let contentType = "application/json";
    let responseBody = responseText;
    try {
      JSON.parse(responseText);
    } catch (e) {
      contentType = "text/plain";
    }

    return {
      statusCode: googleResponse.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": contentType,
      },
      body: responseBody,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "Failed to reach Google Apps Script",
        details: error.message,
      }),
    };
  }
};
