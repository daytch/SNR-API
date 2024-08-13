const config = require("../config/auth.config");
const users = require("../model/users");

const jwt = require("jsonwebtoken");
const { mailer, uploadfile, dynamiclink } = require("../middlewares");
const moment = require("moment");
const bcrypt = require("bcrypt");
const config_upload = require("../config/upload.config");
const conf_paging = require("../config/paging.config");
const formidable = require("formidable");
const randomString = require("randomstring");
const { user } = require("../config/db.config");
const responseHelper = require("../helper/response.helper");
const notif = require("../controller/notification.ctrl");

const from_year = 2019;

exports.getUserProfile = async (param, res) => {
  var rtn = {};
  try {
    var req = param.body;

    req.userId =
      req.userId === undefined || req.userId === "" ? param.userId : req.userId;

    var data = await users.getUserProfile(req);

    var status = 200;
    rtn.isSuccess = true;
    rtn.message = "Success";
    rtn.data = data;

    // rtn.total = items.total;
    return res.status(status).json(rtn);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      isSuccess: false,
      message: "Something Wrong in System, Please Contact Administrator!",
    });
  }
};

exports.getFollowers = async (param, res) => {
  var rtn = {};
  try {
    var req = param.body;
    req.userId =
      req.userId === undefined || req.userId === "" ? param.userId : req.userId;

    var data = await users.getFollowers(req);

    // var status = 200;
    // rtn.isSuccess = true;
    // rtn.message = "Success";
    // rtn.data = data;

    // rtn.total = items.total;
    return res.status(200).json(responseHelper.Success(data));
  } catch {
    return res.status(200).json({
      isSuccess: false,
      message: "Something Wrong in System, Please Contact Administrator!",
    });
  }
};

exports.getUsers = async (param, res) => {
  var rtn = {};
  try {
    var req = param.body;
    if (param.userId === undefined || param.userId === "") {
      return res.status(401).json("Failed to get profile, please relogin.!");
    }
    req.currentLoginId = param.userId;
    var data = await users.getUsers(req);
    rtn.isSuccess = true;
    rtn.message = "Success";
    rtn.data = data;
    rtn.total = data.total;

    return res.status(200).json(rtn);
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message:
        "Something Wrong in System, Please Contact Administrator!" +
        error.message,
    });
  }
};

exports.removeFollowers = async (param, res) => {
  var rtn = {};
  try {
    var req = param.body;
    req.userId = param.userId;
    var ins = await users.removeFollowers(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json({
        isSuccess: true,
        message: "Success update data",
      });
    } else {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed update data",
      });
    }
  } catch {
    return res.status(200).json({
      isSuccess: false,
      message: "Something Wrong in System, Please Contact Administrator!",
    });
  }
};

exports.unfollow = async (param, res) => {
  var rtn = {};
  try {
    var req = param.body;
    req.userId = param.userId;
    var ins = await users.unfollow(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json({
        isSuccess: true,
        message: "Success update data",
      });
    } else {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed update data",
      });
    }
  } catch {
    return res.status(200).json({
      isSuccess: false,
      message: "Something Wrong in System, Please Contact Administrator!",
    });
  }
};

exports.getFollowing = async (param, res) => {
  var rtn = {};
  try {
    var req = param.body;
    req.userId =
      req.userId === "" || req.userId === undefined ? param.userId : req.userId;

    var data = await users.getFollowing(req);

    status = 200;
    rtn.isSuccess = true;
    rtn.message = "Success";
    rtn.data = data;

    rtn.total = data.total;

    return res.status(status).json(rtn);
  } catch (error) {
    console.log(error.message);
    return res.status(200).json({
      isSuccess: false,
      message: "Something Wrong in System, Please Contact Administrator!",
    });
  }
};

exports.loginUser = async (param, res) => {
  // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
  var req = param.body;
  // console.log(param.body);
  if (req.email == "") {
    // Gagal
    return res.status(200).json({
      isSuccess: false,
      message: "Login Failed, email has been null",
    });
  }
  var verif = await verifyLogin(req.email, req.password, req.token, req.type);
  if (!verif) {
    return res.status(200).json({
      isSuccess: false,
      message: "Username or password did not match",
    });
  }

  await users.loginUser(req.email, "User", res, this.processLogin);
};

