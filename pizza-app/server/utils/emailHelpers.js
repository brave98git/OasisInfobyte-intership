const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, token) => {
    const url = `http://localhost:5173/verify-email?token=${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Pizza App - Verify Your Email',
        html: `<h3>Click <a href="${url}">here</a> to verify your email.</h3>`
    });
};

const sendPasswordResetEmail = async (email, token) => {
    const url = `http://localhost:5173/reset-password?token=${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Pizza App - Reset Password',
        html: `<h3>Click <a href="${url}">here</a> to reset your password.</h3>`
    });
};

const sendAdminThresholdAlert = async (adminEmail, items) => {
    const itemsHtml = items.map(i => `<li>${i.name} (Stock: ${i.stock})</li>`).join('');
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: 'URGENT: Low Stock Alert',
        html: `<h3>The following items are running low on stock:</h3><ul>${itemsHtml}</ul>`
    });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendAdminThresholdAlert };
