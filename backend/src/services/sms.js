import { getTwilioClient } from "../config/twilio.js";

function normalizePhone(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  // Remove spaces and dashes
  s = s.replace(/[\s-]/g, "");
  // If already E.164 (+country...), keep
  if (s.startsWith("+")) return s;
  // If starts with 91 and is 12 digits, add +
  if (/^91\d{10}$/.test(s)) return "+" + s;
  // If 10 digits (assume India), prefix +91
  if (/^\d{10}$/.test(s)) return "+91" + s;
  // If starts with 0 followed by 10 digits, replace leading 0 with +91
  if (/^0\d{10}$/.test(s)) return "+91" + s.slice(1);
  // Fallback: if 12-15 digits, prefix +
  if (/^\d{12,15}$/.test(s)) return "+" + s;
  return s; 
}

export async function sendSms(to, body) {
  const twilio = getTwilioClient();
  if (!twilio) return { sent: false, reason: "twilio_disabled" };
  try {
    const normalized = normalizePhone(to);
    const res = await twilio.client.messages.create({ from: twilio.fromNumber, to: normalized, body });
    return { sent: true, sid: res.sid };
  } catch (err) {
    console.warn("SMS send failed:", err?.message || err);
    return { sent: false, reason: err?.message || String(err) };
  }
}

export function buildOrderPlacedMessage({ customerName, orderId, etaMins }) {
  const etaText = etaMins ? ` ETA ${etaMins} mins.` : "";
  return `Hi ${customerName || "there"}, your order ${orderId} was placed successfully.${etaText}`;
}

export function buildOrderDeliveredMessage({ customerName, orderId }) {
  return `Hi ${customerName || "there"}, your order ${orderId} has been delivered. Enjoy!`;
}