exports.loginUserSSO = async (param, res) => {
  try {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    if (req.email == undefined || req.email == "") {
      // Gagal
      return res.status(200).json({
        isSuccess: false,
        message: "Login Failed",
      });
    }

    var login = await users.loginUserSSO(req.email, "User", req.source);
    if (login.length == 0) {
      var salt = await bcrypt.genSalt(config.regSalt);
      var password = await bcrypt.hash("defaultpassSSO202011", salt);

      var parm = {
        email: req.email,
        source: req.source,
        password: password,
        name: req.name,
        username: `${req.email}` + req.email,
      };
      if (req.source === "facebook") {
        await users.registerUserFacebook(parm, async (err, rtn) => {
          if (rtn != null) {
            if (rtn.affectedRows > 0) {
              // Sukses
              var prm = {
                email: req.email,
                source: req.source,
              };
              var usr = await users.getAllRecordSSO(prm);
              var id_user = "";
              for (let u of usr) {
                id_user = u.id;
              }

              var prmRoles = {
                userId: id_user,
                roleId: 1, // Roles Default User,
                source: req.source,
              };

              await users.registerUsersRole(
                prmRoles,
                async (errRole, rtnRole) => {
                  console.log(rtnRole);
                  if (rtnRole != null) {
                    if (rtnRole.affectedRows > 0) {
                      var prm_dtls = {
                        id: id_user,
                        img_avatar: req.img_avatar,
                        isMute: 0,
                      };
                      var ins_dtls = await users.insertUsertDetails(prm_dtls);
                      if (ins_dtls.affectedRows > 0) {
                        var cek = await users.getRecordToken(
                          req.token,
                          id_user,
                          req.type
                        );
                        if (cek.length == 0) {
                          var ins = await users.insertToken(
                            req.token,
                            id_user,
                            req.type
                          );
                          if (ins.affectedRows < 1) {
                            console.error(
                              "Failed to insert token notification"
                            );
                          }
                        }

                        // Direct login
                        await users.loginUserSSOCallback(
                          req.email,
                          "",
                          req.source,
                          res,
                          this.processLogin
                        );
                      } else {
                        return res.status(200).json({
                          isSuccess: false,
                          message: "Register User failed on details",
                        });
                      }
                    } else {
                      return res.status(200).json({
                        isSuccess: false,
                        message: "Register User failed",
                      });
                    }
                  } else {
                    console.log("registerUser-error");
                    console.log(errRole);

                    return res.status(200).json({
                      isSuccess: false,
                      message: "Register User failed",
                    });
                  }
                }
              );
            } else {
              // Gagal
              return res.status(200).json({
                isSuccess: false,
                message: "Register User failed",
              });
            }
          } else {
            console.log("registerUser-error");
            console.log(err);

            return res.status(200).json({
              isSuccess: false,
              message: "Register User failed",
            });
          }
        });
      } else if (req.source === "google") {
        await users.registerUserGoogle(parm, async (err, rtn) => {
          if (rtn != null) {
            if (rtn.affectedRows > 0) {
              // Sukses
              var prm = {
                email: req.email,
                source: req.source,
              };
              var usr = await users.getAllRecordSSO(prm);
              var id_user = "";
              for (let u of usr) {
                id_user = u.id;
              }

              var prmRoles = {
                userId: id_user,
                roleId: 1, // Roles Default User
                source: req.source,
              };
              await users.registerUsersRole(
                prmRoles,
                async (errRole, rtnRole) => {
                  if (rtnRole != null) {
                    if (rtnRole.affectedRows > 0) {
                      var prm_dtls = {
                        id: id_user,
                        img_avatar: req.img_avatar,
                        isMute: 0,
                      };
                      console.log(prm_dtls, "test asd");
                      var ins_dtls = await users.insertUsertDetails(prm_dtls);
                      if (ins_dtls.affectedRows > 0) {
                        var cek = await users.getRecordToken(
                          req.token,
                          id_user,
                          req.type
                        );
                        if (cek.length == 0) {
                          var ins = await users.insertToken(
                            req.token,
                            id_user,
                            req.type
                          );
                          if (ins.affectedRows < 1) {
                            console.error(
                              "Failed to insert token notification"
                            );
                          }
                        }

                        // Direct login
                        await users.loginUserSSOCallback(
                          req.email,
                          "",
                          req.source,
                          res,
                          this.processLogin
                        );
                      } else {
                        return res.status(200).json({
                          isSuccess: false,
                          message: "Register User failed on details",
                        });
                      }
                    } else {
                      return res.status(200).json({
                        isSuccess: false,
                        message: "Register User failed",
                      });
                    }
                  } else {
                    console.log("registerUser-error");
                    console.log(errRole);

                    return res.status(200).json({
                      isSuccess: false,
                      message: "Register User failed",
                    });
                  }
                }
              );
            } else {
              // Gagal
              return res.status(200).json({
                isSuccess: false,
                message: "Register User failed",
              });
            }
          } else {
            console.log("registerUser-error");
            console.log(err);

            return res.status(200).json({
              isSuccess: false,
              message: "Register User failed",
            });
          }
        });
      }
    } else {
      var id_user = "";
      for (var l of login) {
        id_user = l.id;
      }
      var cek = await users.getRecordToken(req.token, id_user, req.type);
      if (cek.length == 0) {
        var ins = await users.insertToken(req.token, id_user, req.type);
        if (ins.affectedRows < 1) {
          console.error("Failed to insert token notification");
        }
      }

      await users.loginUserSSOCallback(
        req.email,
        "",
        req.source,
        res,
        this.processLogin
      );
    }
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.loginAdmin = async (param, res) => {
  // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
  var req = param.body;
  if (req.email == "") {
    // Gagal
    return res.status(200).json({
      isSuccess: false,
      message: "Login Failed, email has been null",
    });
  }
  var verif = await verifyLogin(req.email, req.password, "", "");
  if (!verif) {
    return res.status(200).json({
      isSuccess: false,
      message: "Username or password did not match",
    });
  }
  await users.loginUser(req.email, "Admin", res, this.processLogin);
};

exports.registerAdmin = async (param, res) => {
  try {
    var req = param.body;
    if (req.email == undefined || req.email == "") {
      // Gagal
      return res.status(200).json({
        isSuccess: false,
        message: "Register User failed",
      });
    }
    var prm = {
      email: req.email,
      username: req.username,
    };
    var check_user = await users.checkusers(prm);
    if (check_user.length > 0) {
      // Gagal
      return res.status(200).json({
        isSuccess: false,
        message: "Email or username has been registered",
      });
    }
    req.source = "App"; // Register from Application
    var salt = await bcrypt.genSalt(config.regSalt);
    req.password = await bcrypt.hash(req.password, salt);
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
  await users.registerUser(req, async (err, rtn) => {
    if (rtn != null) {
      if (rtn.affectedRows > 0) {
        // Sukses
        var prm = {
          email: req.email,
        };
        var usr = await users.getAllRecord(prm);
        var id_user = "";
        for (let u of usr) {
          id_user = u.id;
        }

        var prmRoles = {
          userId: id_user,
          roleId: 3, // Roles Default User
        };
        await users.registerUsersRole(prmRoles, async (errRole, rtnRole) => {
          if (rtnRole != null) {
            if (rtnRole.affectedRows > 0) {
              var prm_dtls = {
                id: id_user,
                img_avatar: "",
                isMute: 0,
                country: "",
              };
              var ins_dtls = await users.insertUsertDetails(prm_dtls);
              if (ins_dtls.affectedRows > 0) {
                var cek = await users.getRecordToken(
                  req.token,
                  id_user,
                  req.type
                );
                if (cek.length == 0) {
                  var ins = await users.insertToken(
                    req.token,
                    id_user,
                    req.type
                  );
                  if (ins.affectedRows < 1) {
                    console.error("Failed to insert token notification");
                  }
                }

                return res.status(200).json({
                  isSuccess: true,
                  message: "Register User success",
                });
              } else {
                return res.status(200).json({
                  isSuccess: false,
                  message: "Register User failed",
                });
              }
            } else {
              return res.status(200).json({
                isSuccess: false,
                message: "Register User failed",
              });
            }
          } else {
            console.log("registerUser-error");
            console.log(errRole);

            return res.status(200).json({
              isSuccess: false,
              message: "Register User failed",
            });
          }
        });
      } else {
        // Gagal
        return res.status(200).json({
          isSuccess: false,
          message: "Register User failed",
        });
      }
    } else {
      console.log("registerUser-error");
      console.log(err);

      return res.status(200).json({
        isSuccess: false,
        message: "Register User failed",
      });
    }
  });
};

exports.registerUser = async (param, res) => {
  var req = param.body;
  if (req.email == undefined || req.email == "") {
    // Gagal
    return res.status(200).json({
      isSuccess: false,
      message: "Register User failed",
    });
  }
  var prm = {
    email: req.email,
    username: req.username,
  };

  var check_user = await users.checkusers(prm);
  if (check_user.length > 0) {
    // Gagal
    return res.status(200).json({
      isSuccess: false,
      message: "Email or username has been registered",
    });
  }

  req.source = "App"; // Register from Application
  var salt = await bcrypt.genSalt(config.regSalt);
  req.password = await bcrypt.hash(req.password, salt);

  await users.registerUser(req, async (err, rtn) => {
    if (rtn != null) {
      if (rtn.affectedRows > 0) {
        // Sukses
        var prm = {
          email: req.email,
        };
        var usr = await users.getAllRecord(prm);
        var id_user = "";
        for (let u of usr) {
          id_user = u.id;
        }

        var prmRoles = {
          userId: id_user,
          roleId: 1, // Roles Default User
        };
        await users.registerUsersRole(prmRoles, async (errRole, rtnRole) => {
          if (rtnRole != null) {
            if (rtnRole.affectedRows > 0) {
              var prm_dtls = {
                id: id_user,
                img_avatar: "",
                isMute: 0,
                country: req.country,
              };
              var ins_dtls = await users.insertUsertDetails(prm_dtls);
              if (ins_dtls.affectedRows > 0) {
                var cek = await users.getRecordToken(
                  req.token,
                  id_user,
                  req.type
                );
                if (cek.length == 0) {
                  var ins = await users.insertToken(
                    req.token,
                    id_user,
                    req.type
                  );
                  if (ins.affectedRows < 1) {
                    console.error("Failed to insert token notification");
                  }
                }

                return res.status(200).json({
                  isSuccess: true,
                  message: "Register User success",
                });
              } else {
                return res.status(200).json({
                  isSuccess: false,
                  message: "Register User failed",
                });
              }
            } else {
              return res.status(200).json({
                isSuccess: false,
                message: "Register User failed",
              });
            }
          } else {
            console.log("registerUser-error");
            console.log(errRole);

            return res.status(200).json({
              isSuccess: false,
              message: "Register User failed",
            });
          }
        });
      } else {
        // Gagal
        return res.status(200).json({
          isSuccess: false,
          message: "Register User failed",
        });
      }
    } else {
      console.log("registerUser-error");
      console.log(err);

      return res.status(200).json({
        isSuccess: false,
        message: "Register User failed",
      });
    }
  });
};

exports.getProfile = async (param, res) => {
  var user_id = param.userId;

  var dt = await users.getUserDetails(user_id);

  var rtn = {};
  var status = 200; // Default if failed.
  if (dt.length > 0) {
    status = 200;
    rtn = {
      isSuccess: true,
      message: "Success get profile",
      data: dt[dt.length - 1],
    };
  } else {
    rtn = {
      isSuccess: false,
      message: "profile not found",
    };
  }

  return res.status(status).json(rtn);
};

exports.insertUserDetails = async (param, res) => {
  var req = param.body;
  var ins = {
    affectedRows: 0,
  };
  if (req.userId != undefined) {
    ins = await users.insertUsertDetails(req);
  }

  var rtn = {
    isSuccess: "",
    message: "",
  };
  var status = 200; // Default if failed.
  if (ins.affectedRows > 0) {
    status = 200;
    rtn.isSuccess = true;
    rtn.message = "Insert User details success";
  } else {
    rtn.isSuccess = false;
    rtn.message = "Insert User details failed";
  }

  return res.status(status).json(rtn);
};
exports.testEmail = async (param, res) => {
  try {
    var test = await mailer.sendMail(
      "quedeve@gmail.com",
      "Test Email",
       "Test Email",
    );
   if(test){
    return res.status(200).json({
      isSuccess: true,
      message: "Test Email success",
    });
   }
   else{
    return res.status(200).json({
      isSuccess: false,
      message: "Test Email failed",
    });
   }
  } catch (error) {
    return res.status(400).json({
      isSuccess: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};

exports.forgotPasswordReq = async (param, res) => {
  var req = param.body;
  if (req.email == undefined || req.email == "") {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed to forgot password, email has null",
    });
  }
  var interval_time = 86400; // 24 hours

  var name = "";
  var token = "";
  var usr = await users.getAllRecord(req);
  for (var u of usr) {
    name = u.name;
    token = jwt.sign(
      { email: u.email, desc: "Forgot Password" },
      config.secret,
      {
        expiresIn: interval_time,
      }
    );
  }

  if (usr.length > 0) {
    var exp_time = moment().add(interval_time, "s");
    var exp_str = exp_time.format("YYYY-MM-DD HH:mm:ss");
    var ins = await users.insertForgotPass(req.email, 0, exp_str, token);

    if (ins.affectedRows > 0) {
      var url =
        "https://pito-api.herokuapp.com/user/resetPassword?token=" + token;
      var subject = "Pito User Forgot Password";
      var text = "Hi " + name + ",<br/><br/>";
      text += "Please reset your password on this link :<br/>";
      text += url + " <br/>";
      text += "Expired on " + exp_str + " <br/><br/>";
      text += "Regards,<br/>Pito Team";

      var mail = await mailer.sendMail(req.email, subject, text);

      if (mail) {
        return res.status(200).json({
          isSuccess: true,
          message: "Success send email forgot password",
        });
      } else {
        return res.status(200).json({
          isSuccess: false,
          message: "Failed send email forgot password",
        });
      }
    } else {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed send email forgot password",
      });
    }
  } else {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed to forgot password, User is not registered",
    });
  }
};

