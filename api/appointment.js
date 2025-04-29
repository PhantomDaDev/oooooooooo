import { Resend } from 'resend';

const sanitizeHTML = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Parse request body
    let data;
    try {
        data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (error) {
        return res.status(400).json({ message: 'Invalid JSON format' });
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'date', 'reason', 'personToMeet'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        return res.status(400).json({ 
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        // Send email
        await resend.emails.send({
            from: 'appointments@yourdomain.com',
            to: 'shahaanikhlas06@gmail.com',
            subject: 'New Appointment Request',
            html: `
                <h2>Appointment Request Details</h2>
                ${Object.entries({
                    Name: sanitizeHTML(data.name),
                    Email: sanitizeHTML(data.email),
                    Phone: sanitizeHTML(data.phone),
                    Date: sanitizeHTML(data.date),
                    Reason: sanitizeHTML(data.reason),
                    'Person to Meet': sanitizeHTML(data.personToMeet),
                    ...(data.personToMeet === 'Teacher' && { 
                        'Teacher Name': sanitizeHTML(data.teacherName) 
                    })
                })
                .map(([key, value]) => `<p><strong>${key}:</strong> ${value || 'N/A'}</p>`)
                .join('')}
            `
        });

        return res.status(200).json({ message: 'Appointment request received successfully' });
    } catch (error) {
        console.error('Resend API Error:', error);
        return res.status(500).json({ 
            message: `Failed to send email: ${error.message}`
        });
    }
}
