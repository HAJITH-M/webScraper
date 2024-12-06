const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import the GoogleGenerativeAI client

const router = express.Router();
const prisma = new PrismaClient();
const app = express();
app.use(express.json());  // Ensure to parse JSON bodies

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Use your GEMINI API key from .env
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// **Chatbot Route to answer user queries**
router.post("/chatbot", async (req, res) => {
  const { query, email } = req.body;  // Expect email instead of userId

  if (!query || !email) {
      return res.status(400).json({ error: "Query and email are required" });
  }

  try {
      // Find the user based on the email
      const user = await prisma.user.findUnique({
          where: { email: email },
      });

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      const userId = user.id;  // Get userId from the user record

      const normalizedQuery = query.toLowerCase();
      console.log("Normalized query:", normalizedQuery); // Log the normalized query for debugging

      // Construct a detailed prompt for the AI model
      let prompt = `
      The user has asked: "${query}". 

      Please follow the instructions based on the type of query:
      1. **For technical or programming-related queries** (e.g., coding questions, algorithms, etc.):
         - Provide a simple explanation of the concept.
         - Provide an example code (wrapped in markdown using triple backticks for multi-line code).
         - Ensure the code is syntactically correct and well-formatted.

      2. **For non-technical queries** (e.g., greetings, general knowledge, etc.):
         - Provide a friendly and helpful reply. Do not provide code.

      3. **For unclear or ambiguous queries**:
         - Ask the user for clarification or request more specific details.

      Example 1 (Programming-related):
      - Query: "How do I reverse a string in Python?"
        - **Explanation**: A string reversal in Python means creating a new string that is the reverse of the original string.
        - **Code**:
          \`\`\`python
          def reverse_string(s):
              return s[::-1]
          \`\`\`

      Example 2 (Non-technical):
      - Query: "Hello, how are you?"
        - **Response**: "Hello! I'm doing great, thank you for asking. How can I assist you today?"

      Example 3 (Unclear):
      - Query: "Explain code"
        - **Response**: "Could you please provide more details or clarify which code you'd like me to explain?"

      Now, based on the user's query, the AI will generate the appropriate response.
      `;

      // Send the prompt to the AI model
      const aiResult = await model.generateContent(prompt);

      // Save the query and response to the database in ChatHistory
      const chatSession = await prisma.chatHistory.create({
          data: {
              query: query,
              response: aiResult.response.text() || "I couldn't generate a response. Can you please clarify your question?",
              userId: userId, // Use the userId from the fetched user
          },
      });

      // Return the AI-generated response
      res.json({
          response: chatSession.response,
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
