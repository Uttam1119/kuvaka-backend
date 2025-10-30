const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
