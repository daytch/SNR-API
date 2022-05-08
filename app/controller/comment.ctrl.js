const comment = require("../model/comment");
const formidable = require("formidable");
const responseHelper = require("../helper/response.helper");
const notif = require("../controller/notification.ctrl")

exports.GetAllReviewCommentReports = async (param, res) => {
    try {
        var items = await comment.GetAllReviewCommentReports(param.body);

        return res.status(200).json(responseHelper.Success(items));
    } catch (error) {
        return res.status(200).json({
            isSuccess: false,
            message: "There Are Something Wrong in Our System"
        })
    }
}
exports.getAllQuestionCommentReport = async (param, res) => {
    try {
        var items = await comment.getAllQuestionCommentReport(param.body);

        return res.status(200).json(responseHelper.Success(items));
    } catch (error) {
        return res.status(200).json({
            isSuccess: false,
            message: "There Are Something Wrong in Our System"
        })
    }
}

exports.insertQuestionAnswerComment = async (param, res) => {
    try {
        var req = param.body;
        req.userId = param.userId;
        if (req.userId == undefined || req.userId == "") {
            return res.status(200).json({
                isSuccess: false,
                message: "Failed to get profile, please relogin"
            })
        }
        var ins = await comment.insertQuestionAnswerComment(req);
        if (ins.affectedRows > 0) {
            var data = await comment.getQuestionAnswerCommentById({ id: ins.insertId, userId: req.userId });
            notif.notificationQustionComment({
                fromUserId: req.userId,
                questionAnswerId: req.questionAnswerId,
                isAnonymouse: req.isAnonymous
            });
            return res.status(200).json({
                isSuccess: true,
                message: "Success insert data",
                data: data
            })
        }
        else {
            return res.status(200).json({
                isSuccess: false,
                message: "Failed insert data"
            })
        }
    }
    catch (error) {
        return res.status(200).json({
            isSuccess: false,
            message: error.message
        })
    }
}

exports.GetAllComment = async (param, res) => {
    var rtn = {};
    try {
        if (param.userId === undefined || param.userId === '') {
            return res.status(200).json(responseHelper.FailWithMessage("Failed to get profile, please relogin"))
        }
        var req = param.body;
        req.userId = param.userId;
        var items = await comment.GetAllComment(req);
        rtn = {
            data: items,
            total: items.total,
            isSuccess: true,
            message: "Success"
        }
        return res.status(200).json(rtn);
    } catch (error) {
        rtn.isSuccess = false,
            rtn.status = 200;
        rtn.message = "There Are somethign Wrong in Our System" + error
        return res.status(200).json(rtn);
    }
}

exports.countUpvoteQuestionAnswerComment = async (param, res) => {
    try {
        var req = param.body;
        req.userId = param.userId;
        if (req.userId == undefined || req.userId == "") {
            return res.status(200).json({
                isSuccess: false,
                message: "Failed to get profile, please relogin"
            })
        }
        var hasCounted = await comment.isUserhasCountedVote(req);
        if (hasCounted.length > 0) {

            var del = await comment.deleteVotedComment(hasCounted[0].id)
            if(del.affectedRows>0){
                return res.status(200).json({
                    isSuccess: true,
                    message: "Success insert data"
                })
            }
            return res.status(200).json({
                isSuccess: false,
                message: "Failed insert data"
            });
        } else {
            var ins = await comment.countUpvote(req);
            if (ins.affectedRows > 0) {
                return res.status(200).json({
                    isSuccess: true,
                    message: "Success insert data"
                });
            }
            else {
                return res.status(200).json({
                    isSuccess: false,
                    message: "Failed insert data"
                });
            }
        }
    }
    catch (error) {
        return res.status(200).json({
            isSuccess: false,
            message: error
        })
    }

}


exports.disableQuestionComment = async (param, res) => {
    try {

        var ins = await comment.disableQuestionComment(param.body.questionCommentId);
        if (ins.affectedRows > 0) {
            return res.status(200).json(responseHelper.SuccessWithEmptyData());
        }
        return res.status(200).json(responseHelper.FailWithMessage("Failed to disable comment, pelase contact Administrator.!"));
    } catch (error) {
        return res.status(200).json(responseHelper.Fail());
    }
}

exports.getAllCommentWithReported = async (param, res) => {
    try {
        var item = await comment.getAllCommentWithReported(param.body);
        return res.status(200).json(responseHelper.Success(item));
    } catch (error) {
        return res.status(200).json(responseHelper.Fail());
    }
}

exports.enableQuestionComment = async (param, res) => {
    try {
        var ins = await comment.enableQuestionComment(param.body.questionCommentId);
        if (ins.affectedRows > 0) {
            return res.status(200).json(responseHelper.SuccessWithEmptyData());
        }
        return res.status(200).json(responseHelper.FailWithMessage("Failed to enable comment, pelase contact Administrator.!"));
    } catch (error) {
        return res.status(200).json(responseHelper.Fail());
    }
}


exports.reportComment = async (param, res) => {
    try {
        var req = param.body;
        req.userId = param.userId;
        if (req.userId === undefined || req.userId === '') {
            return res.status(401).json(responseHelper.FailWithMessage("Failed to get profile,  please relogin"));
        }
        var ins = await comment.reportComment(req);
        if (ins.affectedRows > 0) {
            return res.status(200).json(responseHelper.SuccessWithEmptyData());
        }
        return res.status(200).json(responseHelper.FailWithMessage("Failed to report comment, please contact Adminsitrator.!"));
    } catch (error) {
        return res.status(200).json(responseHelper.Fail());
    }
}


