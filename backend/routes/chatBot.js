const express = require("express");
const multer = require("multer");

const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import the GoogleGenerativeAI client

const router = express.Router();
const prisma = new PrismaClient();
const app = express();
app.use(express.json());  // Make sure to parse JSON bodies

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Use your GEMINI API key from .env
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Setup file upload using multer
const upload = multer({ dest: "uploads/" });


// **Chatbot Route to answer user queries** (new route)
router.post("/chatbot", async (req, res) => {
    const { query } = req.body;
  
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
  
    try {
      const normalizedQuery = query.toLowerCase();
      console.log("Normalized query:", normalizedQuery); // Log the normalized query for debugging
  
      // Construct a detailed prompt for the AI model to generate both explanation and code
      const prompt = `
  The user has asked: "${query}". 
  
  Please respond as follows:
  1. **Explain the concept or idea** in simple terms.
  2. **Provide an example of code** related to the query. 
  3. The code should be wrapped in markdown syntax (using triple backticks for multi-line code).
  4. If the query relates to programming, ensure the code is well-formatted and syntactically correct.
  5. If it's a non-technical query (e.g., greetings or general questions), provide a friendly and helpful reply without code.
  
  Example for programming-related query:
  - If the query is: "How do I reverse a string in Python?"
  - You should respond with:
      **Explanation**: 
      "A string reversal in Python means creating a new string that is the reverse of the original string."
      **Code**:
      \`\`\`python
      def reverse_string(s):
          return s[::-1]
      \`\`\`
  
  The explanation and the code should be presented clearly and properly formatted.
  
  `;
  
      // Send the prompt to the AI model
      const aiResult = await model.generateContent(prompt);
  
      // Return the AI-generated response
      res.json({
        response: aiResult.response.text() || "I couldn't generate a response. Can you please clarify your question?"
      });
    } catch (error) {
      console.error("Error during chatbot query processing:", error.message);
      res.status(500).json({
        error: "Chatbot query failed",
        details: error.message,
      });
    }
  });
  

// Export the router
module.exports = router;
