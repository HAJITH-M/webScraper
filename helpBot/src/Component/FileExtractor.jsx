import React, { useState } from "react";
import axios from "axios";
import { backEndUrl } from "../utils/BackendUrl"; // Make sure this returns the correct backend URL

const FileExtractor = () => {
  const [file, setFile] = useState(null); // Selected file
  const [loading, setLoading] = useState(false); // Loading state for both file upload and query
  const [error, setError] = useState(null); // Error state
  const [fileText, setFileText] = useState(""); // Extracted file text
  const [query, setQuery] = useState(""); // Query input state
  const [queryResponse, setQueryResponse] = useState(""); // Query result from backend

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

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const backendUrl = await backEndUrl(); // Wait for the backend URL

      const response = await axios.post(`${backendUrl}/api/fileupload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Pass the extracted text to the state
      setFileText(response.data.text);
    } catch (err) {
      // Improve error handling, show server error message if available
      console.error("File upload error:", err);
      setError(err.response ? err.response.data.error : "Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  // Handle query submission
  const handleQuerySubmit = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);

    try {
      const backendUrl = await backEndUrl(); // Wait for the backend URL

      const response = await axios.post(`${backendUrl}/api/filequery`, { query }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Set the response from the backend (AI-generated response based on query)
      setQueryResponse(response.data.response);
    } catch (err) {
      console.error("Query error:", err);
      setError(err.response ? err.response.data.error : "Error processing query.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Chatbot with Document Upload and Query</h1>

      {/* File Upload Section */}
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload} disabled={loading || !file}>
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
        <button onClick={handleQuerySubmit} disabled={loading || !query}>
          {loading ? "Processing..." : "Submit Query"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* Display Query Response */}
      <div>
        <h2>Response</h2>
        <div style={{ maxHeight: "300px", overflowY: "auto", whiteSpace: "pre-wrap", border: "1px solid #ddd", padding: "10px" }}>
          {queryResponse || "No response yet."}
        </div>
      </div>
    </div>
  );
};

export default FileExtractor;
