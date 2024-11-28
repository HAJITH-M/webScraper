// server/routes/fileUploadRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// Endpoint to upload the file and extract text
router.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = path.join(__dirname, "../", req.file.path); // Correct the path for file cleanup
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  try {
    let extractedText = "";

    if (fileExtension === ".docx") {
      // Extract text from DOCX file
      extractedText = await extractTextFromDocx(filePath);
    } else if (fileExtension === ".pdf") {
      // Extract text from PDF file
      extractedText = await extractTextFromPdf(filePath);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Send the extracted text as a response
    res.json({ text: extractedText });
  } catch (err) {
    res.status(500).json({ error: "Error processing file" });
  } finally {
    // Clean up the uploaded file
    fs.unlinkSync(filePath);
  }
});

// Function to extract text from DOCX
async function extractTextFromDocx(filePath) {
  const buffer = fs.readFileSync(filePath);
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

// Function to extract text from PDF
async function extractTextFromPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

module.exports = router;
