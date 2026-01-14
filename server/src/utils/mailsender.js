const nodemailer = require('nodemailer');
// Garanti olsun diye burada da çağırıyoruz
require('dotenv').config(); 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Artık şifre kodun içinde değil!
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, link) => {
  const mailOptions = {
    from: `"IsBul Destek" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Lütfen Hesabınızı Doğrulayın',
    html: `<h3>Hoşgeldiniz!</h3>
           <p>Hesabınızı doğrulamak için lütfen aşağıdaki linke tıklayın:</p>
           <a href="${link}">Doğrula</a>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Doğrulama maili gönderildi: " + email);
  } catch (error) {
    console.error("❌ Mail gönderme hatası:", error);
  }
};

module.exports = { sendVerificationEmail };