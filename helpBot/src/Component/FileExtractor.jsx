import React, { useState } from "react";
import axios from "axios";
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
      // Improve error handling, show server error message if available
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
              <li key={index}>{title}</li>
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
