const notif = require("../model/notification");
const conf_paging = require("../config/paging.config");
const users = require("../model/users");

const { sendNotif } = require("../middlewares");
const moment = require("moment");
const { notification } = require("apn");
const { json } = require("body-parser");
const responseHelper = require("../helper/response.helper");
const { getProductOnlyById, getProductByImageId } = require("../model/product");
const { getQuestionById } = require("../model/question")
const reviews = require("../model/review")
const { sendMail } = require("../middlewares/sendMail");
const { getAnswerById } = require("../model/answer");

// exports.getNotification = async(param, res) => {
//     var req = param.query;
//     var user_id = param.userId;
//     // var page = req.page;

//     // var item_per_page = conf_paging.item_per_page;
//     var data = [];
//     // var offset = (page - 1) * item_per_page;
//     var cntNotif = await notif.getCountRecord("", user_id, "", "");
//     var cnt = 0;
//     for(var c of cntNotif){
//         cnt = c.cnt;
//     }
//     var isNext = false;
//     if(cnt > (page * item_per_page)){
//         isNext = true;
//     }

//     var obj = await notif.getListPaging("",user_id,"","",param.skip,param.take,"");
//     for(let o of obj){
//         var merch_id = "";
//         var img_ava = "";
//         var prm = {
//             userId : "",
//             id : o.pkey
//         }
//         var vids = await videos.getRecord(prm);
//         for(let v of vids){
//             merch_id = v.userId;
//             var usr = await users.getUserDetails(v.userId);
//             for(let u of usr){
//                 img_ava = u.img_avatar;
//             }
//         }
//         var isRead = false;
//         if(o.isRead == 1){
//             isRead = true;
//         }

//         // var mmt = moment(o.createdAt).subtract(8, "h").format("YYYY-MM-DDTHH:mm:ss") + "Z";


//         var dt = {
//             id : o.id,
//             userId : o.userId,
//             videoId : o.pkey,
//             title : o.title,
//             description : o.description,
//             isRead : isRead,
//             createdAt : moment(o.createdAt).subtract(8, "h").format("YYYY-MM-DDTHH:mm:ss") + "Z",
//             merchantId : merch_id,
//             img_thumbnail : img_ava
//         }
//         data.push(dt);
//     }

//     return res.status(200).json({
//         isSuccess : true,
//         total_notif : cnt,
//         message : "Success get notification page " + page,
//         data : data
//     });
// }

exports.notifReadAll = async (param, res) => {
    var req = param.body;
    var user_id = param.userId;
    if (user_id == undefined || user_id == "") {
        return res.status(200).json({
            isSuccess: false,
            message: "Failed to get profile, please relogin"
        })
    }
    var last_id = req.last_id;

    var upd = await notif.updateReadLastId(last_id, user_id, 1);
    if (upd.affectedRows > 0) {
        return res.status(200).json({
            isSuccess: true,
            message: "Success Read all with last id " + last_id
        });
    }
    else {
        return res.status(200).json({
            isSuccess: false,
            message: "Failed Read all with last id " + last_id
        });
    }
}

//Profile
exports.notificationFollowUser = async (param) => {
    try {
        param.type = "Profile-Follows";
        param.pkey = param.userId;
        var currentUser = await users.getUserDetails(param.fromUserId);
        param.isRead = 0;
       
        var lastNotif = await notif.getSpecificNotification(param);
        if (lastNotif.length > 0) {
            param.notifId = lastNotif[0].id;
            if (lastNotif[0].countPeople >= 2) {
                param.countPeople = lastNotif[0].countPeople + 1;
                param.title = currentUser[0].username + ', ' + lastNotif[0].title.split(',')[0] + ' AND ' + (parseInt(lastNotif[0].countPeople) - 1) + ' followed you';
            }
            else {

                param.title = currentUser[0].username + ", " + lastNotif[0].title;
                param.countPeople = lastNotif[0].countPeople + 1;
            }
            var updateLastNotif = await notif.updateNotification(param);
            if (updateLastNotif.affectedRows < 1) {
                throw { message: "failed Update notif" }
            }

        }
        else {

            param.title = currentUser[0].username + " followed you"
            param.categories = "";
            param.countPeople = 1;
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                throw { message: "failed insert notif" };
            }
        }
        var deeplink = "snr://product?product_id=" + param.questionId;
    } catch (error) {
        console.log(error)
    }
}