exports.forgotPassword = async (param, res) => {
  try {
    var req = param.body;
    if (req.email == undefined || req.email == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to forgot password, email has null",
      });
    }
    var usr = await users.getAllRecord(req);
    var randomPassword = randomString.generate();
    console.log(usr.length);
    if (usr.length > 0) {
      var salt = await bcrypt.genSalt(config.regSalt);
      var password = await bcrypt.hash(randomPassword, salt);

      var upd = await users.changePassword(usr[0].id, password);

      if (upd.affectedRows < 1) {
        return res.status(200).json({
          isSuccess: false,
          message: "Failed to reset password",
        });
      }

      // var url = "https://pito-api.herokuapp.com/user/resetPassword?token=" + token;
      var subject = "Snap N Review User Forgot Password";
      var text = "Hi " + usr[0].name + ",<br/><br/>";
      text += "Your Password has been Generated :<br/>";
      text += "<b>" + randomPassword + "</b>" + " <br/>";
      // text += "Expired on " + exp_str + " <br/><br/>";
      text += "Regards,<br/><b>Snap N Review Team</b>";
      var mail = await mailer.sendMail(req.email, subject, text);
    }
    // console.log(randomPassword);
    // console.log(usr.length);
    return res.status(200).json({
      isSuccess: true,
      message: "Password has Been Reset, Please check your Mail!",
    });
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: "Something Wrong in Our System, Please contact Administrator!!!",
    });
  }
};

