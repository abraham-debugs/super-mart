import nodemailer from "nodemailer";

export function createMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  // If SMTP_HOST is not provided but SMTP_USER and SMTP_PASS are provided, use Gmail
  if (!host && user && pass) {
    console.log("📧 Using Gmail SMTP (smtp.gmail.com)");
    console.log(`📧 Gmail user: ${user}`);
    console.log(`📧 Gmail pass: ${pass ? '***' + pass.slice(-4) : 'NOT SET'}`);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: user.trim(), // Your Gmail address
        pass: pass.trim()  // Your Gmail app password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.error("❌ Gmail SMTP verification failed:", error);
      } else {
        console.log("✅ Gmail SMTP server is ready to take our messages");
      }
    });
    
    return transporter;
  }
  
  // If SMTP_HOST is provided, use custom SMTP settings
  if (host && user && pass) {
    console.log(`📧 Using custom SMTP (${host}:${port})`);
    return nodemailer.createTransport({ 
      host, 
      port, 
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass } 
    });
  }
  
  // If credentials are missing
  console.warn("SMTP credentials are missing; email sending will be skipped.");
  console.warn("To use Gmail: Set SMTP_USER (your Gmail) and SMTP_PASS (app password)");
  console.warn("To use custom SMTP: Set SMTP_HOST, SMTP_USER, and SMTP_PASS");
  return null;
}