exports.notificationAddImage = async (param)=>{
    try{
        param.type = "Review-Add_Image"
        param.pkey = param.productId;
        var currentProduct = await getProductOnlyById(param.productId);
        var currentUser = await users.getUserDetails(param.userId);
        var getNotifyUsers = await users.getNotifyUsers(param);
        for (let index = 0; index < getNotifyUsers.length; index++) {
            param.title = (param.isAnonymous?"Anonymous User":currentUser[0].username) + ' added images to your post "' + currentProduct[0].productName + '"';
            param.categories = currentProduct[0].categoryPath;
            param.countPeople = 1;
            param.table = "product";
            param.userId = getNotifyUsers[index].notifyUserId;
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
               
            }

        }

    } catch (error) {
        console.log(error);
    
    }
}

exports.notificationNotifyPostProduct = async (param) => {
    try {
        param.type = "Notify_Me-Post_Product"
        param.pkey = param.productId;
        var currentProduct = await getProductOnlyById(param.productId);
        var currentUser = await users.getUserDetails(param.userId);
        var getNotifyUsers = await users.getNotifyUsers(param);
        param.isRead = 0;
  
        for (let index = 0; index < getNotifyUsers.length; index++) {
            param.title = currentUser[0].username + ' posted a product "' + currentProduct[0].productName + '"';
            param.categories = currentProduct[0].categoryPath;
            param.countPeople = 1;
            param.table = "product";
            param.userId = getNotifyUsers[index].notifyUserId;
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                console.log(message, "failed insert notif");
            }

        }

    } catch (error) {
        console.log(error);
    }
}

exports.notificationNotifyPostReview = async (param) => {
    try {
        param.type = "Notify_Me-New_Review"
        param.pkey = param.productId;
        var currentProduct = await getProductOnlyById(param.productId);
        var currentUser = await users.getUserDetails(param.userId);
        var getNotifyUsers = await users.getNotifyUsers(param);
        param.isRead = 0;
       
        for (let index = 0; index < getNotifyUsers.length; index++) {
            param.title = currentUser[0].username + ' reviewed a product on "' + currentProduct[0].productName + '"';
            param.categories = currentProduct[0].categoryPath;
            param.countPeople = 1;
            param.userId = getNotifyUsers[index].notifyUserId;
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                console.log(message, "failed insert notif");
            }

        }

    } catch (error) {
        console.log(error);
    }
}

exports.notificationNotifyPoestQuestion = async (param) => {
    try {
        param.type = "Notify_Me-New_Question"
        param.pkey = param.questionId;
        var currentQuestion = await getQuestionById(param.questionId);
        var currentUser = await users.getUserDetails(param.userId);
        var getNotifyUsers = await users.getNotifyUsers(param);
        param.isRead = 0;

        for (let index = 0; index < getNotifyUsers.length; index++) {
            param.title = currentUser[0].username + ' asked a question "' + currentQuestion[0].questionName + '"';
            param.categories = currentQuestion[0].categoryPath;
            param.countPeople = 1;
            param.userId = getNotifyUsers[index].notifyUserId;
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                console.log(message, "failed insert notif");
            }

        }

    } catch (error) {
        console.log(error);
    }
}

