const nodemailer = require("nodemailer");

/**
 * Send OTP verification email
 * @param {string} toEmail - recipient email
 * @param {string | number} code - verification code
 */
async function sendOTPDConfirmEmail(toEmail, code, title, subtitle) {
  try {
    // 1️⃣ إعداد transporter باستخدام IPv4 و port 587
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password لو Gmail فيه 2FA
      },
      tls: {
        rejectUnauthorized: false,
      },
      family: 4, // ⬅️ يجبر استخدام IPv4
    });

    // 2️⃣ إعداد خيارات البريد
    const mailOptions = {
      from: `"Rzo Operations System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `DashBoard System - ${title}`,
      text: `Your code is: ${code}. It will expire in 2 minutes. Do not share it with anyone.`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f6f8; color: #333; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 30px auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; }
          h2 { color: #28a745; margin-bottom: 20px; }
          .code { font-size: 32px; font-weight: bold; color: #28a745; padding: 15px 20px; background: #eafaf1; border-radius: 6px; border: 1px solid #c1e7c9; display: inline-block; margin-bottom: 20px; }
          p { font-size: 14px; color: #555; line-height: 1.6; }
          .footer { font-size: 12px; color: #999; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${title}</h2>
          <p>${subtitle}</p>
          <div class="code">${code}</div>
          <p>This code will expire in 2 minutes. Do not share it with anyone.</p>
          <div class="footer">
            © ${new Date().getFullYear()} Rzo Operations System. All rights reserved.<br>
            This is an automated message. Please do not reply.
          </div>
        </div>
      </body>
      </html>
      `,
    };

    // 3️⃣ إرسال البريد
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);

  } catch (err) {
    console.error("Error sending email:", err);
  }
}

module.exports = sendOTPDConfirmEmail;
