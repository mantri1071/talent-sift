import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { to, subject, results } = req.body;

    if (!to || !subject || !results || !results.length) {
      return res
        .status(400)
        .json({ success: false, error: "Missing email details or candidate data" });
    }

    const msg = {
      to: "768363363_30725000001270225@startitnow.mail.qntrl.com", // ✅ recipient email
      from: "sumanth1mantri@gmail.com", // ✅ must be verified in SendGrid
      subject: subject, // ✅ use the subject from request body
      text: JSON.stringify(req.body, null, 2),  // ✅ send full request body as text
    };

    await sgMail.send(msg);
    return res.status(200).json({ success: true, message: "Email sent to Qntrl" });
  } catch (error) {
    console.error("Send email error:", JSON.stringify(error, null, 2));
    return res
      .status(500)
      .json({ success: false, error: error.message || "Failed to send email" });
  }
}