exports.notificationNotifyPoestAnswer = async (param) => {
    try {
        param.type = "Notify_Me-New_Answer"
        param.pkey = param.questionId;
        var currentQuestion = await getQuestionById(param.questionId);
        var currentUser = await users.getUserDetails(param.userId);
        var getNotifyUsers = await users.getNotifyUsers(param);
        param.isRead = 0;
        console.log(getNotifyUsers.length)
        for (let index = 0; index < getNotifyUsers.length; index++) {
            param.title = currentUser[0].username + ' answered a question on "' + currentQuestion[0].questionName + '"';
            param.categories = currentQuestion[0].categoryPath;
            param.countPeople = 1;
            param.userId = getNotifyUsers[index].notifyUserId;
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                console.log(message, "failed insert notif");
            }

        }

    } catch (error) {
        console.log(error);
    }
}

exports.notificationAskQuestion = async (param) => {
    try {
        param.type = "Notify_Me-Ask"
        param.pkey = param.questionId;
        var currentQuestion = await getQuestionById(param.questionId);
        var currentUser = await users.getUserDetails(param.userId);

        param.isRead = 0;


        param.title = currentUser[0].username + ' asked you a question "' + currentQuestion[0].questionName + '"';
        param.categories = currentQuestion[0].categoryPath;
        param.countPeople = 1;

        var ins = await notif.insertRecord(param);
        // ins.affectedRows = false;
        if (ins.affectedRows < 1) {
            console.log(message, "failed insert notif");
        }



    } catch (error) {
        console.log(error);
    }
}

exports.notificationEnableDisableUser = async (param) => {
    try {
        var emailBody = ``;
         var currentUser = await users.getUserDetails(param.userId);
         console.log(currentUser[0])
        if (!param.isActive) {
            param.type = "Profile-Activate"
            emailBody = 
            `Your profile ${currentUser[0].username} has been disabled, you may want to check our Terms & Conditions.
        
            Please contact EMAIL@DOMAIN.COM for assistance.`
        } else {
            param.type = "Profile-Disabled"
            emailBody=
            `Your profile ${currentUser[0].username} has been enabled again, you may now login back with your account.

            Please always follow our terms & condition for guideline to maintain a healthy account.`
        }
        
        

        sendMail(currentUser[0].email, "Disabled USER", emailBody)
        // ins.affectedRows = false;


    } catch (error) {
        console.log(error);
    }
}
//question notification

exports.notificationWriteQuestionAnswer = async (param) => {
    try {
        param.pkey = param.questionId;
        param.type = 'Question-New_Answer'


        var currentQuestion = await getQuestionById(param.questionId)
        var currentUser = await users.getUserDetails(param.fromUserId);
        param.userId = currentQuestion[0].userId;
        var lastNotif = await notif.getSpecificNotification(param);
        param.isRead = 0;
        if (lastNotif.length > 0) {
            param.notifId = lastNotif[0].id;
            if (lastNotif[0].countPeople >= 2) {
                param.countPeople = lastNotif[0].countPeople + 1;
                param.title = currentUser[0].username + ', ' + lastNotif[0].title.split(',')[0] + ' AND ' + (parseInt(lastNotif[0].countPeople) - 1) + ' others left an answer on your question "' + currentQuestion[0].questionName + '"';
            }
            else {

                param.title = currentUser[0].username + ", " + lastNotif[0].title;
                param.countPeople = lastNotif[0].countPeople + 1;
            }
            var updateLastNotif = await notif.updateNotification(param);
            if (updateLastNotif.affectedRows < 1) {
                throw { message: "failed Update notif" }
            }

        }
        else {

            param.title = currentUser[0].username + " left an answer on your post " + currentQuestion[0].questionName;
            param.categories = currentQuestion[0].categoryPath;
            param.countPeople = 1;
            param.table = "product";
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                throw { message: "failed insert notif" };
            }
        }
        var deeplink = "snr://product?product_id=" + param.questionId;
        // sendNotif.process(currentProduct[0].userId, param.title, param.desc, deeplink);
    } catch (err) {
        console.log(err)
    }
}


