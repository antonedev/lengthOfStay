require("dotenv").config();

const nodemailer = require("nodemailer");
const { formatDate } = require("./formatDate");

exports.sendEmail = function (recipient, subject, message) {
  let transport = nodemailer.createTransport({
    host: "smtp.ionos.com",
    port: 465,
    auth: {
      user: "lengthofstay@antone.dev",
      pass: process.env.IONOS_PASS,
    },
  });

  let mail = {
    from: "lengthofstay@antone.dev",
    to: recipient,
    subject: subject,
    html: message,
  };

  transport.sendMail(mail, (err, info) => {
    if (err) console.log(err);
    else console.log(info);
  });
};
