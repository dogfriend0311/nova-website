const HB_KEY = "sk_test_vUEKzTF26D0FfDCFTJZpUXGrQlpzs8P7ET95_q9CRyI";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // ── ESPN athlete name lookup (GET /api/hyperbeam?athlete=12345) ──
    if (req.method === "GET") {
      const { athlete } = req.query;
      if (!athlete) return res.status(400).json({ error: "Missing athlete id" });
      const r = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/athletes/${athlete}`
      );
      const d = await r.json();
      const name = d.athlete?.displayName || d.athlete?.shortName || null;
      return res.status(200).json({ name });
    }

    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { action, sessionId } = req.body;

    // ── Hyperbeam session create ──
    if (action === "create") {
      const r = await fetch("https://engine.hyperbeam.com/v0/vm", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HB_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ start_url: "https://www.google.com", ublock_origin: true }),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.status(200).json(data);
    }

    // ── Hyperbeam session delete ──
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
}