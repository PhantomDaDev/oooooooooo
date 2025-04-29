import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let data;
  try {
    data = JSON.parse(req.body);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  const { name, email, phone, date, reason, personToMeet, teacherName } = data;

  try {
    await resend.emails.send({
      from: 'appointments@yourdomain.com', // Make sure this is verified in Resend
      to: 'shahaanikhlas06@gmail.com',
      subject: 'New Appointment Request',
      html: `
        <h2>Appointment Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Person to Meet:</strong> ${personToMeet}</p>
        ${personToMeet === 'Teacher' ? `<p><strong>Teacher Name:</strong> ${teacherName}</p>` : ''}
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

