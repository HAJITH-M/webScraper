import { useState, useEffect } from "react";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { PiSignOutDuotone } from "react-icons/pi";
import { backEndUrl } from "../utils/BackendUrl";
import { motion } from "framer-motion";

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
  const [hasScraped, setHasScraped] = useState(false); // Track scrape status

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const predefinedQuestions = [
    "What is the purpose of this website?",
    "Can you summarize the main content?",
    "What are the key features of the site?",
  ];

  // Function to check if user has already scraped
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
        <strong>AI Analysis:</strong><br />${sanitizedResponse}<br /><br />
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

  // Checking if user has scraped data on component mount
  useEffect(() => {
    if (selectedQuestion) {
      setQuery("");
    }
    checkScrapeStatus(); // Check the scrape status on component mount
  }, [selectedQuestion]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 bg-white/95 shadow-xl border-r border-gray-200 backdrop-blur-md text-gray-800 p-4"
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
              Menu
            </h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full text-left p-2 hover:bg-gradient-to-r from-indigo-50 to-fuchsia-50 rounded transition-colors mb-2"
              onClick={() => {
                setMessage("");
                setShowScraper(!showScraper);
              }}
            >
              Start Scraping
            </motion.button>
            {hasScraped && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full text-left p-2 hover:bg-gradient-to-r from-indigo-50 to-fuchsia-50 rounded transition-colors mb-2"
                onClick={handleDeleteScrapedData} // Handle delete action
              >
                Delete Scraped Data
              </motion.button>
            )}
            <p className="mt-2 text-sm text-gray-600">{hasScraped ? "1/1 Scrapes" : "0/1 Scrapes"}</p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full text-left p-2 hover:bg-gradient-to-r from-indigo-50 to-fuchsia-50 rounded transition-colors flex items-center"
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}

          {/* Chat Container */}
          <div className="flex-1 overflow-auto p-6">
            {response && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6 p-4 bg-white/95 rounded-lg shadow-lg border border-gray-200 backdrop-blur-md"
              >
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: response }}
                />
              </motion.div>
            )}
            {loading && (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-100 text-red-700 rounded-lg mb-4 border border-red-200"
              >
                {error}
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-t bg-white/95 p-4 backdrop-blur-md"
          >
            {showScraper && (
              <div className="mb-4">
                <textarea
                  className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter URL to scrape"
                  rows={2}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                  onClick={handleSendMessage}
                  disabled={loading}
                >
                  Start Scraping
                </motion.button>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {predefinedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      selectedQuestion === question
                        ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-indigo-500"
                    }`}
                    onClick={() => setSelectedQuestion(question === selectedQuestion ? "" : question)}
                    disabled={loading}
                  >
                    {question}
                  </motion.button>
                ))}
              </div>

              <div className="flex space-x-2">
                <textarea
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your query"
                  disabled={selectedQuestion !== ""}
                  rows={1}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                  onClick={handleQuery}
                  disabled={loading}
                >
                  Send
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WebScrapper;
