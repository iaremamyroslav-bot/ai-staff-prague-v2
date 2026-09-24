export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
      message: "AI Staff Prague API працює"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        ok: false,
        error: "Message is missing"
      });
    }

    return res.status(200).json({
      ok: true,
      reply: `Ви написали: ${message}`
    });

  } catch (error) {
    console.error("Chat error:", error);

    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
