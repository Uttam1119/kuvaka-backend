const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const OFFER_FILE = path.join(DATA_DIR, "offer.json");

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    if (!body || !body.name)
      return res.status(400).json({ error: "offer.name is required" });
    fs.writeFileSync(OFFER_FILE, JSON.stringify(body, null, 2));
    return res.json({ ok: true, offer: body });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed to save offer" });
  }
});

router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(OFFER_FILE))
      return res.status(404).json({ error: "no offer found" });
    const offer = JSON.parse(fs.readFileSync(OFFER_FILE, "utf8"));
    return res.json(offer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed to read offer" });
  }
});

module.exports = router;
