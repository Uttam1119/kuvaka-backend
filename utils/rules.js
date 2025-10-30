// Implements Rule Layer scoring (max 50)

function roleScore(role) {
  if (!role) return 0;
  const r = role.toLowerCase();
  const decision = [
    "head",
    "vp",
    "vice",
    "director",
    "chief",
    "ceo",
    "coo",
    "cto",
    "founder",
    "owner",
    "president",
  ];
  const influencer = [
    "manager",
    "lead",
    "senior",
    "principal",
    "growth",
    "marketing",
  ];
  if (decision.some((k) => r.includes(k))) return 20;
  if (influencer.some((k) => r.includes(k))) return 10;
  return 0;
}

function industryScore(industry, idealUseCases) {
  if (!industry || !idealUseCases || !Array.isArray(idealUseCases)) return 0;
  const ind = industry.toLowerCase();
  const ideals = idealUseCases.map((i) => i.toLowerCase());
  if (ideals.includes(ind)) return 20; // exact
  // adjacent: partial match
  if (ideals.some((i) => ind.includes(i) || i.includes(ind))) return 10;
  return 0;
}

function completenessScore(lead) {
  const keys = [
    "name",
    "role",
    "company",
    "industry",
    "location",
    "linkedin_bio",
  ];
  return keys.every((k) => lead[k] && String(lead[k]).trim().length > 0)
    ? 10
    : 0;
}

module.exports = { roleScore, industryScore, completenessScore };
