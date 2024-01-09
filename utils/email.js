const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter
  //   const transporter = nodemailer.createTransport({
  //     host: process.env.EMAIL_HOST,
  //     port: process.env.EMAIL_PORT,
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //     debug: true,
  //   });

  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '88766066b8e921',
      pass: '022e3b8d01dcba',
    },
  });
  // 2. Define Email Options

  const emailOptions = {
    from: 'Rupesh Pokhrel <rupesh@clowns.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3. Send Email

  //   await transporter.sendMail(emailOptions);
  try {
    await transporter.sendMail(emailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