exports.resetPassword = async (param, res) => {
  var req = param.body;
  if (req.email == undefined || req.email == "") {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed to reset password, email has null",
    });
  }

  var upd = await users.changePassword(req.email, req.password);
  if (upd.affectedRows > 0) {
    return res.status(200).json({
      isSuccess: true,
      message: "Success to reset password",
    });
  } else {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed to reset password",
    });
  }
};

exports.changePassword = async (param, res) => {
  var req = param.body;
  var user_id = param.userId;
  if (req.new_password == undefined || req.new_password == "") {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed to change password, New password has null",
    });
  }

  var email = "";
  var prm = {
    id: user_id,
  };
  var cek = await users.getAllRecord(prm);
  for (var c of cek) {
    email = c.email;
  }
  var verif = await verifyLogin(email, req.old_password, "", "");
  if (verif) {
    var salt = await bcrypt.genSalt(config.regSalt);
    var new_password = await bcrypt.hash(req.new_password, salt);
    var upd = await users.changePassword(user_id, new_password);
    if (upd.affectedRows > 0) {
      return res.status(200).json({
        isSuccess: true,
        message: "Success to change password",
      });
    } else {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to change password",
      });
    }
  } else {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed to change password, Username or password did not match",
    });
  }
};

async function verifyLogin(email, loginpass, token, type) {
  var rtn = false;
  var prm = {
    email: email,
  };
  var usr = await users.getAllRecord(prm);
  if (usr.length > 0) {
    var pass = "";
    var id = 0;
    for (let u of usr) {
      pass = u.password;
      id = u.id;
    }
    var isSame = await bcrypt.compare(loginpass, pass);

    if (isSame) {
      console.log("isSame",isSame);
      rtn = true;

      if (token != "" && type != "") {
        var cek = await users.getRecordToken(token, id, type);
        console.log(cek.length);
        if (cek.length == 0) {
          var ins = await users.insertToken(token, id, type);
          if (ins.affectedRows < 1) {
            console.error("Failed to insert token notification");
          }
        }
      }
    }
  }
  console.log("return verify login", rtn);
  return rtn;
}

