const express = require("express");
const axios = require("axios");
const useragent = require("express-useragent");
const app = express();
const PORT = 3000;

// IPInfo token (replace with your actual token if needed)
const IPINFO_TOKEN = ""; // optional if not using paid features

// Google Sheets webhook (Apps Script)
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbynwJi-tb0cl1Uw2O_7D6Kf5Hmbg6HcC1k_wkE5FLzRGKuWHWOl3b6NGCrMk8vHiBtOdw/exec";

app.use(useragent.express());

app.get("/", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ua = req.useragent;

  let locationData = {
    ip,
    city: "N/A",
    region: "N/A",
    country: "N/A",
    loc: "N/A",
    org: "N/A"
  };

  try {
    const ipinfoUrl = IPINFO_TOKEN
      ? `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`
      : `https://ipinfo.io/${ip}`;

    const ipRes = await axios.get(ipinfoUrl);
    locationData = {
      ip: ipRes.data.ip || ip,
      city: ipRes.data.city || "N/A",
      region: ipRes.data.region || "N/A",
      country: ipRes.data.country || "N/A",
      loc: ipRes.data.loc || "N/A",
      org: ipRes.data.org || "N/A"
    };
  } catch (err) {
    console.error("Failed to get IP info:", err.message);
  }

  const payload = {
    ...locationData,
    browser: ua.browser,
    os: ua.os,
    platform: ua.platform
  };

  try {
    await axios.post(SHEETS_WEBHOOK_URL, payload, {
      headers: { "Content-Type": "application/json" }
    });
    console.log("✅ Logged to Google Sheets");
  } catch (err) {
    console.error("❌ Failed to log to Google Sheets:", err.message);
  }

  res.send("Fuddu ko ullu banaya");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
