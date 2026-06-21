import nodemailer from 'nodemailer'

interface SendEmailParams {
  to: string
  subject: string
  resetUrl: string
}

export async function sendPasswordResetEmail({ to, subject, resetUrl }: SendEmailParams) {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD
  const from = process.env.SMTP_FROM || 'no-reply@viyaanfuture.com'
  const secure = process.env.SMTP_SECURE === 'true'

  // 🔒 Fallback: If SMTP variables are missing, do not crash; log to console for development testing.
  if (!host || !user || !pass) {
    console.log(`\n==================================================`)
    console.log(`[EMAIL SIMULATION] SMTP config missing. Logging email:`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log(`==================================================\n`)
    return { success: true, simulated: true }
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })

  // Beautiful Dark Mode HTML Email Template
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - Viyaan Future</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #080808;
            color: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 500px;
            margin: 40px auto;
            padding: 32px;
            background-color: #0f0f12;
            border: 1px solid #26262a;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .logo {
            text-align: center;
            margin-bottom: 24px;
          }
          .logo img {
            width: 48px;
            height: 48px;
            border-radius: 10px;
          }
          h1 {
            font-size: 20px;
            font-weight: 300;
            letter-spacing: -0.01em;
            text-align: center;
            margin-bottom: 24px;
            color: #ffffff;
          }
          p {
            font-size: 13px;
            line-height: 20px;
            color: #a1a1aa;
            margin-bottom: 24px;
            text-align: center;
          }
          .btn-container {
            text-align: center;
            margin-bottom: 28px;
          }
          .btn {
            display: inline-block;
            padding: 12px 28px;
            font-size: 13px;
            font-weight: 600;
            color: #000000 !important;
            background-color: #ffffff;
            border-radius: 8px;
            text-decoration: none;
            transition: background-color 0.2s ease;
          }
          .btn:hover {
            background-color: #c9a87c;
          }
          .footer {
            font-size: 11px;
            color: #52525b;
            text-align: center;
            border-t: 1px solid #26262a;
            padding-top: 20px;
          }
          .footer a {
            color: #a1a1aa;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://viyaan-future.vercel.app/viyaan-logo.png" alt="Viyaan Logo">
          </div>
          <h1>Password Reset Request</h1>
          <p>
            You requested a link to reset your Viyaan Future password. Click the button below to establish a new password. This reset link is single-use and will expire in one hour.
          </p>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p style="font-size: 11px; color: #52525b;">
            If you did not request this, you can safely ignore this email. Your credentials remain secure.
          </p>
          <div class="footer">
            <p style="margin: 0; font-size: 10px;">Viyaan Future Intelligence System</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Reset Your Password\n\nClick the following link to reset your password. This link will expire in 1 hour:\n\n${resetUrl}`

  await transporter.sendMail({
    from: `"Viyaan Future" <${from}>`,
    to,
    subject,
    text,
    html,
  })

  return { success: true, simulated: false }
}