exports.notificationDisableQuestion = async (param) => {
    try {
        param.pkey = param.questionId;
        param.type = "Question-Disabled";
        param.description = "";
        param.countPeople = 0;
        param.isRead = 0;
        var currentQuestion = await getQuestionById(param.questionId)
        var currentUser = await users.getUserDetails(currentQuestion[0].userId);
        param.userId = currentUser[0].userId
        param.categories = currentQuestion[0].categoryPath;
        param.questionName = currentQuestion[0].questionName;
        param.table = "question";
        param.title = `Your question on "${param.questionName}" has been removed, you may want to check our Terms & Conditions.`;

        var ins = await notif.insertRecord(param);
        if (ins.affectedRows < 1) {
            throw { message: "failed insert notif" };
        }
        sendMail(currentUser[0].email, "Disable Question", `Your question on "${param.questionName}" has been removed, you may want to check our Terms & Conditions.`)

    } catch (error) {
        console.log(error)
    }
}

exports.notificationQuestionAnswerUpvote = async (param) => {
    try {

        param.type = "Question-Upvote"


        var currentQuestion = await getAnswerById(param);
        param.pkey = currentQuestion[0].questionId;

        var currentUser = await users.getUserDetails(param.fromUserId);
        param.userId = currentUser[0].userId;
        param.isRead = 0;
        var lastNotif = await notif.getSpecificNotification(param);

        if (lastNotif.length > 0) {
            param.notifId = lastNotif[0].id;
            if (lastNotif[0].countPeople >= 2) {
                param.countPeople = lastNotif[0].countPeople + 1;
                param.title = currentUser[0].username + ', ' + lastNotif[0].title.split(',')[0] + ' AND ' + (parseInt(lastNotif[0].countPeople) - 1) + ' upvoted your answer "' + currentQuestion[0].questionName + '"';
            }
            else {

                param.title = currentUser[0].username + ", " + lastNotif[0].title;
                param.countPeople = lastNotif[0].countPeople + 1;
            }
            var updateLastNotif = await notif.updateNotification(param);
            if (updateLastNotif.affectedRows < 1) {
                throw { message: "failed Update notif" }
            }

        }
        else {

            param.title = currentUser[0].username + " upvoted your answer " + currentQuestion[0].questionName;
            param.categories = currentQuestion[0].categoryPath;
            param.countPeople = 1;
            param.table = "question";
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                throw { message: "failed insert notif" };
            }
        }

    } catch (error) {
        console.log(error)
    }
}

exports.notificationQustionComment = async (param) => {
    try {
        param.type = "Question-Answer_Comment"
        console.log("test")
        var currentQuestion = await getAnswerById(param)
        param.pkey = currentQuestion[0].questionId;
        var currentUser = await users.getUserDetails(param.fromUserId);
        param.userId = currentUser[0].userId;
        param.isRead = 0;
        if (param.isAnonymous !== undefined && param.isAnonymous === 1) {
            currentUser[0].username = "Anonymous";
        }
        var lastNotif = await notif.getSpecificNotification(param);
        if (lastNotif.length > 0) {
            param.notifId = lastNotif[0].id;
            if (lastNotif[0].countPeople >= 2) {
                param.countPeople = lastNotif[0].countPeople + 1;
                param.title = currentUser[0].username + ', ' + lastNotif[0].title.split(',')[0] + ' AND ' + (parseInt(lastNotif[0].countPeople) - 1) + ' commented on your answer in "' + currentQuestion[0].questionName + '"';
            }
            else {

                param.title = currentUser[0].username + ", " + lastNotif[0].title;
                param.countPeople = lastNotif[0].countPeople + 1;
            }
            var updateLastNotif = await notif.updateNotification(param);
            if (updateLastNotif.affectedRows < 1) {
                throw { message: "failed Update notif" }
            }

        }
        else {

            param.title = currentUser[0].username + " commented on your answer in " + currentQuestion[0].questionName;
            param.categories = currentQuestion[0].categoryPath;
            param.countPeople = 1;
            param.table = "question";
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                throw { message: "failed insert notif" };
            }
        }
    } catch (error) {
        console.log(error);
    }
}


