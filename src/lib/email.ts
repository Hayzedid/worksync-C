// Email service utility for sending newsletter welcome emails
// In a real application, you would integrate with services like:
// - SendGrid
// - Mailgun
// - AWS SES
// - Nodemailer with SMTP

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Mock email service - replace with real email service
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // In development, just log the email
    console.log('📧 Email would be sent:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.text || options.html);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, replace this with actual email service:
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: options.to }] }],
    //     from: { email: 'noreply@worksync.ng' },
    //     subject: options.subject,
    //     content: [
    //       { type: 'text/html', value: options.html },
    //       { type: 'text/plain', value: options.text || options.html }
    //     ]
    //   })
    // });
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

// Generate welcome email content
export const generateWelcomeEmail = (email: string) => {
  const subject = 'Welcome to WorkSync Newsletter! 🎉';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to WorkSync</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0FC2C0, #015958); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #0FC2C0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to WorkSync! 🚀</h1>
          <p>You're now part of our productivity community</p>
        </div>
        <div class="content">
          <h2>Thank you for subscribing!</h2>
          <p>Hi there!</p>
          <p>We're thrilled to have you join the WorkSync community. You'll now receive:</p>
          <ul>
            <li>📈 Updates on new features and improvements</li>
            <li>💡 Productivity tips and best practices</li>
            <li>🎯 Exclusive access to upcoming live demos</li>
            <li>🔔 Early notifications about product launches</li>
          </ul>
          <p>As a Nigeria-based team, we're committed to building tools that help African professionals and teams achieve more together.</p>
          <a href="https://worksync.ng" class="button">Explore WorkSync</a>
          <p>If you have any questions or feedback, don't hesitate to reach out to us at <a href="mailto:support@worksync.ng">support@worksync.ng</a></p>
          <p>Best regards,<br>The WorkSync Team</p>
        </div>
        <div class="footer">
          <p>WorkSync - All-in-One Productivity Platform</p>
          <p>Lagos, Nigeria | <a href="mailto:support@worksync.ng">support@worksync.ng</a></p>
          <p><a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Welcome to WorkSync! 🚀
    
    Thank you for subscribing to our newsletter!
    
    You'll now receive:
    - Updates on new features and improvements
    - Productivity tips and best practices
    - Exclusive access to upcoming live demos
    - Early notifications about product launches
    
    As a Nigeria-based team, we're committed to building tools that help African professionals and teams achieve more together.
    
    Explore WorkSync: https://worksync.ng
    
    If you have any questions or feedback, don't hesitate to reach out to us at support@worksync.ng
    
    Best regards,
    The WorkSync Team
    
    ---
    WorkSync - All-in-One Productivity Platform
    Lagos, Nigeria | support@worksync.ng
  `;
  
  return { subject, html, text };
};

// Send welcome email to new subscriber
export const sendWelcomeEmail = async (email: string): Promise<boolean> => {
  const emailContent = generateWelcomeEmail(email);
  
  return await sendEmail({
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });
};
