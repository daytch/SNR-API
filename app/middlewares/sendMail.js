const conf = require("../config/mail.config");
const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport(conf);

exports.sendMail = async (to, subject, text) => {
    console.log("test");
    var mailOptions = {
        from: conf.auth.user,
        to: to,
        //  to: "quedeve@gmail.com",
        subject: subject,
        html: text
    };

    var resp = await wrapedSendMail(mailOptions);

    return resp;
};

async function wrapedSendMail(mailOptions) {
    return new Promise((resolve, reject) => {
        transport.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("error is " + error);
                resolve(false); // or use rejcet(false) but then you will have to handle errors
            }
            else {
                console.log('Email sent: ' + info.response);
                resolve(true);
            }
        });
    });
}