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
        <strong>Original Content:</strong><br />${res.data.content.join("<br /><br />")}
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
    <div>
      <h1>AI-Enhanced Web Scraping</h1>
      <Link to="/">
        <button
          onClick={toggleMenu}
          onMouseEnter={() => setHoveredItem("logout")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {hoveredItem === "logout" && <PiSignOutDuotone />}
          <span>Logout</span>
        </button>
      </Link>

      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter URL to scrape"
        />
        <button onClick={handleSendMessage} disabled={loading}>
          Start Scraping
        </button>
      </div>

      <div>
        <select
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

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          disabled={selectedQuestion !== ""}
        />
        <button onClick={handleQuery} disabled={loading}>
          Submit Query
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {response && <div dangerouslySetInnerHTML={{ __html: response }} />}
    </div>
  );
};

export default WebScrapper;
