const express = require('express');
const axios = require('axios');
const useragent = require('useragent');
const requestIp = require('request-ip');
const { MongoClient } = require('mongodb');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection URI (use your MongoDB Atlas URI)
const mongoUri = 'mongodb+srv://technicalfuss15:ajQ62pTiNbIlTPVq@cluster0.mongodb.net/visitorLogs?retryWrites=true&w=majority'; // Replace with your actual connection string

// Initialize MongoDB client
const client = new MongoClient(mongoUri);

// Your IP Geolocation token from ipinfo.io
const token = 'ab1fe36559454b';

// Middleware to serve static files (e.g., for HTML, CSS, JS files)
app.use(express.static('public'));

// Route to display visitor data on the website
app.get('/', async (req, res) => {
  const ip = requestIp.getClientIp(req);
  const ua = useragent.parse(req.headers['user-agent']);
  const geoURL = `https://ipinfo.io/${ip}?token=${token}`;

  let geo = {};
  try {
    const response = await axios.get(geoURL);
    geo = response.data;
  } catch (error) {
    geo = { city: "N/A", region: "N/A", country: "N/A", loc: "N/A", org: "N/A" };
  }

  const visitorData = {
    ip,
    city: geo.city,
    region: geo.region,
    country: geo.country,
    loc: geo.loc,
    org: geo.org,
    browser: ua.browser,
    os: ua.os,
    platform: ua.platform,
    timestamp: new Date()
  };

  try {
    // Connect to MongoDB and insert the data
    await client.connect();
    const database = client.db('visitorLogs');
    const collection = database.collection('logs');
    await collection.insertOne(visitorData);
    await client.close();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).send('Error saving visitor data.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Visitor Information</title>
        <style>
          body { background-color: #000; color: #0f0; font-family: monospace; }
          h1 { color: red; }
        </style>
      </head>
      <body>
        <h1>Visitor Information</h1>
        <p><strong>IP Address:</strong> ${ip}</p>
        <p><strong>City:</strong> ${geo.city}</p>
        <p><strong>Region:</strong> ${geo.region}</p>
        <p><strong>Country:</strong> ${geo.country}</p>
        <p><strong>Coordinates:</strong> ${geo.loc}</p>
        <p><strong>Organization:</strong> ${geo.org}</p>
        <p><strong>Browser:</strong> ${ua.browser}</p>
        <p><strong>Operating System:</strong> ${ua.os}</p>
        <p><strong>Platform:</strong> ${ua.platform}</p>
      </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
});

// Endpoint to view stored logs (for admin or public viewing)
app.get('/logs', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('visitorLogs');
    const collection = database.collection('logs');
    const logs = await collection.find().toArray();
    await client.close();

    // Render logs as JSON for admin
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).send('Error fetching logs.');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
