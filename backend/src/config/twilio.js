import Twilio from "twilio";

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM;
  if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio env vars missing; SMS sending disabled.");
    return null;
  }
  const client = Twilio(accountSid, authToken);
  return { client, fromNumber };
}





