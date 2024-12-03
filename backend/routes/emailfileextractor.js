const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Endpoint to get file titles by email
// Endpoint to get file titles by email
router.post("/files-by-email1", async (req, res) => {
  const { email } = req.body;  // Get the email from the request body
  
  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: email },  // Find user by email
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Query the database for files associated with the user
    const files = await prisma.extractedContent.findMany({
      where: { userId: user.id },  // Fetch files based on userId
      select: { title: true, fileName: true, createdAt: true },
    });

    // Return the list of files
    res.json({ files: files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Error fetching files" });
  }
});


// Endpoint to get extracted content by file title and email
router.post("/file-content1", async (req, res) => {
  const { email, title } = req.body;

  try {
    if (!email || !title) {
      return res.status(400).json({ error: "Email and title are required" });
    }

    // Fetch the user by email to get their userId
    const user = await prisma.user.findUnique({
      where: { email: email }, // Find the user by email
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch the file content by title and userId (from the User model)
    const fileContent = await prisma.extractedContent.findFirst({
      where: {
        userId: user.id,  // Filter by userId (based on the email)
        title: title,      // Filter by file title
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
