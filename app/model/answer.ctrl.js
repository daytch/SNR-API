const answer = require("../model/answer");
const formidable = require("formidable");
const responseHelper = require("../helper/response.helper");
const notif = require("../controller/notification.ctrl");
// const conf = require("../config/upload.config");
// const { uploadfile } = require("../middlewares");

exports.insertQuestionAnswer = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    }
    req.description = req.description.replace("'", '"');
    console.log(req.description);
    var ins = await answer.insertQuestionAnswer(req);
    if (ins.affectedRows > 0) {
      notif.notificationWriteQuestionAnswer({
        questionId: req.questionId,
        fromUserId: req.userId,
      });
      notif.notificationNotifyPoestAnswer({
        questionId: req.questionId,
        userId: req.userId,
      });
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
  } catch (error) {
    console.log(error.message)
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.countViewAnswer = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    }
    var countedViews = await answer.findViewsQuestionAnswer(req);
    if (countedViews.length > 0) {
      return res.status(200).json({
        isSuccess: true,
        message: "Already Vote",
      });
    } else {
      var ins = await answer.countViews(req);
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

exports.countUpvoteQuestionAnswer = async (param, res) => {
  var req = param.body;
  req.userId = param.userId;
  if (req.userId == undefined || req.userId == "") {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed to get profile, please relogin",
    });
  }
  var hasCounted = await answer.isUserhasCountedvote(req);
  if (hasCounted.length > 0) {
    var del = await answer.deleteCountedVote(hasCounted[0].id);
    if (del.affectedRows > 0) {
      return res.status(200).json({
        isSuccess: true,
        message: "Success insert data",
      });
    }
    return res.status(200).json({
      isSuccess: false,
      message: "Failed insert data",
    });
  } else {
    var ins = await answer.countUpvote(req);
    if (ins.affectedRows > 0) {
      notif.notificationQuestionAnswerUpvote({
        questionAnswerId: req.id,
        fromUserId: req.userId,
      });
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
};

exports.GetAllQuestionAnswer = async (param, res) => {
  var rtn = {};
  try {
    var req = param.body;
    req.userId = param.userId;
    if (param.userId === undefined || param.userId === "") {
      return res
        .status(401)
        .json(
          responseHelper.FailWithMessage(
            "Failed to get profile, please relogin.!"
          )
        );
    }
    var items = await answer.getAllQuestionAnswer(req);
    rtn = {
      data: items,
      total: items.total,
      isSuccess: true,
      message: "Success",
    };
    return res.status(200).json(rtn);
  } catch (error) {
    (rtn.isSuccess = false), (rtn.status = 200);
    rtn.message = "There Are somethign Wrong in Our System" + error;
    return res.status(200).json(rtn);
  }
};

exports.GetQuestionDetails = async (param, res) => {
  var rtn = {};
  try {
    var items = await answer.getQuestionDetails();
    rtn = {
      data: items,
      total: items.total,
      isSuccess: true,
      message: "Success",
    };
    return res.status(200).json(rtn);
  } catch (error) {
    (rtn.isSuccess = false), (rtn.status = 200);
    rtn.message = "There Are something Wrong in Our System" + error;
    return res.status(200).json(rtn);
  }
};

exports.reportAnswer = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    }
    var ins = await answer.reportAnswer(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to report Answer, please contact Administrator"
        )
      );
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.disableAnswer = async (param, res) => {
  try {
    var ins = await answer.disableAnswer(param.body.questionAnswerId);
    if (ins.affectedRows > 0) {
      notif.noticationDisableAnswer({
        questionAnswerId: param.body.questionAnswerId,
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
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.enableAnswer = async (param, res) => {
  try {
    var ins = await answer.enableAnswer(param.body.questionAnswerId);
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
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.GetAllReportedAnswer = async (param, res) => {
  try {
    var items = await answer.GetAllReportedAnswer(param.body);
    return res.status(200).json(responseHelper.Success(items));
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.getAllAnswerReport = async (param, res) => {
  try {
    var items = await answer.getAllAnswerReport(param.body);
    return res.status(200).json(responseHelper.Success(items));
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};
