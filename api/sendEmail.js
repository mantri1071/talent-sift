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

    // ✅ Standardized format for every candidate
    const candidateDetails = results
      .map(
        (c, i) => `
Candidate ${i + 1}
----------------------
Name        : ${c.name || "N/A"}
Email       : ${c.email || "N/A"}
Phone       : ${c.phone || "N/A"}
Experience  : ${c.experience || "N/A"} years
Score       : ${c.Rank  || c.score || "N/A"}
Justification:
${c.justification || "No justification provided."}
`
      )
      .join("\n========================\n");

      console.log("Candidate Details:", candidateDetails); // Debugging log

    const msg = {
      to,
      from: "sumanth1mantri@gmail.com", // must be verified in SendGrid
      subject,
      text: candidateDetails, // ✅ always same structure
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
