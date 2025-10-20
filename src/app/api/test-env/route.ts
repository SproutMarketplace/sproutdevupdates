import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if environment variables are loading
    const envCheck = {
      mailjetApiKey: process.env.MAILJET_API_KEY ? 'Set' : 'Not Set',
      mailjetSecret: process.env.MAILJET_API_SECRET ? 'Set' : 'Not Set',
      mailjetEmail: process.env.MAILJET_SENDER_EMAIL ? 'Set' : 'Not Set',
      mailjetTemplateId: process.env.MAILJET_TEMPLATE_ID ? 'Set' : 'Not Set',
      mailjetStandardTemplateId: process.env.MAILJET_STANDARD_TEMPLATE_ID ? 'Set' : 'Not Set',
      testEnvVar: process.env.TEST_ENV_VAR ? 'Set' : 'Not Set',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    console.log('[test-env] Environment check:', envCheck);

    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      data: envCheck
    });
  } catch (error: any) {
    console.error('[test-env] Error checking environment:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking environment variables',
      error: error.message
    }, { status: 500 });
  }
}
