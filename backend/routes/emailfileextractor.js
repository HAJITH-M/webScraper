// Assuming you're using Express.js for your backend

const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Endpoint to get file titles by email
router.post("/files-by-email", async (req, res) => {
  const { email } = req.body;
  
  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Query the database for files associated with the email
    const files = await prisma.extractedContent.findMany({
      where: { email: email },
      select: { title: true },
    });

    // Return the titles of the files
    res.json({ files: files.map(file => file.title) });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Error fetching files" });
  }
});




module.exports = router;
