export function validateCarInquiry(body: Record<string, unknown>, now = Date.now()) {
  const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/[\r\n\x00-\x1f]/g, " ").slice(0, max) : "";
  const name = text(body.name, 120), email = text(body.email, 180).toLowerCase(), phone = text(body.phone, 50), carId = text(body.carId, 80);
  if (text(body.website, 200)) return { spam: true as const };
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(carId)) return { error: "Choose a vehicle from Coming Soon." };
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, "").length < 7 || phone.replace(/\D/g, "").length > 18) return { error: "Enter your name, a valid phone number and email address." };
  if (body.consent !== true) return { error: "Please confirm we may contact you about this car." };
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || now - startedAt < 2000 || now - startedAt > 7200000) return { error: "Please reopen the form and try again." };
  return { value: { name, email, phone, carId } };
}
