import React, { useState } from "react";
import axios from "axios";
import { marked } from "marked"; // Import marked library for Markdown conversion
import DOMPurify from "dompurify"; // Import DOMPurify for sanitizing the HTML

import { backEndUrl } from "../utils/BackendUrl"; // Ensure this is returning the correct backend URL

const FileExtractor = () => {
  const [file, setFile] = useState(null); // Selected file
  const [email, setEmail] = useState(""); // Email input state
  const [loading, setLoading] = useState(false); // Loading state for both file upload and query
  const [error, setError] = useState(null); // Error state
  const [fileText, setFileText] = useState(""); // Extracted file text
  const [query, setQuery] = useState(""); // Query input state
  const [queryResponse, setQueryResponse] = useState(""); // Query result from backend
  const [fileTitles, setFileTitles] = useState([]); // File titles from backend
  const [selectedFile, setSelectedFile] = useState(null); // File selected for AI analysis

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    // Optional: file type validation (check for pdf and docx)
    if (selectedFile && (selectedFile.type === "application/pdf" || selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setFile(selectedFile);
      setError(null); // Reset error on valid file
    } else {
      setError("Please upload a valid PDF or DOCX file.");
      setFile(null); // Clear file if invalid
    }
  };

  // Handle file upload with email
  const handleFileUpload = async () => {
    if (!file || !email) {
      setError("Both file and email are required.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email); // Include email with the request

    try {
      const backendUrl = await backEndUrl(); // Wait for the backend URL

      const response = await axios.post(`${backendUrl}/api/fileupload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Pass the extracted text to the state
      setFileText(response.data.text);

      // After file upload, fetch the list of files for the entered email
      fetchFileTitles(email);
    } catch (err) {
      console.error("File upload error:", err);
      setError(err.response ? err.response.data.error : "Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch file titles associated with the email
  const fetchFileTitles = async (email) => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const backendUrl = await backEndUrl(); // Wait for the backend URL

      const response = await axios.post(`${backendUrl}/api/files-by-email`, { email }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Set the file titles to state
      setFileTitles(response.data.files || []);
    } catch (err) {
      console.error("Error fetching file titles:", err);
      setError(err.response ? err.response.data.error : "Error fetching file titles.");
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a file from the list
  const handleFileSelect = async (title) => {
    setSelectedFile(title); // Update the selected file

    // Fetch the full content of the selected file for AI analysis
    fetchFileContent(title);
  };

  // Fetch the full content of the selected file by its title
  const fetchFileContent = async (title) => {
    if (!email || !title) return;

    setLoading(true);
    setError(null);

    try {
      const backendUrl = await backEndUrl(); // Wait for the backend URL

      const response = await axios.post(`${backendUrl}/api/file-content`, { email, title }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Set the full content for AI analysis (the full extracted content)
      setFileText(response.data.content || "No content found for this file.");
    } catch (err) {
      console.error("Error fetching file content:", err);
      setError(err.response ? err.response.data.error : "Error fetching file content.");
    } finally {
      setLoading(false);
    }
  };

  // Handle query submission to search for a word's meaning
  const handleQuerySubmit = async () => {
    if (!query || !selectedFile || !fileText) return;

    setLoading(true);
    setError(null);

    // Check if the query is asking for the meaning of a word
    const wordSearchQuery = query.toLowerCase().match(/what is the meaning of (\w+)/);

    try {
      if (wordSearchQuery) {
        const word = wordSearchQuery[1]; // Extract the word to search for

        const backendUrl = await backEndUrl(); // Wait for the backend URL

        // Send the word and the content to the backend to analyze its meaning
        const response = await axios.post(`${backendUrl}/api/filequery`, {
          query: `What is the meaning of the word '${word}'?`,
          title: selectedFile,
          content: fileText, // Send the full content of the selected file
          word: word, // Send the word to be searched
        }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Set the response from the backend (AI-generated response based on full content)
        setQueryResponse(response.data.response);
      } else {
        // If the query is not about a word meaning, send the query directly
        const backendUrl = await backEndUrl(); // Wait for the backend URL

        const response = await axios.post(`${backendUrl}/api/filequery`, {
          query,
          title: selectedFile,
          content: fileText, // Send the full content of the selected file
        }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setQueryResponse(response.data.response);
      }
    } catch (err) {
      console.error("Query error:", err);
      setError(err.response ? err.response.data.error : "Error processing query.");
    } finally {
      setLoading(false);
    }
  };

  // Function to sanitize and render the Markdown response securely
  const renderMarkdown = (markdownText) => {
    const rawHtml = marked(markdownText); // Convert Markdown to HTML
    return { __html: DOMPurify.sanitize(rawHtml) }; // Sanitize HTML and return as an object for dangerouslySetInnerHTML
  };

  return (
    <div>
      <h1>Chatbot with Document Upload and Query</h1>

      {/* Email Input Section */}
      <div>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginTop: "10px", padding: "10px", width: "100%" }}
        />
        <button onClick={() => fetchFileTitles(email)} disabled={loading || !email}>
          {loading ? "Fetching Files..." : "Fetch File Titles"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* Display File Titles */}
      {fileTitles.length > 0 && (
        <div>
          <h2>Uploaded Files</h2>
          <ul>
            {fileTitles.map((title, index) => (
              <li key={index} onClick={() => handleFileSelect(title)} style={{ cursor: "pointer", color: "blue" }}>
                {title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File Upload Section */}
      <div>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.docx" // Optional: restrict file types to PDF and DOCX
        />
        <button onClick={handleFileUpload} disabled={loading || !file || !email}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* Display Extracted Text */}
      <div>
        <h2>Extracted Text</h2>
        <div style={{ maxHeight: "300px", overflowY: "auto", whiteSpace: "pre-wrap", border: "1px solid #ddd", padding: "10px" }}>
          {fileText || "No text extracted yet."}
        </div>
      </div>

      {/* Query Section */}
      <div>
        <h2>Ask a Question</h2>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something about the uploaded files..."
          rows={4}
          style={{ width: "100%", padding: "10px", border: "1px solid #ddd" }}
        />
        <button onClick={handleQuerySubmit} disabled={loading || !query || !selectedFile}>
          {loading ? "Processing..." : "Submit Query"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* Display Query Response */}
      <div>
        <h2>Response</h2>
        <div
          style={{ maxHeight: "300px", overflowY: "auto", whiteSpace: "pre-wrap", border: "1px solid #ddd", padding: "10px" }}
          dangerouslySetInnerHTML={renderMarkdown(queryResponse)} // Render sanitized markdown response
        />
      </div>
    </div>
  );
};

export default FileExtractor;