exports.noticationDisableAnswer = async (param) => {
    try {
        param.type = "Question-Answer_Disabled";

        param.description = "";
        param.countPeople = 0;
        param.isRead = 0;
        var currentQuestion = await getAnswerById(param)
        param.pkey = currentQuestion[0].questionId;
        var currentUser = await users.getUserDetails(currentQuestion[0].userId);
        param.userId = currentUser[0].userId
        param.categories = currentQuestion[0].categoryPath;
        param.questionName = currentQuestion[0].questionName;
        param.table = "question";
        param.title = `Your answer on "${param.questionName}" has been removed, you may want to check our Terms & Conditions.`;

        var ins = await notif.insertRecord(param);
        if (ins.affectedRows < 1) {
            throw { message: "failed insert notif" };
        }
        sendMail(currentUser[0].email, "Answer has been disabled by ADMIN", `Your answer on "${param.questionName}" has been removed, you may want to check our Terms & Conditions.`)


    } catch (error) {
        console.log(error);
    }
}


//reviews notification
exports.notificationWriteReview = async (param) => {

    try {

        param.pkey = param.productId;
        param.type = "Review-Review_Product";

        var currentUser = await users.getUserDetails(param.fromUserId);
        var currentProduct = await getProductOnlyById(param.pkey);
        param.userId = currentProduct[0].userId;
        var lastNotif = await notif.getSpecificNotification(param);
        param.isRead = 0;
        if (lastNotif.length > 0) {
            param.notifId = lastNotif[0].id;
            if (lastNotif[0].countPeople >= 2) {
                param.countPeople = lastNotif[0].countPeople + 1;
                param.title = currentUser[0].username + ', ' + lastNotif[0].title.split(',')[0] + ' AND ' + (parseInt(lastNotif[0].countPeople) - 1) + ' others left a review on your POST "' + currentProduct[0].productName + '"';
            }
            else {

                param.title = currentUser[0].username + ", " + lastNotif[0].title;
                param.countPeople = lastNotif[0].countPeople + 1;
            }
            var updateLastNotif = await notif.updateNotification(param);
            if (updateLastNotif.affectedRows < 1) {
                throw { message: "failed Update notif" }
            }
        }
        else {

            param.title = currentUser[0].username + "left a review on your post " + currentProduct[0].productName;
            param.categories = currentProduct[0].categoryPath;
            param.countPeople = 1;
            param.table = "product";
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                throw { message: "failed insert notif" };
            }
        }

        var deeplink = "snr://product?product_id=" + param.productId;
        // sendNotif.process(currentProduct[0].userId, param.title, param.desc, deeplink);

    }
    catch (error) {
        // return res.status(200).json(responseHelper.Fail());
        throw error;
    }
}





exports.notificationDisableProduct = async (param) => {
    try {
        param.pkey = param.productId;
        param.type = "Review-Review_Disabled";
        param.description = "";
        param.countPeople = 0;
        param.isRead = 0;
        currentProduct = await getProductOnlyById(param.pkey);
        param.userId = currentProduct[0].userId;
        param.categories = currentProduct[0].categoryPath;
        param.productName = currentProduct[0].productName;
        var currentUser = await users.getUserDetails(param.fromUserId)
        param.table = "product";
        param.title = `Your review on post "${param.productName}" has been removed, you may want to check our Terms & Conditions.`;
        var ins = await notif.insertRecord(param);
        if (ins.affectedRows < 1) {
            throw { message: "failed insert notif" };
        }
    } catch (error) {
        console.log(error)
    }
    sendMail(currentUser[0].email, "Review has been disabled by ADMIN", `Your review on post "${param.productName}" has been removed, you may want to check our Terms & Conditions.`)
    // var deepLink = "snr://product?product_id="+param.pkey;
    // sendNotif.process(param.userId, param.title, title, title, deepLink )


}

