import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface EmailParams {
    to: string;
}

export async function sendConfirmationEmail({ to }: EmailParams) {
    const fromEmail = process.env.SENDGRID_SENDER_EMAIL;

    if (!process.env.SENDGRID_API_KEY || !fromEmail) {
        console.warn("SendGrid API Key or Sender Email not found in .env.local. Skipping email sending.");
        return;
    }

    const msg = {
        to: to,
        from: {
            email: fromEmail,
            name: 'Sprout Marketplace',
        },
        subject: 'Thank You for Signing Up!',
        text: `Hi there,\n\nThank you for signing up for updates from Sprout Marketplace! We're excited to have you on board.\n\nBest,\nThe Sprout Team`,
        html: `<h3>Hi there,</h3><p>Thank you for signing up for updates from Sprout Marketplace! We're excited to have you on board.</p><p>Best,<br>The Sprout Team</p>`,
    };

    try {
        console.log(`Attempting to send email to ${to} from ${fromEmail} via SendGrid...`);
        await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid.');
    } catch (error: any) {
        console.error('Failed to send confirmation email via SendGrid.');

        if (error.response) {
            console.error('SendGrid Error Response:', JSON.stringify(error.response.body, null, 2));
        } else {
            console.error('SendGrid Error:', error.message);
        }
    }
}
