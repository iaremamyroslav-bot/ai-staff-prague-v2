import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({
      version: "v3",
      auth,
    });

    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!calendarId) {
      return res.status(500).json({
        ok: false,
        error: "GOOGLE_CALENDAR_ID is missing",
      });
    }

    // Перевірка календаря
    if (req.method === "GET") {
      const result = await calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });

      return res.status(200).json({
        ok: true,
        events: result.data.items || [],
      });
    }

    // Створення запису
    if (req.method === "POST") {
      const { name, phone, start, end, service } = req.body || {};

      if (!start || !end) {
        return res.status(400).json({
          ok: false,
          error: "start and end are required",
        });
      }
    const event = {
      summary: `Запис: ${name || "Клієнт"}`,
      description:
        `Послуга: ${service || "Стрижка"}\n` +
        `Телефон: ${phone || "не вказано"}`,
      start: {
        dateTime: start,
        timeZone: "Europe/Prague",
      },
      end: {
        dateTime: end,
        timeZone: "Europe/Prague",
      },
    };

    const result = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    return res.status(200).json({
      ok: true,
      event: result.data,
    });
  }

  return res.status(405).json({
    ok: false,
    error: "Method not allowed",
  });
} catch (error) {
  console.error("Calendar error:", error);

  return res.status(500).json({
    ok: false,
    error: error.message,
  });
}
}
     