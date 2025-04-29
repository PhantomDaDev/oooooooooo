import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Parse JSON body directly from req.body
  let data;
  try {
    data = req.body;
    
    // If body is a string, parse it (some environments pass stringified JSON)
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return res.status(400).json({ message: 'Invalid request body' });
  }

  const { name, email, phone, date, reason, personToMeet, teacherName } = data;

  try {
    await resend.emails.send({
      from: 'appointments@yourdomain.com',
      to: 'shahaanikhlas06@gmail.com',
      subject: 'New Appointment Request',
      html: `
        <h2>Appointment Request</h2>
        ${Object.entries({
          Name: name,
          Email: email,
          Phone: phone,
          Date: date,
          Reason: reason,
          'Person to Meet': personToMeet,
          ...(personToMeet === 'Teacher' && { 'Teacher Name': teacherName })
        })
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value || 'Not provided'}</p>`)
        .join('')}
      `,
    });

    return res.status(200).json({ message: 'Appointment sent successfully.' });
  } catch (error) {
    console.error('Email sending failed:', error);
    return res.status(500).json({ 
      message: 'Failed to send email. Please try again later.' 
    });
  }
}
