import { setApiKey, send } from "@sendgrid/mail";

setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { name, email, phone, experience, score, description } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: "Missing candidate details" });
    }

    const msg = {
      to: "768363363_30725000001415201@startitnow.mail.qntrl.com", // QNTRL email
      from: "sumanth1mantri@gmail.com", // verified SendGrid email
      subject: `Shortlisted Candidate: ${name}`,
      text: `
Candidate has been shortlisted.

Name: ${name}
Email: ${email}
Phone: ${phone}
Experience: ${experience} years
Score: ${score}

Description:
${description}
      `,
      html: `
        <h2>Shortlisted Candidate</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Experience:</b> ${experience} years</p>
        <p><b>Score:</b> ${score}</p>
        <h3>Description:</h3>
        <p>${description}</p>
      `,
    };

    await send(msg);

    return res.status(200).json({ success: true, message: "Email sent to QNTRL" });
  } catch (error) {
    console.error("Send email error:", error);
    return res.status(500).json({ success: false, error: "Failed to send email" });
  }
}
