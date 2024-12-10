import { useState, useEffect } from "react";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify"; // For sanitizing HTML
import { Link } from "react-router-dom";
import { PiSignOutDuotone } from "react-icons/pi";
import { backEndUrl } from "../utils/BackendUrl";

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

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const predefinedQuestions = [
    "What is the purpose of this website?",
    "Can you summarize the main content?",
    "What are the key features of the site?",
  ];


  const handleSendMessage = async () => {
    if (!message) {
      setError("Please enter a valid URL");
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
  
      // Process response
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
      // Log and display error message
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
  
  useEffect(() => {
    if (selectedQuestion) {
      setQuery("");
    }
  }, [selectedQuestion]);

  return (
    <div className="flex">
      <div className="w-1/4 bg-gray-800 text-white h-screen p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          <button
            className="w-full text-left p-2 hover:bg-gray-700 rounded transition-colors"
            onClick={() => {
              setMessage("");
              setShowScraper(!showScraper);
            }}
          >
            Start Scraping
          </button>
          <Link to="/">
            <button
              className="w-full text-left p-2 hover:bg-gray-700 rounded transition-colors flex items-center"
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

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">AI-Enhanced Web Scraping</h1>

        {showScraper && (
          <div className="mb-6">
            <textarea
              className="w-full p-3 border rounded-lg mb-3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter URL to scrape"
              rows={3}
            />
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              onClick={handleSendMessage} 
              disabled={loading}
            >
              Start Scraping
            </button>
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <select
            className="p-2 border rounded"
            value={selectedQuestion}
            onChange={(e) => setSelectedQuestion(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a predefined question</option>
            {predefinedQuestions.map((question, index) => (
              <option key={index} value={question}>
                {question}
              </option>
            ))}
          </select>

          <div className="flex flex-col space-y-4">
            <textarea
              className="w-full p-3 border rounded-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query"
              disabled={selectedQuestion !== ""}
              rows={4}
            />
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              onClick={handleQuery} 
              disabled={loading}
            >
              Submit Query
            </button>
          </div>
        </div>

        <div className="mt-6">
          {loading && <p className="text-gray-600">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {response && (
            <div 
              className="p-4 bg-gray-50 rounded-lg"
              dangerouslySetInnerHTML={{ __html: response }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WebScrapper;