import { useState, useEffect, useRef } from "react";
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
import { HelmetProvider, Helmet } from "react-helmet-async";
import * as jwt_decode from 'jwt-decode'; // Changed import syntax


const WebScrapper = () => {
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showScraper, setShowScraper] = useState(false);

  const [hasScraped, setHasScraped] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNoDataModal, setShowNoDataModal] = useState(false);

  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [userInitial, setUserInitial] = useState("");
  const [email, setEmail] = useState("");


  // Extract email from JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwt_decode.jwtDecode(token);
        const userEmail = decodedToken.email;
        setEmail(userEmail);
      } catch (err) {
        console.error("Error decoding token:", err);
        setError("Invalid authentication token");
      }
    }
  }, []); // Empty dependency array to run once after the initial render

  useEffect(() => {
    if (email) {
      setUserInitial(email[0].toUpperCase());  // Set the initial based on the email's first letter
    }
  }, [email]);  // Only runs when the email state is updated
  
  

  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(!token){
      navigate("/login");
      
    }

  },[])



 


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

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const predefinedQuestions = [
    "What is the purpose of this website?",
    "Can you summarize the main content?",
    "What are the key features of the site?",
  ];

  const checkScrapeStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to scrape data.");
        return;
      }
  
      const backendUrls = await backEndUrl();
      const res = await axios.get(
        `${backendUrls}/api/check-scrape-status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setHasScraped(res.data.hasScraped); // Set the scrape status
    } catch (error) {
      setError("Error checking scrape status.");
    }
  };
  
  // Function to handle the scraping process
  const handleSendMessage = async () => {
    if (!message) {
      setError("Please enter a valid URL");
      return;
    }
    if (hasScraped) {
      setError("You have already scraped data. Please use the previously scraped data before scraping again.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to scrape data.");
        return;
      }
  
      const backendUrls = await backEndUrl();
      const res = await axios.post(
        `${backendUrls}/scrape`,
        { url: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (Array.isArray(res.data.scrapedContent)) {
        const formattedResponse = res.data.scrapedContent
          .map(
            (item, index) =>
              `<strong>Page ${index + 1}: <a href="${item.url}" target="">${item.url}</a></strong><br /><br />${item.content}<br /><br />`
          )
          .join("");
        setResponse(formattedResponse);
        setHasScraped(true); // Set scrape status to true
      } else {
        setResponse("No valid content found.");
      }
    } catch (error) {
      setError("Error while scraping. Please try again later.");
      setResponse("");
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle querying process
  const handleQuery = async () => {
    const queryToSend = selectedQuestion || query;

    if (!hasScraped) {
      setShowNoDataModal(true);
      return;
    }
  
    if (!queryToSend) {
      setError("Please enter or select a valid query");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to query data.");
        return;
      }
  
      const backendUrls = await backEndUrl();
      const res = await axios.post(
        `${backendUrls}/query`,
        { query: queryToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const htmlResponse = marked(res.data.response);
      const sanitizedResponse = DOMPurify.sanitize(htmlResponse);
  
      let formattedResponse = `
        <strong >ZaraX Analysis:</strong><br />${sanitizedResponse}<br /><br />
      `;
  
      if (res.data.urls && res.data.urls.length > 0) {
        formattedResponse += `
          <br /><br /><strong>Scraped URLs (Sources):</strong><br />
          ${res.data.urls
            .map(
              (url, index) =>
                `<p><strong>Source ${index + 1}:</strong> 
            <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`
            )
            .join("")}
        `;
      }
  
      setResponse(formattedResponse);
      setSelectedQuestion("")
    } catch (error) {
      if (error.response) {
        console.error("Error Response:", error.response.data);
        setError(`Error: ${error.response.data.message || "Unknown error"}`);
      } else if (error.request) {
        console.error("Error Request:", error.request);
        setError("No response from server. Please try again later.");
      } else {
        console.error("Error Message:", error.message);
        setError("Error while querying. Please try again later.");
      }
      setResponse("");
    } finally {
      setLoading(false);
    }
  };
  
  // Function to delete previously scraped data
  const handleDeleteScrapedData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to delete scraped data.");
        return;
      }
  
      const backendUrls = await backEndUrl();
      await axios.delete(`${backendUrls}/api/delete-scraped-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setHasScraped(false); // Reset scrape status to false
      setResponse(""); // Clear the response data
      setError(""); // Clear any previous error
      setMessage(""); // Clear message field for new scrape
    } catch (error) {
      setError("Error while deleting scraped data. Please try again later.");
    }
  };
  
  useEffect(() => {
    if (selectedQuestion) {
      setQuery("");
    }

    checkScrapeStatus();
  }, [selectedQuestion]);

  return (
    <HelmetProvider>
    <Helmet>
        <title>WebScraper - ZaraX AI</title>
        <meta name="description" content="Create your account for WebScraper" />
    </Helmet>


    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black">

{showNoDataModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg border border-cyan-500 max-w-md">
      <h3 className="text-xl font-bold mb-4 text-cyan-400">No Data Available</h3>
      <p className="text-white mb-4">Please scrape a website first before making queries.</p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => {
            setShowNoDataModal(false);
            setShowScraper(true);
          }}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded hover:from-cyan-400 hover:to-fuchsia-600"
        >
          Start Scraping
        </button>
        <button
          onClick={() => setShowNoDataModal(false)}
          className="border border-cyan-500 text-cyan-400 px-4 py-2 rounded hover:bg-cyan-500/10"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      <div className="flex h-screen relative">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-900 text-white"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <AiOutlineClose size={24} /> : <HiMenuAlt3 size={24} />}
        </button>

        {/* Sidebar */}
        <div
          ref={sidebarRef}

          className={`fixed lg:relative w-64 h-full border-r-2 border-indigo-800 bg-gradient-to-b from-black via-gray-900 to-black shadow-xl text-white p-4 flex flex-col z-40 transform transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="mb-8">
    
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">{email ? email[0].toUpperCase() : '?'}</span>
            </div>
            <div >
            <div className="text-sm font-bold text-cyan-400">WebScraper</div> 
            <div className="text-sm truncate text-cyan-400">{email || 'Not signed in'}</div>
            </div>
            
        </div>
    
            <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
              Web Scraper
            </h2>
            {/* // Then in the sidebar menu button, update it to show the scraper when clicked */}
<button
  className={`w-full text-left p-2 rounded transition-colors mb-2 text-white ${
    showScraper ? 'bg-gradient-to-r from-cyan-500 to-purple-600' : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-fuchsia-600'
  }`}
  onClick={() => {
    setMessage("");
    setShowScraper(!showScraper);
  }}
>
  Start Scraping
</button>
            {hasScraped && (
              <button

                className="w-full text-left p-2 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-fuchsia-600 rounded transition-colors mb-2 text-white bg-gradient-to-r from-cyan-500 to-purple-600"
                onClick={handleDeleteScrapedData}
              >
                Delete Scraped Data
              </button>
            )}


            <p className="mt-2 text-sm text-cyan-400">{hasScraped ? "1/1 Scrapes" : "0/1 Scrapes"}</p>
          </div>
          <div className="mt-auto">
            <Link to="/">
              <button

                className="w-full text-left p-2 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-fuchsia-600 rounded transition-colors flex items-center text-white bg-gradient-to-r from-cyan-500 to-purple-600"
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
        <h1 className="text-center text-2xl text-gray-400 font-light my-4">WebScraper</h1>

          {/* Chat Container */}
          <div className="flex-1 overflow-auto p-6">
            {response && (
              <div

                className="mb-6 p-4 bg-black/90 rounded-lg shadow-lg border border-cyan-500 backdrop-blur-md text-white"
              >
                <div

                  className="prose max-w-none prose-invert"
                  dangerouslySetInnerHTML={{ __html: response }}
                />
              </div>
            )}
            {loading && (
              <div className="flex justify-center items-center p-4">

                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              </div>
            )}
            {error && (
              <div

                className="p-4 bg-red-900/80 text-red-200 rounded-lg mb-4 border border-red-500"
              >
                {error}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div

            className=" bg-black/90 p-4 backdrop-blur-md"
          >
            {showScraper && (
              <div className="mb-4">
                <textarea

                  className="w-full p-3 border border-cyan-500 rounded-lg mb-3 focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-black/90 text-white"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter URL to scrape"
                  rows={2}
                />
                <button

                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-fuchsia-600"
                  onClick={handleSendMessage}
                  disabled={loading}
                >
                  Start Scraping
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {predefinedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      selectedQuestion === question


                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                        : "bg-black/90 border border-cyan-500 text-cyan-400 hover:border-purple-500"
                    }`}
                    onClick={() => setSelectedQuestion(question === selectedQuestion ? "" : question)}
                    disabled={loading}
                  >
                    {question}
                  </button>
                ))}
              </div>

              <div className="flex space-x-2">
                <textarea

                  className="flex-1 p-3 border border-cyan-500 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-black/90 text-white"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your query"
                  disabled={selectedQuestion !== ""}
                  rows={1}
                />
                <button

                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-fuchsia-600 flex items-center justify-center"
                  onClick={handleQuery}
                  disabled={loading}
                >
                  <IoSendSharp size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </HelmetProvider>
  );
};

export default WebScrapper;