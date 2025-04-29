import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, phone, date, reason, personToMeet, teacherName } = req.body;

  try {
    await resend.emails.send({
      from: 'appointments@yourdomain.com', // Must be verified in Resend
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
        ${
          personToMeet === 'Teacher'
            ? `<p><strong>Teacher Name:</strong> ${teacherName}</p>`
            : ''
        }
      `,
    });

    return res.status(200).json({ message: 'Appointment sent successfully.' });
  } catch (error) {
    console.error('Email sending failed:', error);
    return res.status(500).json({ message: 'Failed to send email.' });
  }
}