exports.notificationReviewUpvote = async (param) => {
    try {

        param.type = "Review_Upvote";

        var currentProduct = await reviews.getProductUsingReviewId(param.reviewId);
        param.userId = currentProduct[0].userId;
        param.pkey = currentProduct[0].id;
        var lastNotif = await notif.getSpecificNotification(param);
        var currentUser = await users.getUserDetails(param.fromUserId);
        param.isRead = 0;
        param.description = "";
        if (lastNotif.length > 0) {
            param.notifId = lastNotif[0].id;
            if (lastNotif[0].countPeople >= 2) {
                param.countPeople = lastNotif[0].countPeople + 1;
                param.title = currentUser[0].username + ', ' + lastNotif[0].title.split(',')[0] + ' AND ' + (parseInt(lastNotif[0].countPeople) - 1) + ' upvoted your POST "' + currentProduct[0].productName + '"';
            }
            else {

                param.title = currentUser[0].username + ", " + lastNotif[0].title;
                param.countPeople = lastNotif[0].countPeople + 1;
            }
            var updateLastNotif = await notif.updateNotification(param);
            if (updateLastNotif.affectedRows < 1) {
                throw { message: "failed Update notif" }
            }
        }
        else {

            param.title = `${currentUser[0].username} upvoted your post "${currentProduct[0].productName}".`;
            param.categories = currentProduct[0].categoryPath;
            param.countPeople = 1;
            param.table = "product";
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                throw { message: "failed insert notif" };
            }
        }

        var deeplink = "snr://product?product_id=" + param.productId;
        // sendNotif.process(currentProduct[0].userId, param.title, param.desc, deeplink);

    } catch (error) {
    }
}

exports.notificationReviewComment = async (param) => {
    try {
        param.type = "Review-Review_Comment"

        var currentReview = await reviews.getProductAndReviewUsingReviewId(param.reviewId);
        var currentUser = await users.getUserDetails(param.fromUserId);
        param.pkey = currentReview[0].id;
        param.categories = currentReview[0].categories;
        param.userId = currentReview[0].userId;

        var lastNotif = await notif.getSpecificNotification(param);


        param.isRead = 0;
        param.description = "";
        if (lastNotif.length > 0) {

            param.notifId = lastNotif[0].id;
            if (lastNotif[0].countPeople >= 2) {
                param.countPeople = lastNotif[0].countPeople + 1;
                param.title = currentUser[0].username + ', ' + lastNotif[0].title.split(',')[0] + ' AND ' + (parseInt(lastNotif[0].countPeople) - 1) + ' commented to your Review Post "' + currentReview[0].productName + '"';
            } else {
                param.title = currentUser[0].username + ", " + lastNotif[0].title;
                param.countPeople = lastNotif[0].countPeople + 1;
            }
            var updateLastNotif = await notif.updateNotification(param);
            if (updateLastNotif.affectedRows < 1) {
                throw { message: "failed Update notif" }
            }
        }
        else {

            param.title = `${currentUser[0].username} commented to your Review Post "${currentReview[0].productName}".`;
            param.categories = currentReview[0].categoryPath;
            param.countPeople = 1;
            param.table = "product";
            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                throw { message: "failed insert notif" };
            }
        }
        var deeplink = "snr://product?product_id=" + currentReview.id;
        // sendNotif.process(currentProduct[0].userId, param.title, param.desc, deeplink);
    } catch (error) {
    }
}

