import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { PiSignOutDuotone } from "react-icons/pi";
import { backEndUrl } from "../utils/BackendUrl";
import { motion } from "framer-motion";
import { HiMenuAlt3 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { IoSendSharp } from "react-icons/io5";

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

    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setEmail(userEmail);
      fetchFileTitles(userEmail);
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
      const backendUrl = await backEndUrl();
      const response = await axios.post(`${backendUrl}/api/fileupload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
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
      const backendUrl = await backEndUrl();
      const response = await axios.post(`${backendUrl}/api/files-by-email`, { email }, {
        headers: {
          "Content-Type": "application/json",
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
      const backendUrl = await backEndUrl();
      const response = await axios.post(`${backendUrl}/api/file-content`, { email, title }, {
        headers: {
          "Content-Type": "application/json",
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
    if (!query || !selectedFile || !fileText) return;
    setLoadingQuery(true);
    setError(null);

    const wordSearchQuery = query.toLowerCase().match(/what is the meaning of (\w+)/);

    try {
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
          },
        });
        setQueryResponse(response.data.response);
      } else {
        const response = await axios.post(`${backendUrl}/api/filequery`, {
          query,
          title: selectedFile,
          content: fileText,
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
      setLoadingQuery(false);
    }
  };


  const renderMarkdown = (markdownText) => {
    const rawHtml = marked(markdownText);
    return { __html: DOMPurify.sanitize(rawHtml) };
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="flex h-screen relative">
        <button
          className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-900 text-white"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <AiOutlineClose size={24} /> : <HiMenuAlt3 size={24} />}
        </button>

        <motion.div
          ref={sidebarRef}
          initial={{ x: -100, opacity: 0 }}
          animate={{
            x: isSidebarOpen ? 0 : -100,
            opacity: isSidebarOpen ? 1 : 0
          }}
          transition={{ duration: 0.5 }}
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
                className="w-full p-2 rounded-lg select-none bg-gray-700 text-gray-100 shadow-sm  truncate"
              />
            </div>
          </div>          
          {showFileInput && (
            <div className="fixed z-10 top-0 left-0 w-full h-full flex bg-black bg-opacity-60" onClick={(e) => {
              if (e.target === e.currentTarget) setShowFileInput(false)
            }}>
              <div className="extraOutline p-4 bg-white w-max bg-whtie m-auto rounded-lg relative">
                <button 
                  onClick={() => setShowFileInput(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                >
                  <AiOutlineClose size={20} />
                </button>
                <div className="file_upload p-5 relative border-4 border-dotted border-gray-300 rounded-lg" style={{width: "450px"}}>
                  <svg className="text-indigo-500 w-24 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="input_field flex flex-col w-max mx-auto text-center">
                    {!file ? (
                      <label>
                        <input className="text-sm cursor-pointer w-36 hidden" type="file" onChange={handleFileChange} accept=".pdf,.docx" />
                        <div className="text bg-indigo-600 text-white border border-gray-300 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-indigo-500">Select</div>
                      </label>
                    ) : (
                      <div className="text-indigo-600 font-semibold truncate max-w-[300px]">{file.name}</div>
                    )}
                    {!file && <div className="title text-indigo-500 uppercase">or drop files here</div>}
                  </div>
                  {file && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                      onClick={() => {
                        handleFileUpload()
                        setFile(null)
                        setShowFileInput(false)
                      }}
                      disabled={loadingUpload}
                    >
                      {loadingUpload ? "Uploading..." : "Upload"}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          )}          
           <div className="mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-4 py-1.5 rounded-md hover:shadow-lg transition-all duration-300 text-sm"
              onClick={handleUploadClick}
              disabled={loadingUpload || !email}
            >
              Upload File
            </motion.button>
          </div>


          <div className="mb-8 flex-1 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
              Files
            </h2>
            {fileTitles.length > 0 && (
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)", scrollbarWidth: "thin", scrollbarColor: "#4F46E5 transparent" }}>
                <div className="space-y-2 pr-2">
                  {fileTitles.map((file, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="cursor-pointer text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-fuchsia-600 p-2 rounded transition-colors"
                      onClick={() => handleFileSelect(file.title)}
                    >
                      {file.title}
                    </motion.div>
                  ))}
                </div>
              </div>            )}
          </div>
          <div className="mt-auto">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full text-left p-2 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-fuchsia-600 rounded transition-colors flex items-center text-white bg-gradient-to-r from-indigo-600 to-purple-600"
                onClick={toggleMenu}
                onMouseEnter={() => setHoveredItem("logout")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {hoveredItem === "logout" && <PiSignOutDuotone className="mr-2" />}
                <span>Logout</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-100 text-red-700 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}

            {fileText && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6 p-4 bg-white/95 rounded-lg shadow-lg border border-gray-200"
              >
                <h2 className="text-xl font-bold mb-2">Extracted Text</h2>
                <div className="max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                  {fileText}
                </div>
              </motion.div>
            )}

            {queryResponse && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6 p-4 bg-white/95 rounded-lg shadow-lg border border-gray-200"
              >
                <h2 className="text-xl font-bold mb-2">Response</h2>
                <div dangerouslySetInnerHTML={renderMarkdown(queryResponse)} />
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-t bg-white/95 p-4"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter your query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                onClick={handleQuerySubmit}
                disabled={loadingQuery || !query}
              >
                <IoSendSharp size={20} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FileExtractor;