import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, otp }: { to: string; subject: string; otp: string }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.COMPANY_MAIL,
      pass: process.env.MAIL_PASSWORD,
    },
  });


  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <div style="text-align: center;">
        <h1 style="color: #4e54c8;font-size: 20px">Welcome to SKILL-SYNC</h1>
        <p style="font-size: 16px;">Hello 👋</p>
        <p style="font-size: 18px; margin: 10px 0;">Your OTP code is:</p>
        <h1 style="background: #4e54c8; color: #fff; padding: 10px 20px; border-radius: 10px; display: inline-block;">
          ${otp}
        </h1>
        <p style="margin-top: 20px;">Please do not share this code with anyone. It will expire in 5 minutes.</p>
        <br/>
        <p style="font-size: 14px; color: #999;">– SKILL-SYNC Team</p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.COMPANY_MAIL,
      to,
      subject,
      html: htmlContent,
    });
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}