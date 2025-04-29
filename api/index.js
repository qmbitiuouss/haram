const axios = require('axios');
const requestIp = require('request-ip');
const useragent = require('express-useragent');

module.exports = async (req, res) => {
  // Get IP address
  const ip =
    requestIp.getClientIp(req) ||
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress;

  // Get User-Agent info
  const ua = useragent.parse(req.headers['user-agent']);

  // IPInfo API token
  const token = 'ab1fe36559454b';
  const geoURL = `https://ipinfo.io/${ip}?token=${token}`;

  let geo = {};
  try {
    const response = await axios.get(geoURL);
    geo = response.data;
  } catch (error) {
    geo = { city: "N/A", region: "N/A", country: "N/A", loc: "N/A", org: "N/A" };
  }

  // Prepare HTML output
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fuddu ko ullu banaya</title>
        <style>
          body {
            background-color: #000;
            color: #0f0;
            font-family: monospace;
            padding: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .box {
            border: 2px dashed #0f0;
            border-radius: 10px;
            padding: 30px;
            max-width: 600px;
            width: 100%;
          }
          h1 {
            font-size: 24px;
            color: #f00;
            margin-bottom: 20px;
          }
          p {
            margin: 6px 0;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Fuddu ko ullu banaya</h1>
          <p><strong>IP Address:</strong> ${ip}</p>
          <p><strong>City:</strong> ${geo.city || "N/A"}</p>
          <p><strong>Region:</strong> ${geo.region || "N/A"}</p>
          <p><strong>Country:</strong> ${geo.country || "N/A"}</p>
          <p><strong>Coordinates:</strong> ${geo.loc || "N/A"}</p>
          <p><strong>ISP:</strong> ${geo.org || "N/A"}</p>
          <p><strong>Browser:</strong> ${ua.browser || "N/A"}</p>
          <p><strong>OS:</strong> ${ua.os || "N/A"}</p>
          <p><strong>Platform:</strong> ${ua.platform || "N/A"}</p>
        </div>
      </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
};
