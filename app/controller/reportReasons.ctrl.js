const reportReasons = require("../model/reportReasons");
const responseHelper = require("../helper/response.helper");

exports.GetAllReportReasons = async (param, res) => {

    var rtn = {};
    try {
        var req = param.body;
        req.userId = param.userId
        if (param.userId === undefined || param.userId === '') {
            return res.status(401).json(responseHelper.FailWithMessage("Failed to get profile, please relogin.!"))
        }
        var items = await reportReasons.getAllReasons();
        // rtn = {
        //     data: items,
        //     total: items.total,
        //     isSuccess: true,
        //     message: "Success"
        // }
        return res.status(200).json(responseHelper.Success(items));
    } catch (error) {

        rtn.isSuccess = false;
        rtn.status = 200;
        rtn.message = "There Are somethign Wrong in Our System" + error
        return res.status(200).json(rtn);
    }
}