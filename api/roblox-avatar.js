export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=300"); // cache 5 min

  const userId = req.query.userId || req.query.username || "";
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    let numericId = userId;

    // If it's not a number, it's a username — resolve to numeric ID
    if (!/^\d+$/.test(String(userId).trim())) {
      const nameRes = await fetch(
        `https://users.roblox.com/v1/usernames/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernames: [userId], excludeBannedUsers: false }),
        }
      );
      if (!nameRes.ok) return res.status(404).json({ error: "User not found" });
      const nameData = await nameRes.json();
      numericId = nameData?.data?.[0]?.id;
      if (!numericId) return res.status(404).json({ error: "Username not found" });
    }

    // Get avatar thumbnail
    const avatarRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${numericId}&size=150x150&format=Png&isCircular=false`
    );
    if (!avatarRes.ok) return res.status(404).json({ error: "Avatar not found" });
    const avatarData = await avatarRes.json();
    const imageUrl = avatarData?.data?.[0]?.imageUrl;

    if (!imageUrl) return res.status(404).json({ error: "No image URL" });

    // Proxy the actual image so CORS is never an issue
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return res.status(404).json({ error: "Image fetch failed" });

    const buffer = await imgRes.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    return res.send(Buffer.from(buffer));

  } catch (e) {
    console.error("Roblox avatar error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}
