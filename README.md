# Compliment Generator ✨

A fun and uplifting web application that generates compliments to brighten your day! This project features a dynamic particle background that follows the cursor and aims to provide a delightful user experience.

## Features

*   **Dynamic Compliment Generation:**
    *   Attempts to fetch compliments from AI services (Gemini and DeepSeek as fallbacks).
    *   Uses a local list of compliments if AI services are unavailable or fail.
*   **Interactive UI:**
    *   Glassmorphism effect on the main content container.
    *   Dynamic particle background that follows the mouse cursor, with particles nearest to the cursor becoming more prominent.
    *   Funny loading text animations while fetching compliments.
    *   "Regenerate Compliment" button to get new compliments.
*   **Responsive Design:** Basic styling adjustments for smaller screens.

## Technologies Used

*   **Frontend:**
    *   HTML5
    *   CSS3 (including Flexbox, Transitions, Glassmorphism effects)
    *   JavaScript (ES6+)
*   **AI Services (Conceptual Integration - Requires Backend for Secure Key Management):**
    *   Google Gemini API
    *   DeepSeek API

## Project Structure

```
compliment-generator/
├── index.html         # Main HTML structure
├── styles.css         # CSS for styling
├── script.js          # JavaScript for functionality and animations
└── README.md          # This file
```

## Setup and Installation

1.  **Clone the repository (or download the files):**
    ```bash
    git clone https://github.com/abhi340/compliment-generator.git
    cd compliment-generator
    ```
2.  **Open `index.html` in your browser:**
    You can directly open the `index.html` file in a web browser to see the frontend and the local compliment fallback functionality.

### For AI-Generated Compliments (Advanced Setup - Requires Backend)

**IMPORTANT SECURITY NOTE:** The current `script.js` is set up to *conceptually* call backend endpoints for AI services. **Do NOT embed your API keys directly in the client-side JavaScript if you intend to use live AI services.**

To enable AI-generated compliments securely:

1.  **Set up a Backend Proxy Server:**
    *   Create a simple backend server (e.g., using Node.js with Express, Python with Flask, etc.).
    *   This server will securely store your Gemini and DeepSeek API keys (e.g., as environment variables).
    *   Implement endpoints on your backend (e.g., `/api/gemini-compliment`, `/api/deepseek-compliment`) that your frontend `script.js` will call.
    *   Your backend server will then make the actual authenticated requests to the Gemini and DeepSeek APIs and return the compliment text to the frontend.
    *   A conceptual Node.js/Express backend example was discussed during the development of this project.
2.  **Configure API Keys on Backend:**
    *   Ensure your Gemini API key has the "Generative Language API" (or specific Gemini model API) enabled in your Google Cloud Project.
    *   Ensure your DeepSeek API key is active and your account has sufficient balance/credits.
3.  **Update Frontend `API_CONFIG` (if necessary):**
    *   If your backend endpoints are different from `/api/gemini-compliment` and `/api/deepseek-compliment`, update them in the `API_CONFIG` object in `script.js`.

## How to Run

*   **With Local Fallbacks Only:** Simply open `index.html` in your browser.
*   **With AI Compliments (after setting up backend):**
    1.  Start your backend server.
    2.  Open `index.html` in your browser (it might be served by your backend server, e.g., `http://localhost:3000`).

## Future Enhancements

*   More sophisticated particle animations.
*   User accounts to save favorite compliments.
*   Themes or customization options.
*   More robust error handling and UI feedback for API calls.

---

Enjoy your daily dose of positivity!
