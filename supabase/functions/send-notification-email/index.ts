import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  type: 'contact_form' | 'new_registration' | 'new_enrollment' | 'new_certificate';
  data: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    courseTitle?: string;
    certificateId?: string;
    [key: string]: any;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const ADMIN_EMAIL = 'ronchimbo@gmail.com';
    const FROM_EMAIL = 'noreply@wasteinstitute.org';

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      throw new Error('RESEND_API_KEY not configured');
    }

    const { type, data }: EmailRequest = await req.json();

    let emailSubject = '';
    let emailHtml = '';

    switch (type) {
      case 'contact_form':
        emailSubject = `WasteInstitute - New Contact Form Submission: ${data.subject || 'No Subject'}`;
        emailHtml = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message?.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
        `;
        break;

      case 'new_registration':
        emailSubject = `WasteInstitute - New User Registration: ${data.name}`;
        emailHtml = `
          <h2>New User Registration</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p>A new user has registered on the WasteInstitute platform.</p>
        `;
        break;

      case 'new_enrollment':
        emailSubject = `WasteInstitute - New Course Enrollment: ${data.courseTitle}`;
        emailHtml = `
          <h2>New Course Enrollment</h2>
          <p><strong>Student:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Course:</strong> ${data.courseTitle}</p>
          <p><strong>Enrollment Date:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p>A new enrollment has been created on the WasteInstitute platform.</p>
        `;
        break;

      case 'new_certificate':
        emailSubject = `WasteInstitute - New Certificate Issued: ${data.certificateId}`;
        emailHtml = `
          <h2>New Certificate Issued</h2>
          <p><strong>Student:</strong> ${data.name}</p>
          <p><strong>Course:</strong> ${data.courseTitle}</p>
          <p><strong>Certificate ID:</strong> ${data.certificateId}</p>
          <p><strong>Issue Date:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p>A new certificate has been issued on the WasteInstitute platform.</p>
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(result)}`);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending notification email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
