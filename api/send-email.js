import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, phone, experience, score, description } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Missing candidate details" });
    }

    const msg = {
      to: "768363363_30725000001300117@startitnow.mail.qntrl.com", // QNTRL email
      from: "sumanth1mantri@gmail.com", // must be verified in SendGrid
      subject: ` ${name}`,
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

    await sgMail.send(msg);

    return res.status(200).json({ success: true, message: "Email sent to QNTRL" });
  } catch (error) {
    console.error("Send email error", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
