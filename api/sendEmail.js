import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { to, subject, text, results } = req.body;

    if (!to || !subject || (!text && (!results || !results.length))) {
      return res.status(400).json({ success: false, error: "Missing email details or candidate data" });
    }

    // ✅ Always define emailBody safely
    let emailBody = "";

    if (results && results.length) {
      emailBody = results
        .map(
          (c, i) =>
            `Candidate ${i + 1}:
Name: ${c.name}
Email: ${c.email}
Phone: ${c.phone}
Experience: ${c.experience} years
Score: ${c.score}
Justification: ${c.justification}`
        )
        .join("\n-------------------\n");
    } else if (text) {
      emailBody = text;
    }

    const msg = {
      to,
      from: "sumanth1mantri@gmail.com", // must be a verified sender in SendGrid
      subject,
      text: emailBody,
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