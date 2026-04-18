const express = require("express");
const https = require("https");
const http = require("http");
const app = express();
const PORT = process.env.PORT || 3000;
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "iCal Proxy - Conciergerie Raymond" });
});
app.get("/ical", (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Paramètre url manquant" });
  const decoded = decodeURIComponent(url);
  const allowed = ["airbnb.com", "airbnb.fr", "booking.com", "vrbo.com"];
  if (!allowed.some((d) => decoded.includes(d))) return res.status(403).json({ error: "Domaine non autorisé" });
  const client = decoded.startsWith("https") ? https : http;
  const opts = { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "Accept": "text/calendar, */*" } };
  client.get(decoded, opts, (proxyRes) => {
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    proxyRes.pipe(res);
  }).on("error", (err) => res.status(500).json({ error: err.message }));
});
app.listen(PORT, () => console.log("Proxy démarré sur le port " + PORT));
