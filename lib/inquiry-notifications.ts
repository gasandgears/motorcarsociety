// Barnaby's established Motorcar Society business contact, published on /contact.
export const inquiryRecipient = "bbforcars@gmail.com";
export async function notifyCarInquiry(inquiry: { id: string; carId: string; carTitle: string; name: string; email: string; phone: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_EMAIL_FROM;
  if (!apiKey || !from) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(12000),
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `car-inquiry-${inquiry.id}` },
      body: JSON.stringify({ from, to: [inquiryRecipient], reply_to: inquiry.email, subject: `Vehicle inquiry: ${inquiry.carTitle.replace(/[\r\n]/g, " ").slice(0, 120)}`, text: `A visitor would like to learn more about ${inquiry.carTitle}.\n\nName: ${inquiry.name}\nPhone: ${inquiry.phone}\nEmail: ${inquiry.email}\n\nCar reference: ${inquiry.carId}\nInquiry reference: ${inquiry.id}\n\nThe visitor consented to contact about this car only. This is not newsletter consent.` }),
    });
    return response.ok;
  } catch { return false; }
}
