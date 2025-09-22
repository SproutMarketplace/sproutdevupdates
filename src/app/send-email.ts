
'use server';

import mailjet from 'node-mailjet';

interface EmailParams {
    to: string;
    name: string;
    templateId: number;
}

export async function sendConfirmationEmail({ to, name, templateId }: EmailParams): Promise<{ success: boolean; message: string }> {
    console.log(`[send-email.ts] Attempting to send confirmation email to: ${to} using Mailjet template ID: ${templateId}.`);

    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_API_SECRET || !process.env.MAILJET_SENDER_EMAIL) {
        const errorMessage = '[send-email.ts] CRITICAL: Mailjet environment variables are not set. Cannot send email. Please check your .env.local file.';
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }

    if (templateId === 0) {
        const errorMessage = '[send-email.ts] CRITICAL: A valid Mailjet Template ID was not provided. Cannot send email.';
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }

    const mj = mailjet.apiConnect(
        process.env.MAILJET_API_KEY,
        process.env.MAILJET_API_SECRET,
    );

    const request = mj.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: process.env.MAILJET_SENDER_EMAIL,
                    Name: 'Sprout Marketplace',
                },
                To: [
                    {
                        Email: to,
                        Name: name,
                    },
                ],
                TemplateID: templateId,
                TemplateLanguage: true,
                Subject: 'Your Spot is Secured at Sprout!', // You can still override the subject here if you want
                Variables: {
                    name: name,
                },
            },
        ],
    });

    try {
        const result = await request;
        console.log('[send-email.ts] Mailjet API Response:', JSON.stringify(result.body, null, 2));
        return { success: true, message: 'Confirmation email sent successfully.' };
    } catch (error: any) {
        console.error('[send-email.ts] Mailjet API Error:', error.statusCode, error.response?.data);
        return { success: false, message: 'Failed to send confirmation email.' };
    }
}
