const express = require("express");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const offerRouter = require("./routes/offer");
const leadsRouter = require("./routes/leads");
const scoreRouter = require("./routes/score");

dotenv.config();

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const app = express();
app.use(express.json());

// Routes
app.use("/offer", offerRouter);
app.use("/leads", leadsRouter);
app.use("/score", scoreRouter);

app.get("/", (req, res) =>
  res.send({ status: "ok", msg: "Backend Hiring Assignment API" })
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
