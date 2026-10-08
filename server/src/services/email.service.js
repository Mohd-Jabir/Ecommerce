import { mailTransporter } from "../config/mail.js";

export async function sendVerificationEmail({
  email,
  name,
  verificationToken,
}) {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${encodeURIComponent(
    verificationToken,
  )}`;

  await mailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your Ecommerce account",

    text: `
Hello ${name},

Thank you for registering with our Ecommerce platform.

Please verify your email address using the link below:

${verificationUrl}

This link will expire in 15 minutes.

If you did not create this account, you can safely ignore this email.

Regards,
Ecommerce Team
`,

    html: `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Verify your email</h2>

    <p>Hello ${name},</p>

    <p>
      Thank you for registering with our Ecommerce platform.
    </p>

    <p>
      Please click the button below to verify your email address.
    </p>

    <a
      href="${verificationUrl}"
      style="
        display: inline-block;
        padding: 12px 20px;
        background: #111827;
        color: white;
        text-decoration: none;
        border-radius: 6px;
      "
    >
      Verify Email
    </a>

    <p>
      This verification link will expire in <strong>15 minutes</strong>.
    </p>

    <p>
      If you did not create this account, you can safely ignore this email.
    </p>

    <p>
      Regards,<br />
      Ecommerce Team
    </p>
  </body>
</html>
`,
  });
}
export async function sendPasswordResetEmail({ email, name, resetToken }) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(
    resetToken,
  )}`;

  await mailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your Ecommerce password",

    text: `
Hello ${name},

We received a request to reset your password.

Use the link below to create a new password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
Ecommerce Team
`,

    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">

<h2>Password Reset</h2>

<p>Hello ${name},</p>

<p>
We received a request to reset your Ecommerce account password.
</p>

<p>
Click the button below to create a new password.
</p>

<a
  href="${resetUrl}"
  style="
    display: inline-block;
    padding: 12px 20px;
    background: #111827;
    color: white;
    text-decoration: none;
    border-radius: 6px;
  "
>
  Reset Password
</a>

<p>
This link will expire in <strong>15 minutes</strong>.
</p>

<p>
If you did not request a password reset, you can safely ignore this email.
</p>

<p>
Regards,<br/>
Ecommerce Team
</p>

</body>
</html>
`,
  });
}