exports.processLogin = async (err, rtn, res, role) => {
  var dt = {};
  var status = 0;
  console.log("rtn process login", rtn)
  if (rtn != null) {
    var cnt = rtn.length;
    if (cnt > 0) {
      var userId = "";
      var roleName = ""; // Untuk Token
      var roleArr = [];
      var userEmail = "";
      var name = "";
      for (var p of rtn) {
        userId = p.id;
        userEmail = p.email;
        name = p.name;
        if (roleName != "") {
          roleName += ",";
        }
        roleName += p.role_name; // Untuk Token
        roleArr.push(p.role_name);
      }

      // Login User
      // if(role == ""){
      if (!roleName.includes(role)) {
        status = 200;
        dt = {
          isSuccess: false,
          message: "Username or password did not match",
        };
        return res.status(status).json(dt);
      }
      // }

      var image = "";
      var isMute = "";
      if (userId != "") {
        var dtls = await users.getUserDetails(userId);
        for (var d of dtls) {
          image = d.img_avatar;
          isMute = d.isMute;
        }
      }

      status = 200;
      var token = jwt.sign({ id: userId, role: roleName }, config.secret, {
        expiresIn: 2592000, // 30 day
      });
      console.log(rtn);
      dt = {
        isSuccess: true,
        message: "Success",
        id: userId,
        name: name,
        email: userEmail,
        image: image,
        isMute: isMute,
        roles: roleArr,
        googleMail: rtn[0].googleMail,
        facebookMail: rtn[0].facebookMail,
        facebookMail: rtn[0].facebookMail,
        joinDate: rtn[0].createdAt,
        countedFollowers: rtn[0].countedFollowers,
        countedProductPosted: rtn[0].countedProductPosted,
        countedQuestionPosted: rtn[0].countedQuestionPosted,
        countedFollowing: rtn[0].countedFollowing,
        countedProductReviewed: rtn[0].countedProductReviewed,
        countedQuestionAnswer: rtn[0].countedQuestionAnswer,
        bio: rtn[0].bio,
        img_avatar: rtn[0].img_avatar,
        country: rtn[0].country,
        token: token,
      };

      var log = await users.updateLastLogin(userId);
      if (log.affectedRows == 0) {
        console.error("Failed update last login on id " + userId);
      }
    } else {
      status = 200;
      dt = {
        isSuccess: false,
        message: "Username or password did not match",
      };
    }
  } else {
    status = 200;
    dt = {
      isSuccess: false,
      message: "Login Failed",
    };
  }

  return res.status(status).json(dt);
};

