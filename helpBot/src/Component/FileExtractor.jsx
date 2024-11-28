// src/components/FileUpload.jsx
import React, { useState } from "react";
import axios from "axios";
import { backEndUrl } from "../utils/BackendUrl";

const FileUpload = ({ onFileProcessed }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const backendUrl = await backEndUrl(); // Wait for the backend URL

      const response = await axios.post(`${backendUrl}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onFileProcessed(response.data.text); // Callback to pass the extracted text
    } catch (err) {
      setError("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FileUpload;
