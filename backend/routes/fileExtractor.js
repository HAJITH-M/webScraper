const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import the GoogleGenerativeAI client
const jwt = require("jsonwebtoken");
const router = express.Router();
const prisma = new PrismaClient();
const app = express();
app.use(express.json());  // Make sure to parse JSON bodies

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Use your GEMINI API key from .env
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Setup file upload using multer
const upload = multer({ dest: "uploads/" });

// Middleware for authenticating JWT token
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer token format
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to authenticate token' });
    }
    req.userId = decoded.id; // Save user ID for future use
    next();
  });
};

// **File Upload and Text Extraction Endpoint**
router.post("/fileupload", authenticate, upload.single("file"), async (req, res) => {
  const filePath = path.join(__dirname, "../", req.file.path); // Correct the path for file cleanup
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  try {
    console.log("File received:", req.file);  // Debug: Log received file information

    let extractedText = "";
    const title = req.file.originalname; // Title is the original file name

    // Extract text based on file type (PDF or DOCX)
    if (fileExtension === ".docx") {
      extractedText = await extractTextFromDocx(filePath);
    } else if (fileExtension === ".pdf") {
      extractedText = await extractTextFromPdf(filePath);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Find or create the User based on the userId (from JWT)
    const user = await prisma.user.upsert({
      where: { id: req.userId },
      update: {}, // No update necessary since we're just associating this user
      create: { email: "default_email@example.com", password: "default_password" }, // Ensure user creation logic is valid if needed
    });

    // Create a new entry in ExtractedContent with the associated userId
    const extractedContent = await prisma.extractedContent.create({
      data: {
        content: extractedText,  // The extracted content from the file
        fileName: req.file.originalname,  // The original file name
        url: req.file.path,  // Path to the uploaded file
        title: title,  // Title of the file
        userId: user.id, // Store the userId in ExtractedContent
      },
    });

    // Send the extracted text and saved data as a response
    res.json({ text: extractedText, extractedContent: extractedContent });
  } catch (err) {
    console.error("Error processing file:", err);  // Debug: Log the error
    res.status(500).json({ error: "Error processing file", details: err.message });
  } finally {
    // Clean up the uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Ensure file is deleted after processing
    }
  }
});

// Function to extract text from DOCX
async function extractTextFromDocx(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  } catch (error) { 
    console.error("Error extracting text from DOCX:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

// Function to extract text from PDF
async function extractTextFromPdf(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// **Query Processing Endpoint**
router.post("/filequery", authenticate, async (req, res) => {
  const { query, title } = req.body;

  if (!query || !title) {
    return res.status(400).json({ error: "Query and file title are required" });
  }

  try {
    const normalizedQuery = query.toLowerCase();
    console.log("Normalized query:", normalizedQuery);  // Log the normalized query for debugging

    // Fetch the extracted content from the database based on the title and userId (from JWT)
    const extractedContent = await prisma.extractedContent.findMany({
      where: {
        title: title, // Match the selected file's title
        userId: req.userId, // Match the userId from JWT
      },
      include: {
        user: true, // Include user information for email retrieval
      },
    });

    if (extractedContent.length === 0) {
      return res.json({ response: `Sorry, no content found for the file titled "${title}".` });
    }

    // Construct the prompt for AI model based on the extracted content from the selected file
    const prompt = `The user has asked: "${query}". 
    We have the following content from the uploaded file titled "${title}": 

    ${extractedContent.map((data) => {
      return `Content from file:
      "${data.content}"
      File Name: ${data.fileName}
      Title: ${data.title}
      Email: ${data.user ? data.user.email : "Unknown Email"} 
      ;`
    }).join("\n\n")}

    Please analyze the query and provide a helpful and accurate response based on the content of this file.
    If the query is a greeting, I will respond with a friendly greeting and explain that I can help analyze the content of the file titled "${title}".
    If the query is about the file content, I will provide a clear and detailed explanation based on the information available.
    If the query is not directly related to the content, I will explain what information is available in the file and suggest more specific questions.
    I will ensure my explanations are clear, accurate and helpful regardless of the type of query.
    Let me know if you would like me to focus on any particular aspect of the file content.`;

    // Send the prompt to the AI model for analysis and response
    const aiResult = await model.generateContent(prompt); 

    // Return the AI-generated response along with the content and file names
    res.json({
      response: aiResult.response.text() || "I couldn't generate a response.",
      content: extractedContent.map((data) => data.content),
      fileNames: extractedContent.map((data) => data.fileName),
      titles: extractedContent.map((data) => data.title),
      emails: extractedContent.map((data) => data.user ? data.user.email : "Unknown Email"), // Include emails in the response
    });
  } catch (error) {
    console.error("Error during query processing:", error.message);
    res.status(500).json({
      error: "Query failed",
      details: error.message,
    });
  }
});


// Endpoint to get file titles for the authenticated user
router.post("/files-by-user", authenticate, async (req, res) => {
  try {
    // Query the database for files associated with the authenticated user (using JWT userId)
    const files = await prisma.extractedContent.findMany({
      where: { userId: req.userId },  // Fetch files based on userId from JWT token
      select: { title: true, fileName: true, createdAt: true },
    });

    // Return the list of files
    res.json({ files: files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Error fetching files" });
  }
});

// Endpoint to get extracted content by file title and userId
router.post("/file-content", authenticate, async (req, res) => {
  const { title } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Fetch the file content by title and userId (from JWT)
    const fileContent = await prisma.extractedContent.findFirst({
      where: {
        userId: req.userId,  // Use userId from JWT
        title: title,        // Filter by file title
      },
      select: {
        content: true,  // Only select the content of the file
      },
    });

    if (!fileContent) {
      return res.status(404).json({ error: "File not found" });
    }

    // Return the file content for AI analysis
    res.json({ content: fileContent.content });
  } catch (error) {
    console.error("Error fetching file content:", error);
    res.status(500).json({ error: "Error fetching file content" });
  }
});

module.exports = router;