exports.submitProfile = async (param, res) => {
  // var req = param.body;
  try {
    var user_id = param.userId;
    var form = new formidable.IncomingForm();
    form.parse(param, async (err, fields, files) => {
      if (err) {
        return res.status(200).json({
          isSuccess: false,
          message: "Failed Update Profile",
        });
      }
      var userParam = {
        userId: user_id,
        username: fields.username,
        email: fields.email,
      };
      if (fields.bio !== undefined && fields.bio !== "") {
        fields.bio = fields.bio.replace("'", "''");
      }
      var checkUsed = await users.checkUser(userParam);

      if (checkUsed.length > 0) {
        return res.status(200).json({
          isSuccess: false,
          message: "Username or Email Already Taken.!!",
        });
      }
      var prm = {
        id: user_id,
        img_avatar: "",
        isMute: 0,
        bio: fields.bio,
        username: fields.username,
        name: fields.name,
        email: fields.email,
        country: fields.country,
      };
      if (files.mypic !== undefined && files.mypic != "") {
        var check = await uploadfile.processUpload(files.mypic, user_id);
        if (!check.error) {
          prm = {
            id: user_id,
            img_avatar:
              config_upload.base_url +
              "/" +
              config_upload.folder +
              "/" +
              check.filename,
            isMute: 0,
            bio: fields.bio,
            username: fields.username,
            name: fields.name,
            email: fields.email,
            country: fields.country,
            flagDeleteAva: fields.flagDeleteAva,
          };
        }

        var ins = await users.insertUsertDetails(prm);

        if (ins.affectedRows > 0) {
          // var name = fields.name;
          var upd = await users.updateUser(prm);
          if (upd.affectedRows > 0) {
            var data = await users.getUserDetails(prm.id);
            return res.status(200).json({
              isSuccess: true,
              message: "Success Update Profile",
              data: data[data.length - 1],
            });
          }
        }
        return res.status(200).json({
          isSuccess: false,
          message: "Failed Update Profile",
        });
      }
      return res.status(200).json({
        isSuccess: false,
        message:
          "Failed Update Profile, mypic parameter is not included, please include while is filled or not ",
      });
    });
  } catch (error) {
    console.log(error.message);
    return res.status(200).json({
      isSuccess: false,
      message: "Failed Update Profile",
    });
  }
};

