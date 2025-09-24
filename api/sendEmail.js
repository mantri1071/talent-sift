import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { to, subject, results } = req.body;

    if (!to || !subject || !results) {
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
Score       : ${results.Rank  || results.score || "N/A"}
Context:
${results.justification || "No Context provided."}
`
// let arpita = `Candidate Details: 
// Name        : Arpita
// Email       : arpita@gmail.com
// Phone       : +91 987654321
// Experience  : 30 years
// Score       : 4
// Justification:
// `
    const msg = {
      to,
      from: "sumanth1mantri@gmail.com", // must be verified in SendGrid
      subject,
      text: candidateDetails, // ✅ always same structure
    };
    // const msg2 = {
    //   to,
    //   from: "sumanth1mantri@gmail.com", // must be verified in SendGrid
    //   subject,
    //   text: arpita, // ✅ always same structure
    // };
    //  await sgMail.send(msg2);

    console.log("Candidate Details:", candidateDetails); // Debugging log
    await sgMail.send(msg);
    return res.status(200).json({ success: true, message: "Email sent to Qntrl" });
  } catch (error) {
    console.error("Send email error:", JSON.stringify(error, null, 2));
    return res
      .status(500)
      .json({ success: false, error: error.message || "Failed to send email" });
  }
}
