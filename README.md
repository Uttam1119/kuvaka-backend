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

## Explanation of Rule Logic & Prompts Used

### 1. Rule-Based Scoring Logic (Max 50 Points)

The rule engine in `utils/rules.js` determines how relevant a lead is based on three key factors.

| **Rule**               | **Description**                                                                                                                                                               | **Max Points** |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| **Role Score**         | Senior or decision-making roles (e.g., “CEO”, “Head”, “Director”, “VP”) receive **20 points**. Influencer roles (e.g., “Manager”, “Lead”, “Marketing”) receive **10 points**. | 20             |
| **Industry Score**     | If the lead’s industry matches any of the offer’s `ideal_use_cases`, assign **20 points**. If it’s a partial or adjacent match, assign **10 points**.                         | 20             |
| **Completeness Score** | If all key fields (name, role, company, industry, location, LinkedIn bio) are filled, assign **10 points**. Otherwise, 0.                                                     | 10             |

**Example Calculation:**

| Role                | Industry                    | Completeness | Rule Score            |
| ------------------- | --------------------------- | ------------ | --------------------- |
| "Head of Marketing" | "Retail" (matches use case) | Complete     | 20 + 20 + 10 = **50** |

---

### 2. AI Intent Classification Logic (Max 50 Points)

After computing rule scores, the system uses **Google Gemini (2.5 Flash)** to determine how interested the prospect seems in the offer.

#### **Prompt Used**

```text
Offer: {offer JSON}
Prospect: {lead JSON}
Classify intent (High/Medium/Low) and explain in 1–2 sentences.
```

#### **Example Prompt**

```text
Offer: {"name":"CRM Pro","ideal_use_cases":["sales","retail"]}
Prospect: {"name":"Alice","role":"Sales Director","industry":"Retail","linkedin_bio":"Leading sales teams across regions."}
Classify intent (High/Medium/Low) and explain in 1–2 sentences.
```

#### **Sample Gemini Output**

```
Intent: High
Reason: The prospect is a Sales Director in Retail, directly matching the offer’s target industry and role level.
```

#### **AI Intent → Points Mapping**

| Intent | Points |
| ------ | ------ |
| High   | 50     |
| Medium | 30     |
| Low    | 10     |

---

### 3. Final Scoring Formula

Each lead’s final score is calculated as:

```
final_score = rule_score + ai_points
```

Example:

```
rule_score = 40
ai_intent = "High" → ai_points = 50
final_score = 90
```

---

## Notes

- Ensure your **GEMINI_API_KEY** has access to the Generative Language API in Google Cloud.
- Restart your server after updating environment variables.
- All uploaded data is stored locally in `data/`. For production, replace this with a proper database.

---
