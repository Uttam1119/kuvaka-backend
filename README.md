# Lead Scoring & AI Intent Classification

This project is a **lead scoring system** that combines deterministic rule-based scoring with **AI-powered intent classification** using **Google Gemini (Generative AI)**. It processes uploaded leads and offers, computes a final score for each lead, and allows exporting the results as CSV.

---

## Features

- Upload leads and offers via JSON files.
- Score leads based on:

  - **Role relevance**
  - **Industry alignment**
  - **Profile completeness**

- AI-based intent classification:

  - High, Medium, Low intent
  - Provides reasoning for classification

- Fallback deterministic keyword-based scoring if AI fails
- Export results as CSV
- Persistent storage using local JSON files (`data/` directory)

---

## Tech Stack

- **Backend:** Node.js, Express
- **AI:** Google Gemini (via `@google/generative-ai`)
- **Storage:** Local JSON files
- **Unique IDs:** `uuid`
- **Utilities:** Custom scoring rules in `utils/rules.js`

---

## Project Structure

```
project-root/
│
├─ data/
├─ routes/
│   └─ leads.js
│   └─ offer.js
│   └─ score.js
├─ utils/
│   └─ rules.js
├─ package.json
└─ server.js
```

---

## Environment Variables

Create a `.env` file at the root:

```env
PORT=3000
DATA_DIR=./data
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

- `GEMINI_API_KEY` — your Google Generative AI API key.
- `DATA_DIR` — directory for storing uploaded leads, offers, and results.

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Uttam1119/kuvaka-backend
cd kuvaka-backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm run dev
```

The server runs on `http://localhost:3000` by default.

---

## API Endpoints

### 1. Upload Leads

**POST** `/leads/upload`

Body → form-data

Key: file,
Type: File ->
Choose your local leads.csv file.

---

### 2. Upload Offer

**POST** `/offer`
Upload the JSON for the offer you want leads scored against.  
Headers:
Content-Type: application/json

Body (→ raw → JSON):

```json
{
  "name": "AI Outreach Automation",
  "value_props": ["24/7 outreach", "6x more meetings"],
  "ideal_use_cases": ["B2B SaaS mid-market", "Analytics", "HR Tech"]
}
```

---

### 3. Score Leads

**POST** `/score`
Processes all uploaded leads and the offer, applies AI intent classification, and computes final scores.

**Response:**

```json
{
  "ok": true,
  "counted": 10
}
```

---

### 4. Get Results

**GET** `/score/results`
Returns scored leads with AI intent and reasoning.

---

### 5. Export Results as CSV

**GET** `/score/export`
Downloads a CSV with all lead scores, intent, and reasoning.

---

## AI Scoring

- Uses **Google Gemini** (`gemini-2.5-flash`) to classify lead intent.
- Intent points:

  - High → 50 points
  - Medium → 30 points
  - Low → 10 points

- Total lead score = `rule_score + AI_points`

---

## Notes

- Ensure your **GEMINI_API_KEY** has access to the Generative Language API in Google Cloud.
- Restart your server after updating environment variables.
- All uploaded data is stored locally in `data/`. For production, replace this with a proper database.

---
