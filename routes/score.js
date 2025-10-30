const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const {
  roleScore,
  industryScore,
  completenessScore,
} = require("../utils/rules");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const OFFER_FILE = path.join(DATA_DIR, "offer.json");
const RESULTS_FILE = path.join(DATA_DIR, "results.json");

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Read leads and offers
function readLeads() {
  if (!fs.existsSync(LEADS_FILE)) return [];
  return JSON.parse(fs.readFileSync(LEADS_FILE, "utf8"));
}
function readOffer() {
  if (!fs.existsSync(OFFER_FILE)) return null;
  return JSON.parse(fs.readFileSync(OFFER_FILE, "utf8"));
}

// AI classify using Gemini
async function aiClassifyLead(lead, offer) {
  const prompt = `Offer: ${JSON.stringify(offer)}
Prospect: ${JSON.stringify(lead)}
Classify intent (High/Medium/Low) and explain in 1–2 sentences.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const label = /\b(High|Medium|Low)\b/i.exec(text);
    const intent = label
      ? label[0][0].toUpperCase() + label[0].slice(1).toLowerCase()
      : "Medium";

    return { intent, reasoning: text };
  } catch (err) {
    console.warn(err.message);
  }
}
// Map intent to points
function mapAiPoints(intent) {
  if (intent === "High") return 50;
  if (intent === "Medium") return 30;
  return 10;
}

// POST /score
router.post("/", async (req, res) => {
  try {
    const leads = readLeads();
    const offer = readOffer();
    if (!offer)
      return res
        .status(400)
        .json({ error: "No offer uploaded. POST /offer first." });
    if (!leads || leads.length === 0)
      return res
        .status(400)
        .json({ error: "No leads uploaded. POST /leads/upload first." });

    const results = [];
    for (const lead of leads) {
      const rScore =
        roleScore(lead.role) +
        industryScore(lead.industry, offer.ideal_use_cases || []) +
        completenessScore(lead);
      const aiResp = await aiClassifyLead(lead, offer);
      const aiPoints = mapAiPoints(aiResp.intent);
      const finalScore = rScore + aiPoints;
      results.push({
        id: lead.id || uuidv4(),
        name: lead.name,
        role: lead.role,
        company: lead.company,
        industry: lead.industry,
        intent: aiResp.intent,
        score: finalScore,
        reasoning: `${aiResp.reasoning} (rule_score=${rScore}, ai_points=${aiPoints})`,
      });
    }

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    res.json({ ok: true, counted: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "scoring failed" });
  }
});

// GET /results
router.get("/results", (req, res) => {
  if (!fs.existsSync(RESULTS_FILE))
    return res
      .status(404)
      .json({ error: "no results found; run POST /score first" });
  const results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf8"));
  res.json(results);
});

// GET /export (CSV)
router.get("/export", (req, res) => {
  if (!fs.existsSync(RESULTS_FILE))
    return res
      .status(404)
      .json({ error: "no results found; run POST /score first" });
  const results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf8"));
  const header = "name,role,company,industry,intent,score,reasoning\n";
  const rows = results
    .map(
      (r) =>
        `${escapeCsv(r.name)},${escapeCsv(r.role)},${escapeCsv(
          r.company
        )},${escapeCsv(r.industry)},${r.intent},${r.score},${escapeCsv(
          r.reasoning
        )}`
    )
    .join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=results.csv");
  res.send(header + rows);
});

function escapeCsv(s) {
  if (s == null) return "";
  return '"' + String(s).replace(/"/g, '""') + '"';
}

module.exports = router;
