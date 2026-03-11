const HB_KEY = "sk_test_vUEKzTF26D0FfDCFTJZpUXGrQlpzs8P7ET95_q9CRyI";

const SPORT_PATHS = {
  mlb: "baseball/mlb",
  nfl: "football/nfl",
  nba: "basketball/nba",
  nhl: "hockey/nhl",
};

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      // ── ESPN athlete name lookup ──
      if (req.query.athlete) {
        const r = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/athletes/${req.query.athlete}`
        );
        const d = await r.json();
        return res.status(200).json({ name: d.athlete?.displayName || d.athlete?.shortName || null });
      }

      // ── Player autocomplete via ESPN athletes endpoint ──
      if (req.query.search && req.query.sport) {
        const q = req.query.search.trim();
        const sportPath = SPORT_PATHS[req.query.sport] || "baseball/mlb";

        // ESPN athletes endpoint supports searchTerm param
        const url = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/athletes?limit=10&active=false&searchTerm=${encodeURIComponent(q)}`;
        const r = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible)" }
        });

        if (!r.ok) {
          return res.status(200).json({ athletes: [] });
        }

        const d = await r.json();
        const items = d.items || d.athletes || [];

        const athletes = items.slice(0, 8).map(a => ({
          id: a.id || "",
          name: a.displayName || a.fullName || a.shortName || "",
          team: a.team?.displayName || a.teamName || "",
          position: a.position?.displayName || a.position?.name || a.position || "",
        })).filter(a => a.name.length > 1);

        return res.status(200).json({ athletes });
      }

      return res.status(400).json({ error: "Missing params" });
    }

    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { action, sessionId } = req.body;

    if (action === "create") {
      const r = await fetch("https://engine.hyperbeam.com/v0/vm", {
        method: "POST",
        headers: { Authorization: `Bearer ${HB_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ start_url: "https://www.google.com", ublock_origin: true }),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.status(200).json(data);
    }

    if (action === "delete" && sessionId) {
      await fetch(`https://engine.hyperbeam.com/v0/vm/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${HB_KEY}` },
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};