const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");
const dbmysql = require("./dbmysql");
const mailer = require("./sendMail");
const uploadfile = require("./uploadfile");
const sendNotif = require("./sendNotif");
const dynamiclink = require("./dynamiclink");

module.exports = {
  authJwt,
  verifySignUp,
  dbmysql,
  mailer,
  uploadfile,
  sendNotif,
  dynamiclink
};