
'use server';

import Mailjet from 'node-mailjet';

interface EmailResponse {
  success: boolean;
  message: string;
}

export async function sendConfirmationEmail(recipientEmail: string): Promise<EmailResponse> {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL;

  if (!apiKey || !apiSecret) {
    console.error('Mailjet API Key or Secret is not configured in environment variables.');
    return { success: false, message: 'Email service (API keys) is not configured.' };
  }

  if (!senderEmail) {
    console.error('Mailjet Sender Email is not configured in environment variables.');
    return { success: false, message: 'Email sender address is not configured.' };
  }

  const mailjet = new Mailjet({ apiKey, apiSecret });

  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: senderEmail,
          Name: 'Sprout Marketplace', // Matches the footer company name
        },
        To: [
          {
            Email: recipientEmail,
            Name: '', // Name is optional for the recipient
          },
        ],
        Subject: 'Thank You for Signing Up!',
        TextPart: `Hi there,\n\nThank you for signing up for updates from Sprout Marketplace! We're excited to have you on board.\n\nBest,\nThe Sprout Team`,
        HTMLPart: `<h3>Hi there,</h3>
                   <p>Thank you for signing up for updates from Sprout Marketplace! We're excited to have you on board.</p>
                   <p>Best,<br>The Sprout Team</p>`,
      },
    ],
  });

  try {
    const result = await request;
    // Log the full response for debugging, but be careful with sensitive data in production logs
    // console.log('Mailjet send result:', JSON.stringify(result.body, null, 2));
    
    if (result.body.Messages && result.body.Messages.length > 0 && result.body.Messages[0].Status === 'success') {
      return { success: true, message: 'Confirmation email sent successfully.' };
    } else {
      console.error('Mailjet API Error. Response status:', result.response.status, 'Response data:', JSON.stringify(result.body, null, 2));
      return { success: false, message: 'Failed to send confirmation email via Mailjet.' };
    }
  } catch (error: any) {
    console.error('Error sending confirmation email via Mailjet:', error.message);
    if (error.response) {
      console.error('Mailjet Error Response Status:', error.response.status);
      console.error('Mailjet Error Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, message: 'Failed to send confirmation email due to a system error.' };
  }
}
