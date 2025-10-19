import nodemailer from "nodemailer";

export function createMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.warn("SMTP credentials are missing; email sending will be skipped.");
    return null;
  }
  return nodemailer.createTransport({ host, port, auth: { user, pass } });
}





