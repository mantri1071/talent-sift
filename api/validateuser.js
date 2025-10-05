export default function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed. Use POST." });
  }

  const { email } = req.body || {};
  const sanitizedEmail = email?.trim().toLowerCase();

  if (!sanitizedEmail) {
    return res.status(400).json({ status: "error", message: "Email is required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    return res.status(400).json({ status: "error", message: "Invalid email format" });
  }

  const domain = sanitizedEmail.split("@")[1];
  const allowedDomains = ["startitnow.co.in", "zoho.com"];

  if (allowedDomains.includes(domain)) {
    return res.status(200).json({ status: "success", message: "User validated" });
  } else {
    console.warn(`Unauthorized email attempt: ${email}`);
    return res
      .status(403)
      .json({ status: "error", message: "Unauthorized company domain" });
  }
}
