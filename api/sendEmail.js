import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { subject, results } = req.body;

    if (!subject || !results) {
      return res
        .status(400)
        .json({ success: false, error: "Missing email details or candidate data" });
    }

    // ✅ Standardized format for every candidate
    const candidateDetails = `
Name        : ${results.name || "N/A"}
Email       : ${results.email || "N/A"}
Phone       : ${results.phone || "N/A"}
Experience  : ${results.experience || "N/A"} years
Score       : ${results.Rank || results.score || "N/A"}
Context:
${results.justification || "No Context provided."}
`;

    const msg = {
      to: process.env.QNTRL_EMAIL,   // ✅ always taken from Vercel env
      from: process.env.FROM_EMAIL,   // ✅ also better to use env
      subject,
      text: candidateDetails,
    };

    console.log("Candidate Details:", candidateDetails);
    console.log("Sending to:", process.env.RECEIVER_EMAIL);

    await sgMail.send(msg);
    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Send email error:", JSON.stringify(error, null, 2));
    return res
      .status(500)
      .json({ success: false, error: error.message || "Failed to send email" });
  }
}
