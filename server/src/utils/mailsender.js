// src/utils/emailService.js
const nodemailer = require('nodemailer');

// Gmail kullanacaksan "Uygulama Şifresi" (App Password) almalısın.
// Normal şifrenle çalışmaz.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'xxxxxxxx@gmail.com', // BURAYI DÜZENLE
    pass: 'xxxxxxxxx'  // BURAYI DÜZENLE
  }
});

const sendVerificationEmail = async (email, link) => {
  const mailOptions = {
    from: '"IsBul Destek" <xxxxxx@gmail.com>',
    to: email,
    subject: 'Lütfen Hesabınızı Doğrulayın',
    html: `<h3>Hoşgeldiniz!</h3>
           <p>Hesabınızı doğrulamak için lütfen aşağıdaki linke tıklayın:</p>
           <a href="${link}">Doğrula</a>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Doğrulama maili gönderildi: " + email);
  } catch (error) {
    console.error("Mail gönderme hatası:", error);
    // Hata olsa bile akışı kırmamak için throw etmiyoruz şimdilik
  }
};

module.exports = { sendVerificationEmail };