exports.updateProfile = async (param, res) => {
  // var req = param.body;

  var user_id = param.userId;
  var form = new formidable.IncomingForm();
  form.parse(param, async (err, fields, files) => {
    if (err) {
      console.error("Error", err);
      return res.status(200).json({
        isSuccess: false,
        message: "Failed Update Profile",
      });
    }
    if (files.mypic !== undefined && files.mypic != "") {
      var check = await uploadfile.processUpload(files.mypic, user_id);
      if (!check.error) {
        var prm = {
          userId: user_id,
          img_avatar:
            config_upload.base_url +
            "/" +
            config_upload.folder +
            "/" +
            check.filename,
        };
        var ins = await users.insertUsertDetails(prm);
        if (ins.affectedRows > 0) {
          var name = fields.name;
          var upd = await users.updateName(name, user_id);
          if (upd.affectedRows > 0) {
            var data = await users.getUserDetails(user_id);
            return res.status(200).json({
              isSuccess: true,
              message: "Success Update Profile",
              data: data[data.length - 1],
            });
          }
        }
        return res.status(200).json({
          isSuccess: false,
          message: "Failed Update Profile",
        });
      } else {
        return res.status(200).json({
          isSuccess: false,
          message: check.message,
        });
      }
    } else {
      // Change display name or delete avatar
      if (fields.flagDeleteAva != "") {
        var prm = {
          userId: user_id,
          img_avatar: "",
        };
        var ins = await users.insertUsertDetails(prm);
        if (ins.affectedRows == 0) {
          return res.status(200).json({
            isSuccess: false,
            message: "Failed Update Profile",
          });
        }
      }
      var name = fields.name;
      var upd = await users.updateName(name, user_id);
      if (upd.affectedRows > 0) {
        var data = await users.getUserDetails(user_id);
        return res.status(200).json({
          isSuccess: true,
          message: "Success Update Profile",
          data: data[data.length - 1],
        });
      }
      return res.status(200).json({
        isSuccess: false,
        message: "Failed Update Profile",
      });
    }
  });
};

exports.getListUser = async (param, res) => {
  var dt = await users.getAllRecord({ isActive: 1 });
  res.status(200).json({
    isSuccess: true,
    data: dt,
  });
};

exports.logoutUser = async (param, res) => {
  var user_id = param.userId;
  var token = param.body.token;
  var type_device = param.body.type;

  var upd = await users.deleteToken(token, user_id, type_device);
  if (upd.affectedRows > 0) {
    return res.status(200).json({
      isSuccess: true,
      message: "Success Logout",
    });
  } else {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed Logout",
    });
  }
};

exports.disableUserByAdmin = async (req, res) => {
  var user_id = req.body.user_id;
  var upd = await users.updateActive(user_id, 0);
  if (upd.affectedRows > 0) {
    var dt = await users.getUserDetails(user_id);
    var subject = "Your account has been disable from Pito.";
    var text = "<br/><br/>";
    text += "This account has been temporarily disabled.<br/>";
    text +=
      "Please contact administrator at contact@pito.com.sg for more information.<br/>";
    text += "<br/><br/>";
    text += "Regards,<br/>Pito Team";

    var mail = await mailer.sendMail(dt.email, subject, text);

    if (mail) {
      return res.status(200).json({
        isSuccess: true,
        message: "Success disable user",
      });
    } else {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed send email disable user",
      });
    }
  } else {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed disable user",
    });
  }
};

exports.enableUserByAdmin = async (req, res) => {
  var user_id = req.body.user_id;
  var upd = await users.updateActive(user_id, 1);
  if (upd.affectedRows > 0) {
    var dt = await users.getUserDetails(user_id);
    var subject = "Your account has been activated back Pito.";
    var text = "<br/><br/>";
    text += "This account has been activated back!!!<br/>";
    text += "<br/><br/>";
    text += "Regards,<br/>Pito Team";

    var mail = await mailer.sendMail(dt.email, subject, text);

    if (mail) {
      return res.status(200).json({
        isSuccess: true,
        message: "Success enable user",
      });
    } else {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed send email enable user",
      });
    }
  } else {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed enable user",
    });
  }
};

