const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

const upload = multer({ storage: multer.memoryStorage() });

function readLeads() {
  if (!fs.existsSync(LEADS_FILE)) return [];
  return JSON.parse(fs.readFileSync(LEADS_FILE, "utf8"));
}

function writeLeads(leads) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// Upload CSV
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ error: "file (CSV) is required in field `file`" });
    const text = req.file.buffer.toString("utf8");
    const records = parse(text, { columns: true, skip_empty_lines: true });
    const leads = readLeads();
    const toAdd = records.map((r) => ({
      id: uuidv4(),
      name: r.name || "",
      role: r.role || "",
      company: r.company || "",
      industry: r.industry || "",
      location: r.location || "",
      linkedin_bio: r.linkedin_bio || "",
    }));
    const combined = leads.concat(toAdd);
    writeLeads(combined);
    res.json({ ok: true, added: toAdd.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to parse CSV" });
  }
});

router.get("/", (req, res) => {
  res.json(readLeads());
});

module.exports = router;
