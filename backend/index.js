const express = require('express');
const playwright = require('playwright');
const url = require('url');
const cors = require('cors');
const cheerio = require('cheerio'); // For parsing HTML and extracting links
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const openai = require('openai'); // Import OpenAI SDK

const app = express();
const port = 5000;

// Middleware to handle CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize OpenAI API Client
const openaiClient = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Load your OpenAI API key from environment variables
});

// Function to extract internal links from a page
const extractInternalLinks = (baseUrl, pageContent, visited) => {
  const $ = cheerio.load(pageContent);
  const links = [];

  // Find all anchor tags with href attributes
  $('a').each((_, element) => {
    let href = $(element).attr('href');
    if (href) {
      // Resolve relative links to absolute ones
      const absoluteUrl = url.resolve(baseUrl, href);

      // Ensure it's part of the same domain and not external, also check if it's already visited
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

  // Get the full HTML content of the page
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
      // Scrape the current page
      const pageData = await scrapePage(currentUrl, browser);
      scrapedContent.push(pageData);

      // Get the internal links on this page
      const links = extractInternalLinks(currentUrl, pageData.html, visited);
      console.log('Found links:', links); // Log the links found on the page

      // Add new links to the queue
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

// Route to scrape content from the provided URL
app.post('/scrape', async (req, res) => {
  const { url: startUrl } = req.body;

  if (!startUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await playwright.chromium.launch({ headless: true });
    const scrapedContent = await crawlAndScrape(startUrl, browser);
    await browser.close();

    // Save scraped data to the database
    for (const page of scrapedContent) {
      await prisma.scrapedData.create({
        data: {
          title: page.title,
          content: page.content,
          url: page.url,
        },
      });
    }

    res.json({ scrapedContent });
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Failed to scrape the URL. Please try again later.' });
  } finally {
    await prisma.$disconnect();
  }
});

// Route to query scraped data and enhance response with AI
app.post('/query', async (req, res) => {
  const { query } = req.body;

  try {
    // Search for relevant content in the database
    const data = await prisma.scrapedData.findFirst({
      where: {
        content: {
          contains: query,
          mode: 'insensitive', // Case-insensitive search
        },
      },
    });

    if (!data) {
      return res.status(404).json({ response: 'No relevant data found.' });
    }

    // If content is found, enhance the response using OpenAI
    const aiResponse = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an AI assistant that provides detailed answers based on the provided data.' },
        { role: 'user', content: `Provide a detailed answer based on the following content: ${data.content}` },
        { role: 'user', content: `User's query: ${query}` },
      ],
    });

    res.json({
      response: aiResponse.choices[0].message.content,
      content: data.content,
    });
  } catch (error) {
    console.error("Error during query processing:", error);
    res.status(500).json({ error: "Query failed" });
  }
});

// Start the server
app.listen(5000, () => console.log("Server running on port 5000"));
