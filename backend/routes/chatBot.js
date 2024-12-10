const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import the GoogleGenerativeAI client
const { v4: uuidv4 } = require("uuid");  // Import UUID for session IDs

const router = express.Router();
const prisma = new PrismaClient();
const app = express();
app.use(express.json());  // Ensure to parse JSON bodies

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Use your GEMINI API key from .env
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// **Chatbot Route to answer user queries**
router.post("/chatbot", async (req, res) => {
  const { query, email, sessionId } = req.body;

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

    const userId = user.id;

    const normalizedQuery = query.toLowerCase();
    console.log("Normalized query:", normalizedQuery); // Log the normalized query for debugging

    // Generate session name dynamically based on query and response
    let sessionName = "General Chat";  // Default session name

    if (normalizedQuery.includes("debug") || normalizedQuery.includes("error")) {
      sessionName = "Debugging - " + new Date().toLocaleString(); // If query is about debugging
    } else if (normalizedQuery.includes("code") || normalizedQuery.includes("programming")) {
      sessionName = "Programming - " + new Date().toLocaleString(); // If query is about programming
    } else if (normalizedQuery.includes("career") || normalizedQuery.includes("professional")) {
      sessionName = "Career Development - " + new Date().toLocaleString(); // If query is about career
    } else {
      sessionName = "General Chat - " + new Date().toLocaleString(); // Default session name
    }

    // If no sessionId is provided, generate a new one for this conversation
    const conversationSessionId = sessionId || uuidv4();

      // Construct a detailed prompt for the AI model
         let prompt = `
         The user has asked: "${query}". 

         // Check for greetings first
         if (query.toLowerCase().match(/^(hi|hello|hey|hii|helloo|hola|greetings)$/i)) {
           return "Hi! How can I assist you today? I'm here to help with:

1. 💻 Programming & Technical Questions
2. 🏗️ Software Architecture & Design
3. 🔍 Debugging & Error Resolution
4. 🛠️ Tool & Framework Guidance
5. 🚀 Career Development Advice

Please let me know what you need help with!";
         }

         Please follow these comprehensive instructions based on the query type:

         1. **For technical/programming queries**:
            - Provide a clear, step-by-step explanation of the concept
            - Include practical examples and use cases
            - Provide example code (wrapped in markdown using triple backticks)
            - Include best practices and common pitfalls to avoid
            - Add performance considerations if applicable
            - Suggest related topics for further learning

         2. **For software architecture/design queries**:
            - Explain the architectural patterns or design principles
            - Provide pros and cons of different approaches
            - Include system design diagrams if relevant
            - Discuss scalability and maintenance considerations
            - Suggest best practices for implementation

         3. **For debugging/error-related queries**:
            - Analyze the potential causes of the issue
            - Provide troubleshooting steps
            - Suggest debugging techniques
            - Include common solutions and workarounds
            - Recommend prevention strategies

         4. **For tool/framework-specific queries**:
            - Provide version-specific information
            - Include setup and configuration guidance
            - Explain common use cases and features
            - Share best practices and optimization tips
            - Mention alternatives if applicable

         5. **For general knowledge/conceptual queries**:
            - Provide clear, concise explanations
            - Include real-world examples and analogies
            - Reference reliable sources when applicable
            - Suggest related topics for broader understanding
            - Address common misconceptions

         6. **For career/professional development queries**:
            - Provide industry-relevant advice
            - Include learning resources and roadmaps
            - Suggest skill development strategies
            - Share best practices for professional growth
            - Discuss current trends and opportunities

         7. **For unclear or ambiguous queries**:
            - Ask specific clarifying questions
            - Request context or examples
            - Suggest potential interpretations
            - Guide the user to formulate a clearer question
            - Provide examples of well-formed questions

         Please ensure the response is:
         - Clear and well-structured
         - Accurate and up-to-date
         - Practical and actionable
         - Includes relevant examples
         - Uses appropriate formatting for code and technical terms
         - Maintains a helpful and professional tone
         `;

    // Send the prompt to the AI model
    const aiResult = await model.generateContent(prompt);

    // Ensure aiResult contains a valid response and fallback to a default message if not
    const aiResponse = aiResult.response ? aiResult.response.text() : "I couldn't generate a response. Can you please clarify your question?";

    // Save the query, response, and session name to the database in ChatHistory
    const chatSession = await prisma.chatHistory.create({
      data: {
        query: query,
        response: aiResponse, // Save chatbot response
        userId: userId, // Reference to the user
        sessionId: conversationSessionId, // Store sessionId for this conversation
        // Save the session name here
        sessionName: sessionName,  // Store the dynamically generated session name
      },
    });

    // Return the AI-generated response and sessionId
    res.json({
      response: chatSession.response,  // Send the chatbot's response back to the frontend
      sessionId: conversationSessionId,  // Return the sessionId for future reference
      sessionName: sessionName, // Return the session name
    });
  } catch (error) {
    console.error("Error during chatbot query processing:", error.message);
    res.status(500).json({
      error: "Chatbot query failed",
      details: error.message,
    });
  }
});


// **Fetch the list of previous sessions for the user**
router.get("/getSessions", async (req, res) => {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      // Find the user based on the email
      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Fetch all chat sessions for the user
      const sessions = await prisma.chatHistory.findMany({
        where: { userId: user.id },
        select: {
          sessionId: true,  // Only return the sessionId field
          sessionName: true,  // Only return the sessionName field
        },
        distinct: ['sessionId'],  // Ensure we return unique sessions
      });

      res.json({ sessions });  // Send sessions to the frontend
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({
        error: "Failed to fetch sessions",
        details: error.message,
      });
    }
});

// **Fetch all messages for a specific session**
// **Fetch all messages for a specific session**
router.get("/getSessionMessages", async (req, res) => {
  const { email, sessionId } = req.query;

  if (!email || !sessionId) {
      return res.status(400).json({ error: "Email and sessionId are required" });
  }

  try {
      // Find the user based on the email
      const user = await prisma.user.findUnique({
          where: { email: email },
      });

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      // Fetch all chat messages for the given sessionId
      const chatHistory = await prisma.chatHistory.findMany({
          where: {
              userId: user.id,
              sessionId: sessionId,
          },
          orderBy: {
              createdAt: 'asc',  // Order the messages by creation date
          },
          select: {
              query: true,
              response: true,
              createdAt: true,
          },
      });

      console.log("Fetched chat history:", chatHistory);  // Debugging log to check the data

      if (chatHistory.length === 0) {
          return res.status(404).json({ error: "No messages found for this session" });
      }

      // Send the complete chat history (query + response) to the frontend
      res.json({ chatHistory });  // Send the chat history for the session to the frontend
  } catch (error) {
      console.error('Error fetching session messages:', error);
      res.status(500).json({
          error: "Failed to fetch session messages",
          details: error.message,
      });
  }
});

// Export the router
module.exports = router;
