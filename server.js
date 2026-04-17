const express = require("express");
const cors = require("cors");
const https = require("https");
const http = require("http");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "iCal Proxy - Conciergerie Raymond" });
});
app.get("/ical", (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Paramètre url manquant" });
  const allowed = ["airbnb.com", "booking.com", "airbnb.fr"];
  if (!allowed.some((d) => url.includes(d))) return res.status(403).json({ error: "Domaine non autorisé" });
  const client = url.startsWith("https") ? https : http;
  client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (proxyRes) => {
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    proxyRes.pipe(res);
  }).on("error", (err) => res.status(500).json({ error: err.message }));
});
app.listen(PORT, () => console.log("Proxy démarré sur le port " + PORT));
