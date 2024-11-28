import { useState } from 'react';
import axios from 'axios';
import { marked } from 'marked';  // Import marked library for Markdown conversion

const WebScrapper = () => {
  const [message, setMessage] = useState(''); // URL to scrape
  const [query, setQuery] = useState(''); // User's query
  const [response, setResponse] = useState(''); // Response to display from server
  const [loading, setLoading] = useState(false); // Show loading state
  const [error, setError] = useState(''); // For handling errors
  const [selectedQuestion, setSelectedQuestion] = useState(''); // Track selected predefined question

  // Predefined questions for the user to select
  const predefinedQuestions = [
    'What is the purpose of this website?',
    'Can you summarize the main content?',
    'What are the key features of the site?',
  ];

  // Function to check if the query is a greeting
  const isGreeting = (query) => {
    const greetings = ['hi', 'hello', 'hey', 'hii', 'howdy'];
    return greetings.some(greeting => query.toLowerCase().includes(greeting));
  };

  // Send the URL to the backend server for scraping
const handleSendMessage = async () => {
  if (!message) {
    setError('Please enter a valid URL');
    return; // Prevent request if the URL is empty
  }

  setError(''); // Clear any previous errors
  setLoading(true); // Show loading indicator
  console.log('Sending request with URL:', message); // Log the URL being sent

  try {
    // Send URL to backend for scraping
    const backendUrl = await backEndUrl(); // Wait for the backend URL
    const res = await axios.post(`${backendUrl}/scrape`, {
      url: message,
    });

    console.log('Received response:', res.data); // Log the response from the server

    // Check if the response contains valid content
    if (Array.isArray(res.data.scrapedContent)) {
      const formattedResponse = res.data.scrapedContent.map((item, index) => (
        `<strong>Page ${index + 1}: <a href="${item.url}" target="">${item.url}</a></strong><br /><br />${item.content}<br /><br />`
      )).join(''); 

      setResponse(formattedResponse);
    } else {
      setResponse('No valid content found.');
    }

  } catch (error) {
    console.error('Error during API call:', error); // Log any errors
    setError('Error while scraping. Please try again later.');
    setResponse(''); // Clear the previous response if there's an error
  } finally {
    setLoading(false); // Hide loading indicator
  }
};


  // Send the query (or selected question) to the backend for processing
  const handleQuery = async () => {
    const queryToSend = selectedQuestion || query;
  
    if (!queryToSend) {
      setError('Please enter or select a valid query');
      return;
    }
  
    setError('');
    setLoading(true);
    console.log('Sending query:', queryToSend);
  
    try {
      const backendUrl = await backEndUrl(); // Wait for the backend URL
      const res = await axios.post(`${backendUrl}/query`, {
        query: queryToSend,
      });
  
      console.log('Received AI response:', res.data);
  
      // Convert the AI response from Markdown to HTML
      const htmlResponse = marked(res.data.response);  // Convert Markdown to HTML
  
      // Now, integrate the URLs with the AI analysis in the response
      let formattedResponse = `
        <strong>AI Analysis:</strong><br />${htmlResponse}<br /><br />
        <strong>Original Content:</strong><br />${res.data.content.join('<br /><br />')}
      `;
  
      // Ensure that the URLs are clickable
      if (res.data.urls && res.data.urls.length > 0) {
        formattedResponse += `
          <br /><br /><strong>Scraped URLs (Sources):</strong><br />
          ${res.data.urls.map((url, index) => {
            return `
              <p><strong>Source ${index + 1}:</strong> 
              <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>
            `;
          }).join('')}
        `;
      }
  
      setResponse(formattedResponse);
  
    } catch (error) {
      console.error('Error during query API call:', error);
      setError('Error while querying. Please try again later.');
      setResponse('');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <h1>AI-Enhanced Web Scraping</h1>

      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter URL to scrape"
        ></textarea>
        <button onClick={handleSendMessage} disabled={loading}>Start Scraping</button>
      </div>

      <div>
        {/* Predefined Questions Dropdown */}
        <select 
          value={selectedQuestion} 
          onChange={(e) => setSelectedQuestion(e.target.value)} 
          disabled={loading}>
          <option value="">Select a predefined question</option>
          {predefinedQuestions.map((question, index) => (
            <option key={index} value={question}>{question}</option>
          ))}
        </select>

        {/* User Custom Query Input */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          disabled={selectedQuestion !== ''}
        ></textarea>

        <button onClick={handleQuery} disabled={loading}>Submit Query</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && <div dangerouslySetInnerHTML={{ __html: response }} />}
    </div>
  );
};

export default WebScrapper;
