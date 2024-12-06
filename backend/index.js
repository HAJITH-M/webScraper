const express = require('express');
const playwright = require('playwright');
const url = require('url');
const cors = require('cors');
const cheerio = require('cheerio');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import the GoogleGenerativeAI client

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const fileUploadRoutes = require('./routes/fileExtractor')
const emailFileExtractorRoutes = require('./routes/emailfileextractor')
const loginRoutes = require('./routes/Login')
const ChatBot = require('./routes/chatBot')
const app = express();
const port = 5000;

// Middleware to handle CORS and JSON parsing
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer token format
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to authenticate token' });
    }
    req.userId = decoded.id; // Save user ID for future use
    next();
  });
};

// Default route
app.get('/', async (req, res) => {
  try {
    await prisma.$connect();
    const message = "Welcome, BackEnd connected successfully";
    res.json({ message: message, success: true, status: 'OK', details: 'Connected to the database!' });
  } catch (error) {
    console.error('Error connecting to the database:', error);
    res.status(500).json({ success: false, status: 'ERROR', message: 'Failed to connect to the database.' });
  } finally {
    await prisma.$disconnect();
  }
});

// API route to handle file upload
app.use('/api', fileUploadRoutes);

// API route to handle file upload with email
app.use('/api', emailFileExtractorRoutes);

// API route to handle login
app.use('/api', loginRoutes);

// API route to handle chatBot
app.use('/api', ChatBot);

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Use your GEMINI API key from .env
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Function to extract internal links from a page
const extractInternalLinks = (baseUrl, pageContent, visited) => {
  const $ = cheerio.load(pageContent);
  const links = [];

  $('a').each((_, element) => {
    let href = $(element).attr('href');
    if (href) {
      const absoluteUrl = url.resolve(baseUrl, href);
      if (absoluteUrl.startsWith(baseUrl) && !visited.has(absoluteUrl)) {
        links.push(absoluteUrl); // Only keep links from the same domain
      }
    }
  });

  return links;
};

// Function to scrape content from a single page
const scrapePage = async (pageUrl, browser) => {
  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

  const pageContent = await page.content(); // Playwright fetches the full HTML
  const title = await page.title();
  const textContent = await page.evaluate(() => document.body.innerText);

  await page.close();

  return {
    url: pageUrl,
    title,
    content: textContent,
    html: pageContent,
  };
};

// Function to crawl the given URL and scrape all internal pages
const crawlAndScrape = async (startUrl, browser) => {
  const visited = new Set(); // To avoid revisiting the same page
  const toVisit = [startUrl]; // Pages to visit
  let scrapedContent = [];

  while (toVisit.length > 0) {
    const currentUrl = toVisit.pop();
    if (visited.has(currentUrl)) continue; // Skip already visited pages
    visited.add(currentUrl);

    try {
      console.log('Visiting:', currentUrl); // Log the URL being visited
      const pageData = await scrapePage(currentUrl, browser);
      scrapedContent.push(pageData);

      const links = extractInternalLinks(currentUrl, pageData.html, visited);
      console.log('Found links:', links); // Log the links found on the page

      links.forEach(link => {
        if (!visited.has(link)) {
          toVisit.push(link);
        }
      });
    } catch (err) {
      console.error(`Error scraping page ${currentUrl}:`, err);
    }
  }

  return scrapedContent;
};


app.post('/scrape', authenticate, async (req, res) => {
  const { url: startUrl } = req.body;

  if (!startUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await playwright.chromium.launch({ headless: true });
    const scrapedContent = await crawlAndScrape(startUrl, browser);
    await browser.close();

    for (const page of scrapedContent) {
      await prisma.scrapedData.create({
        data: {
          title: page.title,
          content: page.content,
          url: page.url,
          userId: req.userId, // Save data for the logged-in user
        },
      });
    }

    res.json({ scrapedContent });
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Failed to scrape the URL. Please try again later.' });
  }
});


// Route to query scraped data and enhance response with AI (Google Vertex AI / Gemini)
app.post('/query',authenticate, async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const normalizedQuery = query.toLowerCase();
    console.log('Normalized query:', normalizedQuery);  // Log the normalized query

    // Get the scraped data that might be useful for the AI model
    const scrapedData = await prisma.scrapedData.findMany(); // Get all scraped data

    // If no scraped data, return a generic response
    if (scrapedData.length === 0) {
      return res.json({ response: 'Sorry, I do not have enough information about this site yet.' });
    }

    // Construct the prompt for AI model based on the content of the scraped data and URLs
    const prompt = `
    The user has asked: "${query}". 
    We have the following content about this site:
    
    ${scrapedData.map((data, index) => {
      return `Content from page ${index + 1}: 
      "${data.content}"
      Source URL: ${data.url}
      `;
    }).join('\n\n')}
    
    Please analyze the query and provide a helpful and accurate response based on the content of the website.
    If the query is a greeting, respond with an appropriate friendly greeting that invites the user to ask more specific questions or explore the website. 
    If the query doesn't relate to the content, encourage them to ask a more specific question or provide more context.
    If the query is related to the content of the site, provide an answer based on the site's information, and if relevant, reference the URLs.
    `;

    // Send the prompt to the AI model for analysis and response
    const aiResult = await model.generateContent(prompt);

    // Return the AI-generated response along with the URLs and scraped content
    res.json({
      response: aiResult.response.text() || 'I couldn\'t generate a response.',
      content: scrapedData.map((data) => data.content),
      urls: scrapedData.map((data) => data.url), // Add URLs to the response
    });
  } catch (error) {
    console.error('Error during query processing:', error.message);
    res.status(500).json({
      error: 'Query failed',
      details: error.message,
    });
  }
});


module.exports = (req, res) => {
  app(req, res);
};


// Start the server
app.listen(port, async () => {
  try {
    await prisma.$connect();
    console.log('Connected to the database');
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
});



