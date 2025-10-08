
import {NextRequest, NextResponse} from 'next/server';
import mailjet from 'node-mailjet';

export async function POST(req: NextRequest) {
    const {to, name, templateId} = await req.json();

    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_API_SECRET || !process.env.MAILJET_SENDER_EMAIL) {
        console.error('[api/send-email] CRITICAL: Mailjet environment variables are not set.');
        return NextResponse.json({success: false, message: 'Server configuration error.'}, {status: 500});
    }

    if (!to || !name || !templateId) {
        return NextResponse.json({ success: false, message: 'Missing required parameters: to, name, templateId' }, { status: 400 });
    }

    if (templateId === 0) {
        console.error('[api/send-email] CRITICAL: A valid Mailjet Template ID was not provided.');
        return NextResponse.json({success: false, message: 'Server configuration error: Invalid template ID.'}, {status: 500});
    }

    const mj = mailjet.apiConnect(
        process.env.MAILJET_API_KEY,
        process.env.MAILJET_API_SECRET
    );

    const request = mj.post('send', {version: 'v3.1'}).request({
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
                Subject: 'Your Spot is Secured at Sprout!',
                Variables: {
                    name: name,
                },
            },
        ],
    });

    try {
        await request;
        console.log(`[api/send-email] Successfully sent confirmation email to ${to}.`);
        return NextResponse.json({success: true, message: 'Confirmation email sent successfully.'});
    } catch (error: any) {
        console.error('[api/send-email] Mailjet API Error:', error.statusCode, error.response?.data);
        return NextResponse.json({success: false, message: 'Failed to send confirmation email.'}, {status: 500});
    }
}
