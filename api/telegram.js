export default async function handler(req, res) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return res.status(500).json({
      ok: false,
      error: "TELEGRAM_BOT_TOKEN is missing"
    });
  }

  // Відкриття /api/telegram у браузері автоматично
  // підключає Telegram webhook.
  if (req.method === "GET") {
    try {
      const webhookUrl = `https://${req.headers.host}/api/telegram`;

      const response = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: webhookUrl })
        }
      );

      const result = await response.json();

      return res.status(200).json({
        webhook: webhookUrl,
        telegram: result
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const message = req.body?.message;
  const chatId = message?.chat?.id;
  const text = message?.text?.trim();

  if (!chatId || !text) {
    return res.status(200).json({ ok: true });
  }

  try {
    // Передаємо повідомлення існуючому AI-асистенту.
    const aiResponse = await fetch(
      `https://${req.headers.host}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: text
            }
          ]
        })
      }
    );

    const aiData = await aiResponse.json();

    const reply =
      aiData.reply ||
      "Вибачте, зараз не можу відповісти. Спробуйте ще раз.";

    await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply
        })
      }
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Telegram error:", error);

    // Повертаємо 200, щоб Telegram не надсилав
    // одне й те саме повідомлення повторно.
    return res.status(200).json({ ok: true });
  }
}
