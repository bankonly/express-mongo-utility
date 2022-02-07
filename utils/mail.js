const Mail = require("nodemailer");
const fs = require("fs");
const path = require("path");
const sendOtpLog = require("../data-sets/send-otp.json");

let transporter = null;
let minutePerRequest = 1;

const mailConfig = ({ email, service, password, limitMinutePerRequest = 1 }) => {
  transporter = Mail.createTransport({
    service: service,
    auth: {
      user: email,
      pass: password,
    },
  });
  minutePerRequest = limitMinutePerRequest;
};

const send = async ({ to, text = "Greeting!!", subject = "SUBJECT", from = null, otp_code, link, enableLog = true }) => {
  if (!transporter) throw new Error(`Invalid configuration mailConfig`);
  try {
    const mailSendOption = {
      from: from == null ? process.env.MAIL_ID : from,
      to: to,
      subject: subject,
      text: text,
      html:
        link ||
        `
      <h3>Your verify code</h3>
      <h1>${otp_code}</h1>
      `,
    };

    const sendMail = await transporter.sendMail(mailSendOption);
    if (sendMail.error) throw new Error("Mail failed");

    if (enableLog) {
      const now_date = new Date();
      const logData = {
        email: to,
        created_at: now_date.getTime(),
      };
      let created_at = logData.created_at;
      const emailIndex = sendOtpLog.findIndex((e) => e.email === to);
      if (emailIndex !== -1) {
        created_at = sendOtpLog[emailIndex].created_at;
        const minutes = Math.floor((now - created_at) / 60000);
        console.log(minutes);
      } else {
        sendOtpLog.push(logData);
      }

      fs.writeFileSync(__dirname + "/../data-sets/send-otp.json", JSON.stringify(sendOtpLog));
      console.log(sendOtpLog);
    }
  } catch (error) {
    console.log(error.message);
    throw new Error(`400::MAILER500`);
  }
};

function clearLogData() {
  fs.writeFileSync(__dirname + "/../data-sets/send-otp.json", JSON.stringify([]));
}

module.exports = {
  mailConfig,
  send,
  sendOTPLog: require("../data-sets/send-otp.json"),
  clearLogData,
};
