export default async function handler(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "No userId" });

  try {
    const r = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    const data = await r.json();
    const imageUrl = data?.data?.[0]?.imageUrl;
    if (!imageUrl) return res.status(404).json({ error: "No image found" });
    res.status(200).json({ imageUrl });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch" });
  }
}