exports.followUser = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId === undefined || req.userId === "") {
      return res
        .status(401)
        .json(
          responseHelper.FailWithMessage(
            "Failed to get profile, please relogin!"
          )
        );
    }
    var ins = await users.followUser(req);
    if (ins.affectedRows > 0) {
      notif.notificationFollowUser({
        fromUserId: req.userId,
        userId: req.userFollowedId,
      });
      return res.status(200).json(responseHelper.SuccessWithEmptyData(0));
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to follow user, pelase contact Administrator.!"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.notifyUsers = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId === undefined || req.userId === "") {
      return res
        .status(401)
        .json(
          responseHelper.FailWithMessage(
            "Failed to get profile, please relogin!"
          )
        );
    }
    var ins = await users.notifyUsers(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to add notify, please contact Adminstrator!"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.connectGoogle = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId === undefined || req.userId === "") {
      return res
        .status(401)
        .json(
          responseHelper.FailWithMessage(
            "Failed to get profile, please relogin!"
          )
        );
    }
    console.log(req);
    var item = await users.checkGoogleMail(req);
    if (item.length > 0) {
      return res
        .status(200)
        .json(
          responseHelper.FailWithMessage(
            "This google account already connected with other user"
          )
        );
    }
    var ins = await users.connectGoogle(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to connect google. please contact Administrator!"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.connectFacebook = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId === undefined || req.userId === "") {
      return res
        .status(401)
        .json(
          responseHelper.FailWithMessage(
            "Failed to get profile. please relogin!"
          )
        );
    }
    var item = await users.checkFacebookMail(req);
    if (item.length > 0) {
      return res
        .status(200)
        .json(
          responseHelper.FailWithMessage(
            "This facebook account already connected with other user"
          )
        );
    }
    var ins = await users.connectFacebook(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to connect facebook. please contact Adminstrator!"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.getAllUsers = async (param, res) => {
  try {
    var items = await users.getAllUsers(param.body);
    return res.status(200).json(responseHelper.Success(items));
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.disableUser = async (param, res) => {
  try {
    var req = param.body;
    var selectedUser = await users.selectUsers(req);
    req.isActive = !selectedUser[0].isactive;
    console.log(req);
    console.log(selectedUser[0]);
    var ins = await users.disableUser(req);
    if (ins.affectedRows > 0) {
      notif.notificationEnableDisableUser({
        isActive: req.isActive,
        userId: req.userId,
      });
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to disable user, please contact Administrator!"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};
exports.enableUser = async (param, res) => {
  try {
    var req = param.body;
    var ins = await users.enableUser(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to enable user, please contact Administrator!"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};
/* Push Notif IOS
const apn = require("apn");
exports.sendNotifIOS = async(param, res) => {
    var req = param.query;
    var token = req.token;

    var options = {
        pfx : appRoot + "\\ioscert\\certif.p12",
        production: true
      };

    var apnConnection = new apn.Provider(options);

    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    // note.badge = 1;
    // note.sound = "ping.aiff";
    // note.alert = "Testing PITO XX";
    // note.payload = {'messageFrom': 'John Appleseed'};
    // note.payload = {"url" : "pito://video?video_id=1"};
    // note.payload = {
    //     aps : {
    //         deeplink: "pito://video?video_id=1"
    //     }
    // }
    note.rawPayload = {
        "aps":{"alert":"Testing.. (15)","badge":1,"sound":"default", "deeplink": "pito://video?video_id=1"}
    }
    note.topic = "com.pito";

    apnConnection.send(note, token).then( (result) => {
        // see documentation for an explanation of result
        console.log("result",result);
        if(result.failed.length > 0){
            console.log("response", result.failed[0].response);
        }
    });

    return res.json({success: "true"});
}
*/

/* Push Notif Android */
// const admin = require("firebase-admin");
// const serviceAccount = require("../../fbase/pito-60b05-firebase-adminsdk-3zi3t-916f9b9b09.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });
// exports.pushAndroid = async(req, res) => {
//     var token = req.query.token;
//     var message = {
//         data: {
//             title: "Your password was changed",
//             body: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt",
//             // image: "optional",
//             deepLink: "pito://video?video_id=1"
//         },
//         token: token
//     };

//     // Send a message to the device corresponding to the provided
//     // registration token.
//     admin.messaging().send(message)
//     .then((response) => {
//     // Response is a message ID string.
//         console.log('Successfully sent message:', response);
//     })
//     .catch((error) => {
//         console.log('Error sending message:', error);
//     });

//     return res.json({status : "ok"});
// }
