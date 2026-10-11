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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "OPENAI_API_KEY is missing"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Ти AI-асистент The Cabinet Barbershop у Празі. Чоловіча стрижка коштує 800 Kč і триває 60 хвилин. Графік роботи: щодня з 11:00 до 20:00. Адреса: Zborovská 21, Praha 5-Smíchov. Відповідай коротко й ввічливо мовою клієнта — чеською, англійською або українською. Використовуй лише підтверджені дані. Не вигадуй ціни, послуги чи вільний час. Не підтверджуй запис: календар поки не підключений до чату."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({
        ok: false,
        error: "OpenAI API error"
      });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      "Вибачте, зараз не можу відповісти.";

    return res.status(200).json({
      ok: true,
      reply
    });

  } catch (error) {
    console.error("Chat error:", error);

    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
