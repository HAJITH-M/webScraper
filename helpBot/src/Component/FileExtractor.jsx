import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Link, useNavigate } from "react-router-dom";
import { PiSignOutDuotone } from "react-icons/pi";
import { backEndUrl } from "../utils/BackendUrl";
import { motion } from "framer-motion";
import { HiMenuAlt3 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { IoSendSharp } from "react-icons/io5";
import * as jwt_decode from 'jwt-decode'; // Changed import syntax

const FileExtractor = () => {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [error, setError] = useState(null);
  const [fileText, setFileText] = useState("");
  const [query, setQuery] = useState("");
  const [queryResponse, setQueryResponse] = useState("");
  const [fileTitles, setFileTitles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);
  const sidebarRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showNoFileModal, setShowNoFileModal] = useState(false);
  const [showNoUploadedFilesModal, setShowNoUploadedFilesModal] = useState(false);


  const navigate = useNavigate();


useEffect(() => {
    const validateToken = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return false;
      }
      const decodedToken = jwt_decode.jwtDecode(token);
      if (decodedToken.exp < Date.now() / 1000) {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        navigate('/login');
        return false;
      }
      return true;
    };

    validateToken();
  }, [navigate]);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Extract email from JWT token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwt_decode.jwtDecode(token); // Use jwtDecode method
        const userEmail = decodedToken.email; // Assumes email is in the token payload
        setEmail(userEmail);
        fetchFileTitles(userEmail);
      } catch (err) {
        console.error("Error decoding token:", err);
        setError("Invalid authentication token");
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === "application/pdf" || selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a valid PDF or DOCX file.");
      setFile(null);
    }
  };

  const handleUploadClick = () => {
    setShowFileInput(true);
  };

  const handleFileUpload = async () => {
    if (!file || !email) {
      setError("Both file and email are required.");
      return;
    }
    setLoadingUpload(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not logged in.");
        return;
      }

      const backendUrl = await backEndUrl();
      const response = await axios.post(`${backendUrl}/api/fileupload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });

      setFileText(response.data.text);
      fetchFileTitles(email);
    } catch (err) {
      console.error("File upload error:", err);
      setError(err.response ? err.response.data.error : "Error uploading file.");
    } finally {
      setLoadingUpload(false);
      setShowFileInput(false);
    }
  };

  const fetchFileTitles = async (email) => {
    if (!email) return;
    setLoadingUpload(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("User not logged in.");
        return;
      }

      const backendUrl = await backEndUrl();
      const response = await axios.post(`${backendUrl}/api/files-by-user`, { email }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      setFileTitles(response.data.files || []);
    } catch (err) {
      console.error("Error fetching file titles:", err);
      setError(err.response ? err.response.data.error : "Error fetching file titles.");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleFileSelect = async (title) => {
    setSelectedFile(title);
    fetchFileContent(title);
  };

  const fetchFileContent = async (title) => {
    if (!email || !title) return;
    setLoadingQuery(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User is not authenticated.");
        return;
      }

      const backendUrl = await backEndUrl();
      const response = await axios.post(`${backendUrl}/api/file-content`, { email, title }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      setFileText(response.data.content || "No content found for this file.");
    } catch (err) {
      console.error("Error fetching file content:", err);
      setError(err.response ? err.response.data.error : "Error fetching file content.");
    } finally {
      setLoadingQuery(false);
    }
  };

  const handleQuerySubmit = async () => {

    if (fileTitles.length === 0) {
      setShowNoUploadedFilesModal(true);
      return;
    }

    if (!selectedFile) {
      setShowNoFileModal(true);
      return;
    }

    if (!query || !selectedFile || !fileText) return;
    setLoadingQuery(true);
    setError(null);

    const wordSearchQuery = query.toLowerCase().match(/what is the meaning of (\w+)/);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User is not authenticated.");
        return;
      }

      const backendUrl = await backEndUrl();
      if (wordSearchQuery) {
        const word = wordSearchQuery[1];
        const response = await axios.post(`${backendUrl}/api/filequery`, {
          query: `What is the meaning of the word '${word}'?`,
          title: selectedFile,
          content: fileText,
          word: word,
        }, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        setQueryResponse(response.data.response);
        setQuery(""); // Add this line to clear the input field

      } else {
        const response = await axios.post(`${backendUrl}/api/filequery`, {
          query,
          title: selectedFile,
          content: fileText,
        }, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        setQueryResponse(response.data.response);
        setQuery(""); // Add this line to clear the input field

      }
    } catch (err) {
      console.error("Query error:", err);
      setError(err.response ? err.response.data.error : "Error processing query.");
    } finally {
      setLoadingQuery(false);
    }
  };

  const renderMarkdown = (markdownText) => {
    const rawHtml = marked(markdownText);
    return { __html: DOMPurify.sanitize(rawHtml) };
  };

  return (

    <div className="min-h-screen w-full bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
{showNoFileModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-lg p-6 max-w-sm mx-4"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-200">Select a File</h3>
      <p className="text-gray-400 mb-6">Please select a file from the sidebar before submitting your query.</p>
      <button
        onClick={() => setShowNoFileModal(false)}
        className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
      >
        Got it
      </button>
    </motion.div>
  </div>
)}


{showNoUploadedFilesModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-lg p-6 max-w-sm mx-4"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-200">Upload a File</h3>
      <p className="text-gray-400 mb-6">You haven't uploaded any files yet. Would you like to upload one now?</p>
      <div className="flex gap-4">
        <button
          onClick={() => {
            setShowNoUploadedFilesModal(false);
            handleUploadClick();
          }}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          Upload
        </button>
        <button
          onClick={() => setShowNoUploadedFilesModal(false)}
          className="flex-1 bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-all duration-300"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  </div>
)}
      <div className="flex h-screen relative">
        <button
          className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-900 text-white"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <AiOutlineClose size={24} /> : <HiMenuAlt3 size={24} />}
        </button>

        <div
          ref={sidebarRef}
          className={`fixed lg:relative w-64 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-xl text-white p-4 flex flex-col z-40 transform transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="mb-4 flex items-center">
            <div className="w-10 h-10 p-1 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white flex items-center justify-center mr-3 flex-shrink-0">
              {email ? email[0].toUpperCase() : '?'}
            </div>
            <div className="flex-1 overflow-hidden select-none">
              <input
                type="email"
                value={email}
                readOnly
                className="w-full p-2 rounded-lg select-none bg-black/50 text-gray-200 border border-gray-800 truncate"
              />
            </div>
          </div>          
          {showFileInput && (
            <div className="fixed z-10 top-0 left-0 w-full h-full flex bg-black bg-opacity-60 backdrop-blur-sm" onClick={(e) => {
              if (e.target === e.currentTarget) setShowFileInput(false)
            }}>
              <div className="extraOutline p-4 bg-black/40 w-max m-auto rounded-lg relative border border-gray-800">
                <button 
                  onClick={() => setShowFileInput(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                >
                  <AiOutlineClose size={20} />
                </button>
                <div className="file_upload p-5 relative border-4 border-dotted border-gray-700 rounded-lg" style={{width: "450px"}}>
                  <svg className="text-indigo-500 w-24 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="input_field flex flex-col w-max mx-auto text-center">
                    {!file ? (
                      <label>
                        <input className="text-sm cursor-pointer w-36 hidden" type="file" onChange={handleFileChange} accept=".pdf,.docx" />
                        <div className="text bg-indigo-600 text-white border border-gray-700 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-indigo-500">Select</div>
                      </label>
                    ) : (
                      <div className="text-indigo-400 font-semibold truncate max-w-[300px]">{file.name}</div>
                    )}
                    {!file && <div className="title text-indigo-500 uppercase">or drop files here</div>}
                  </div>
                  {file && (
                    <button
                      className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                      onClick={() => {
                        handleFileUpload()
                        setFile(null)
                        setShowFileInput(false)
                      }}
                      disabled={loadingUpload}
                    >
                      {loadingUpload ? "Uploading..." : "Upload"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}          
           <div className="mb-4">
            <button
              className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-4 py-1.5 rounded-md hover:shadow-lg transition-all duration-300 text-sm"
              onClick={handleUploadClick}
              disabled={loadingUpload || !email}
            >
              Upload File
            </button>
          </div>

          <div className="mb-8 flex-1 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
              Files
            </h2>
            {fileTitles.length > 0 && (
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)", scrollbarWidth: "thin", scrollbarColor: "#4F46E5 transparent" }}>
                <div className="space-y-2 pr-2">
                  {fileTitles.map((file, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer text-white p-2 rounded transition-colors ${
                        selectedFile === file.title 
                          ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600' 
                          : 'hover:bg-gradient-to-r hover:from-indigo-600 hover:to-fuchsia-600'
                      }`}
                      onClick={() => handleFileSelect(file.title)}
                    >
                      {file.title}
                    </div>
                  ))}
                </div>
              </div>            )}
          </div>
          <div className="mt-auto">
            <Link to="/">
              <button
                className="w-full text-left p-2 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-fuchsia-600 rounded transition-colors flex items-center text-white bg-gradient-to-r from-indigo-600 to-purple-600"
                onClick={toggleMenu}
                onMouseEnter={() => setHoveredItem("logout")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {hoveredItem === "logout" && <PiSignOutDuotone className="mr-2" />}
                <span>Logout</span>
              </button>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            {error && (
              <div
                className="p-4 bg-red-900/50 text-red-300 rounded-lg mb-4 border border-red-800"
              >
                {error}
              </div>
            )}

            {fileText && (
              <div
                className="mb-6 p-4 bg-black/40 rounded-lg shadow-lg border border-gray-800 backdrop-blur-md"
              >
                <h2 className="text-xl font-bold mb-2 text-gray-200">Extracted Text</h2>

                <div className="max-h-[300px] overflow-y-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-transparent text-gray-300">
                  {fileText}
                </div>
              </div>
            )}

            {queryResponse && (
              <div
                className="mb-6 p-4 bg-black/40 rounded-lg shadow-lg border border-gray-800 backdrop-blur-md"
              >
                <h2 className="text-xl font-bold mb-2 text-gray-200">Response</h2>
                <div className="text-gray-300" dangerouslySetInnerHTML={renderMarkdown(queryResponse)} />
              </div>
            )}
          </div>

          <div
            className="border-t border-gray-800 bg-black/50 p-4 backdrop-blur-md"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter your query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleQuerySubmit();
                  }
                }}
                className="flex-1 p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-black/50 text-gray-200"
              />
              <button
                className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                onClick={handleQuerySubmit}
                disabled={loadingQuery || !query}
              >
                <IoSendSharp size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>  
    
  );};

export default FileExtractor;