exports.notificationLikedImage = async (param) => {

    try {
        param.pkey = param.productId;
        param.type = "Review-Image_liked";

        param.description = "";
        var currentProduct = await getProductByImageId(param.productId);
        param.userId = currentProduct[0].userId;
        var currentUser = await users.getUserDetails(param.fromUserId);
        var lastNotif = await notif.getSpecificNotification(param);

        username = currentUser[0].username == null ? currentUser[0].email : currentUser[0].username;

        param.isRead = 0;
        if (lastNotif.length > 0) {
            param.notifId = lastNotif[0].id;
            if (lastNotif[0].countPeople >= 2) {
                param.countPeople = lastNotif[0].countPeople + 1;
                param.title = username + ', ' + lastNotif[0].title.split(',')[0] + ' AND ' + (parseInt(lastNotif[0].countPeople) - 1) + ' liked your image on "' + currentProduct[0].productName + '"';
            }
            else {
                param.title = username + ", " + lastNotif[0].title;
                param.countPeople = lastNotif[0].countPeople + 1;
            }
            var updateLastNotif = await notif.updateNotification(param);
            if (updateLastNotif.affectedRows < 1) {
                throw { message: "failed update notif" }
            }
        }
        else {

            param.title = username + " liked your image on " + currentProduct[0].productName
            param.table = "product";
            param.categories = currentProduct[0].categoryPath;
            param.countPeople = 1;


            var ins = await notif.insertRecord(param);
            // ins.affectedRows = false;
            if (ins.affectedRows < 1) {
                throw { message: "failed insert notif" };
            }
        }
        // var deeplink = "snr://product?product_id=" + param.body.productId;
        // sendNotif.process(currentProduct[0].userId, param.title, param.desc, deeplink);

    } catch (error) {
    }
}


exports.insertNotificationRare = async (param) => {
    var rtn = 0;

    ins = await notif.insertRecord(param.userId, param.pkey, param.type, param.title, param.desc, 0);

    var deeplink = "";
    if (param.type == "Livestream") {
        deeplink = "pito://video?video_id=" + param.pkey;
    }
    else if (param.type == "Merchant") {
        deeplink = "pito://video?merchant_id=" + param.pkey;
    }

    sendNotif.process(param.userId, param.title, param.desc, deeplink);

    rtn = ins.affectedRows;

    return rtn;
}



exports.getAllNotification = async (param, res) => {
    try {
        var req = param.body;
        req.userId = param.userId;
        if (req.userId === undefined || req.userId === '') {
            return res.status(401).json(responseHelper.FailWithMessage('Failed to get profile, please relogin.!'))
        }
        var item = await notif.getAllNotification(req);
        return res.status(200).json(responseHelper.Success(item));

    } catch (error) {
        return res.status(200).json(responseHelper.Fail())
    }
}

exports.markAllAsRead = async (param, res) => {
    try {

        var req = param.body;
        req.userId = param.userId;
        if (req.userId === undefined || req.userId === '') {
            return res.status(401).json(responseHelper.FailWithMessage('Failed to get profile, please relogin!'));
        }
        var ins = await notif.markAllAsRead(req);
        if (ins.affectedRows > 0) {
            return res.status(200).json(responseHelper.SuccessWithEmptyData());
        }
        return res.status(200).json(responseHelper.FailWithMessage('Failed to mark all as read, please contact administrator.!'))
    } catch (error) {
        return res.status(200).json(responseHelper.Fail());
    }
}

exports.readNotification = async (param, res) => {
    try {
        var req = param.body;
        req.userId = param.userId;
        if (req.userId === undefined || req.userId === '') {
            return res.status(401).json(responseHelper.FailedWithMessage('Failed to get profile, please relogin!'));
        }
        var ins = await notif.readNotification(req);
        if (ins.affectedRows > 0) {
            return res.status(200).json(responseHelper.SuccessWithEmptyData());
        }
        return res.status(200).json(responseHelper.FailWithMessage('Failed to to read notification, please contact administrator.!'))
    } catch (error) {
        return res.status(200).json(responseHelper.Fail());
    }
}