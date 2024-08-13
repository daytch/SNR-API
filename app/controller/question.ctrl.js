const question = require("../model/question");
const formidable = require("formidable");
const responseHelper = require("../helper/response.helper");
const notif = require("../controller/notification.ctrl");
// const conf = require("../config/upload.config");
// const { uploadfile } = require("../middlewares");

exports.getAllQuestionReport = async (param, res) => {
  try {
    console.log("test");
    var item = await question.getAllQuestionReport(param.body);

    return res.status(200).json(responseHelper.Success(item));
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.insertQuestion = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    }
    var ins = await question.insertQuestion(req);
    if (ins.affectedRows > 0) {
      notif.notificationNotifyPoestQuestion({
        questionId: ins.insertId,
        userId: req.userId,
      });
      if (req.askUserId !== undefined && req.askUserid !== "") {
        notif.notificationAskQuestion({
          questionId: ins.insertId,
          userId: req.askUserId,
        });
      }
      return res.status(200).json({
        isSuccess: true,
        message: "Success insert data",
        questionId : ins.insertId
      });
    } else {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed insert data",
      });
    }
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: error,
    });
  }
};

exports.countViewQuestion = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    }
    var countedViews = await question.findCountedViewQuestion(req);
    if (countedViews.length > 0) {
      return res.status(200).json({
        isSuccess: true,
        message: "Already Vote",
      });
    } else {
      var ins = await question.countViews(req);
      if (ins.affectedRows > 0) {
        return res.status(200).json({
          isSuccess: true,
          message: "Success insert data",
        });
      } else {
        return res.status(200).json({
          isSuccess: false,
          message: "Failed insert data",
        });
      }
    }
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed insert data",
    });
  }
};

exports.getAllQuestion = async (param, res) => {
  var rtn = {};
  try {
    var req = param.body;
    req.userId = param.userId;
    if (param.userId === undefined || param.userId === "") {
      return res
        .status(401)
        .json(
          responseHelper.FailWithMessage(
            "Failed to get profile. please relogin.!"
          )
        );
    }
    var items = await question.getAllQuestion(req);
    rtn.isSuccess = true;
    rtn.message = "Success";
    rtn.data = items;
    rtn.total = items.total;
    return res.status(200).json(rtn);
  } catch (error) {
    console.log(error.message);
    rtn.isSuccess = false;
    rtn.status = 200;
    rtn.message = "There Are something Wrong in Our System";
    console.log(error.message)
    return res.status(200).json(rtn);
  }
};

exports.searchMatchQuestion = async (param, res) => {
  try {
    var items = await question.searchMatchQuestion(param.body);

    var rtn = responseHelper.Success(items);

    return res.status(200).json(rtn);
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.reportQuestion = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    }
    var ins = await question.reportQuestion(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to report, please contact Administartor !"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.disableQuestion = async (param, res) => {
  try {
    var ins = await question.disableQuestion(param.body.questionId);
    if (ins.affectedRows > 0) {
      notif.notificationDisableQuestion({
        questionId: param.body.questionId,
      });
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to disable, please contact Administrator !"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.enableQuestion = async (param, res) => {
  try {
    var ins = await question.enableQuestion(param.body.questionId);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to enable, please contact Administrator !"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.getAllReportedQuestion = async (param, res) => {
  try {
    var items = await question.getAllReportedQuestion(param.body);
    return res.status(200).json(responseHelper.Success(items));
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.getAllQuestionTitle = async (param, res) => {
  try {
    var items = await question.getAllQuestionTitle();
    return res.status(200).json(responseHelper.Success(items));
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.followQuestion = async (param, res) => {
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
    var ins = await question.followQuestion(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to follow question, please contact Administrator"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.unfollowQuestion = async (param, res) => {
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
    var ins = await question.unfollowQuestion(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to unfollow question, please contact Administrator"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};
