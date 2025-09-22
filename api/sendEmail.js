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

let emailBody = text;

if (results && results.length) {
  emailBody = results
    .map(
      (c, i) =>
        `Candidate ${i + 1}:\n` +
        `Name: ${c.name}\n` +
        `Email: ${c.email}\n` +
        `Phone: ${c.phone}\n` +
        `Experience: ${c.experience}\n` +
        `Score: ${c.score}\n` +
        `Justification: ${c.justification}\n`
    )
    .join("\n-------------------\n");
}

const msg = {
  to,
  from: "sumanth1mantri@gmail.com",
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
