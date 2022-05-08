"use strict";
const user = require("./app/controller/user.ctrl");
// const videos = require('./app/controller/videos.ctrl');
const category = require("./app/controller/category.ctrl");
// const favorites = require('./app/controller/favorites.ctrl');
const notification = require("./app/controller/notification.ctrl");
// const ticket = require("./app/controller/ticket.ctrl");
const product = require("./app/controller/product.ctrl");
const review = require("./app/controller/review.ctrl");
const question = require("./app/controller/question.ctrl");
const answer = require("./app/controller/answer.ctrl");
const comment = require("./app/controller/comment.ctrl");
const image = require("./app/controller/image.ctrl");
const dLink = require("./app/controller/dynamicLink.ctrl");
const reportReasons = require("./app/controller/reportReasons.ctrl");
const { authJwt, dynamiclink } = require("./app/middlewares");
const fs = require("fs");
const { auth } = require("firebase-admin");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.route("/").get((req, response) => {
    response.writeHead(404, {
      "Content-Type": "text/html",
    });
    fs.readFile("html/index.html", null, function (error, data) {
      if (error) {
        response.writeHead(404);
        respone.write("Whoops! File not found!");
      } else {
        response.write(data);
      }
      response.end();
    });
    // response.write("Ok");
    // response.end();
  });

  //notification
  app.post(
    "/user/getAllNotification",
    [authJwt.isUser],
    notification.getAllNotification
  );
  app.post("/user/markAllAsRead", [authJwt.isUser], notification.markAllAsRead);
  app.post(
    "/user/readNotification",
    [authJwt.isUser],
    notification.readNotification
  );

  //uploadImage
  app.post("/admin/uploadImage", [authJwt.isAdmin], image.uploadImage);

  // Function for Mobile
  app.post("/user/login", user.loginUser);
  app.post("/user/loginSSO", user.loginUserSSO);
  app.post("/user/register", user.registerUser);
  app.post("/user/logout", [authJwt.isUser], user.logoutUser);
  app.post("/user/submitProfile", [authJwt.isUser], user.submitProfile);
  app.post("/user/getUserProfile", [authJwt.isUser], user.getUserProfile);
  app.post("/user/getFollowers", [authJwt.isUser], user.getFollowers);
  app.post("/user/removeFollowers", [authJwt.isUser], user.removeFollowers);
  app.post("/user/getFollowing", [authJwt.isUser], user.getFollowing);
  app.post("/user/forgotPassword", user.forgotPassword);
  app.post("/user/changePassword", [authJwt.isUser], user.changePassword);
  app.post("/user/unfollow", [authJwt.isUser], user.unfollow);
  app.post("/user/getUsers", [authJwt.isUser], user.getUsers);
  app.post("/user/followUser", [authJwt.isUser], user.followUser);
  app.post("/user/notifyUsers", [authJwt.isUser], user.notifyUsers);
  app.post("/user/connectGoogle", [authJwt.isUser], user.connectGoogle);
  app.post("/user/connectFacebook", [authJwt.isUser], user.connectFacebook);

  //Category
  app.post("/admin/insertCategory", [authJwt.isAdmin], category.insertCategory);
  app.post("/admin/updateCategory", [authJwt.isAdmin], category.updateCategory);
  app.post("/admin/deleteCategory", [authJwt.isAdmin], category.deleteCategory);

  app.post(
    "/user/getAllParentCategory",
    [authJwt.isUser],
    category.getAllParentCategory
  );
  app.post(
    "/user/getAllSubCategory",
    [authJwt.isUser],
    category.getAllSubCategory
  );
  app.post(
    "/user/getSubCategoryByParentId",
    [authJwt.isUser],
    category.getSubCategoryByParentId
  );

  // Product
  app.post("/user/insertProduct", [authJwt.isUser], product.insertProduct);
  app.post(
    "/user/countViewProduct",
    [authJwt.isUser],
    product.countViewProduct
  );
  app.post(
    "/user/countUpvoteProduct",
    [authJwt.isUser],
    product.countUpvoteProduct
  );
  app.post("/user/getAllProduct", [authJwt.isUser], product.getAllProduct);
  app.post(
    "/user/uploadProductImages",
    [authJwt.isUser],
    product.uploadProductImages
  );
  app.post("/user/getProductById", [authJwt.isUser], product.getProductbyId);
  app.post("/admin/getProductById", [authJwt.isAdmin], product.getProductbyId);
  app.post(
    "/user/getProductTopImagesById",
    [authJwt.isUser],
    product.getProductTopImagesById
  );
  app.post(
    "/user/getAllImageByProductId",
    [authJwt.isUser],
    product.getAllImageByProductId
  );
  app.post(
    "/user/countProductImageLike",
    [authJwt.isUser],
    product.countProductImageLike
  );
  app.post(
    "/user/countViewProductImage",
    [authJwt.isUser],
    product.countViewProductImage
  );
  app.post(
    "/user/getProductPosted",
    [authJwt.isUser],
    product.getProductPosted
  );
  app.post(
    "/user/getReviewsPosted",
    [authJwt.isUser],
    product.getReviewsPosted
  );
  app.post(
    "/user/getQuestionPosted",
    [authJwt.isUser],
    product.getQuestionPosted
  );
  app.post(
    "/user/getQuestionAnswered",
    [authJwt.isUser],
    product.getQuestionAnswered
  );
  app.post("/user/searchMatchProduct", product.searchMatchProduct);
  app.post("/user/followProduct", [authJwt.isUser], product.followProduct);
  app.post("/user/unfollowProduct", [authJwt.isUser], product.unfollowProduct);
  app.post("/user/reportProduct", [authJwt.isUser], product.reportProduct);
  app.post("/user/getReviewTitles", product.getReviewTitles);

  // product Admin
  app.post("/admin/disableProduct", product.disableProductByAdmin);
  app.post("/admin/enableProduct", product.enableProduct);
  app.post("/admin/getAllReportedProduct", product.getAllReportedProduct);
  app.post(
    "/admin/getAllProductRepots",
    [authJwt.isAdmin],
    product.getAllProductRepots
  );
  app.post(
    "/admin/getAllReviewReports",
    [authJwt.isAdmin],
    review.getAllReviewReports
  );
  app.post(
    "/admin/getAllReviewCommentReports",
    [authJwt.isAdmin],
    comment.GetAllReviewCommentReports
  );

  // Review
  // app.post('/user/insertReview', [authJwt.isUser], review.insertReview);
  app.post(
    "/user/insertReview",
    [authJwt.isUser],
    review.insertReviewWithImages
  );
  app.post("/user/getAllReviewbyProduct", review.getAllReviewbyProduct);
  app.post("/user/countViewReview", [authJwt.isUser], review.countViewReview);
  app.post(
    "/user/countUpvotereview",
    [authJwt.isUser],
    review.countUpvoteReview
  );
  app.post(
    "/user/GetallReviewComments",
    [authJwt.isUser],
    review.GetallReviewComments
  );

  app.post("/user/insertReport", [authJwt.isUser], review.insertReport);
  app.post("/user/insertComment", [authJwt.isUser], review.insertComment);
  app.post(
    "/user/reportReviewComment",
    [authJwt.isUser],
    review.reportReviewComment
  );
  app.post(
    "/user/countViewReviewComment",
    [authJwt.isUser],
    review.countviewComment
  );
  app.post(
    "/user/upvoteReviewComment",
    [authJwt.isUser],
    review.countUpvoteReviewComment
  );

  //Review Admin
  app.post("/admin/getAllReviewReported", review.getAllReviewReported);
  app.post("/admin/disableReview", review.disableReview);
  app.post("/admin/disableReviewComment", review.disableReviewComment);
  app.post("/admin/enableReviewComment", review.enableReviewComment);
  app.post("/admin/enableReview", review.enableReview);
  app.post(
    "/admin/getAllReviewCommentsReported",
    review.getAllReviewCommentsReported
  );
  // Comment

  app.post(
    "/user/insertQuestionAnswerComment",
    [authJwt.isUser],
    comment.insertQuestionAnswerComment
  );
  app.post(
    "/user/countUpvoteQuestionAnswerComment",
    [authJwt.isUser],
    comment.countUpvoteQuestionAnswerComment
  );
  app.post("/user/GetAllComment", [authJwt.isUser], comment.GetAllComment);
  app.post("/user/reportComment", [authJwt.isUser], comment.reportComment);

  app.post(
    "/admin/disableQuestionComment",
    [authJwt.isAdmin],
    comment.disableQuestionComment
  );
  app.post(
    "/admin/enableQuestionComment",
    [authJwt.isAdmin],
    comment.enableQuestionComment
  );
  app.post(
    "/admin/getAllCommentWithReported",
    [authJwt.isAdmin],
    comment.getAllCommentWithReported
  );
  app.post(
    "/admin/getAllQuestionCommentReport",
    [authJwt.isAdmin],
    comment.getAllQuestionCommentReport
  );

  // Question
  app.post("/user/insertQuestion", [authJwt.isUser], question.insertQuestion);
  app.post(
    "/user/countViewQuestion",
    [authJwt.isUser],
    question.countViewQuestion
  );
  app.post("/user/getAllQuestion", [authJwt.isUser], question.getAllQuestion);
  app.post(
    "/user/searchMatchQuestion",
    [authJwt.isUser],
    question.searchMatchQuestion
  );
  app.post("/user/followQuestion", [authJwt.isUser], question.followQuestion);
  app.post(
    "/user/unfollowQuestion",
    [authJwt.isUser],
    question.unfollowQuestion
  );

  app.post("/user/reportQuestion", [authJwt.isUser], question.reportQuestion);

  app.post("/admin/disableQuestion", question.disableQuestion);
  app.post("/admin/getAllReportedQuestion", question.getAllReportedQuestion);
  app.post("/admin/enableQuestion", question.enableQuestion);
  app.post("/user/getAllQuestionTitle", question.getAllQuestionTitle);
  app.post(
    "/admin/getAllQuestionReport",
    [authJwt.isAdmin],
    question.getAllQuestionReport
  );

  // Question Answer
  app.post(
    "/user/insertQuestionAnswer",
    [authJwt.isUser],
    answer.insertQuestionAnswer
  );
  app.post(
    "/user/countViewQuestionAnswer",
    [authJwt.isUser],
    answer.countViewAnswer
  );
  app.post(
    "/user/countUpvoteQuestionAnswer",
    [authJwt.isUser],
    answer.countUpvoteQuestionAnswer
  );
  app.post(
    "/user/getAllQuestionAnswer",
    [authJwt.isUser],
    answer.GetAllQuestionAnswer
  );
  app.post("/user/reportAnswer", [authJwt.isUser], answer.reportAnswer);

  app.post("/user/GetQuestionDetails", answer.GetQuestionDetails);

  app.post("/admin/disableAnswer", answer.disableAnswer);
  app.post("/admin/GetAllReportedAnswer", answer.GetAllReportedAnswer);
  app.post("/admin/enableAnswer", answer.enableAnswer);
  app.post(
    "/admin/getAllAnswerReport",
    [authJwt.isAdmin],
    answer.getAllAnswerReport
  );

  // app.post('/user/actionVidComments', [authJwt.isUser], videos.actionVidComments);
  // Function for Web
  app.post(
    "/user/resetPassword",
    [authJwt.isResetPassword],
    user.resetPassword
  );
  // Merchant

  //report reasons
  app.post(
    "/user/GetAllReportReasons",
    [authJwt.isUser],
    reportReasons.GetAllReportReasons
  );
  // Admin
  app.post("/admin/login", user.loginAdmin);
  app.post("/admin/getAllUsers", [authJwt.isAdmin], user.getAllUsers);
  app.post("/admin/disableUser", [authJwt.isAdmin], user.disableUser);
  app.post("/admin/enableUser", [authJwt.isAdmin], user.enableUser);
  app.post("/admin/register", [authJwt.isAdmin], user.registerAdmin);

  app.post("/user/shareLink", dLink.shareLink);
  app.get("/shareurl/:type/:id", async (req, response) => {
    var prm = req.params;

    var type = prm.type;
    var id = prm.id;
    var agent = req.headers["user-agent"];
    var url = "https://snapnreview.com/";

    if (
      agent.includes("Android") ||
      agent.includes("iPhone") ||
      agent.includes("iPad") ||
      agent.includes("iPod")
    ) {
      url = `snr://app/${type}?id=${id}`;
    }

    response.writeHead(200, {
      "Content-Type": "text/html",
    });
    response.write(
      "<html><head><title>SNR</title></head><body>Redirect to</body><script>location.replace('" +
        url +
        "');</script></html>"
    );
    response.end();
  });
  app.get("/shareurl/:type/:id/:id2", async (req, response) => {
    var prm = req.params;

    var type = prm.type;
    var id = prm.id;
    var id2 = prm.id2;
    var agent = req.headers["user-agent"];
    var url = "https://snapnreview.com/";
    if (agent.includes("Android")) {
      url = `snr://app/${type}?id=${id}&commentid=${id2}`;
    }
    if (
      agent.includes("iPhone") ||
      agent.includes("iPad") ||
      agent.includes("iPod")
    ) {
      url = `snr://app/${type}?id=${id}&&commentid=${id2}`;
    }

    response.writeHead(200, {
      "Content-Type": "text/html",
    });
    response.write(
      "<html><head><title>SNR</title></head><body>Redirect to</body><script>location.replace('" +
        url +
        "');</script></html>"
    );
    response.end();
  });

  app.get("/tes_jwt", [authJwt.isUser], function (req, res) {
    res.json({ message: "Berhasil tes token" });
  });

  app.post("/tesf", function (req, res) {
    console.log(req.headers);
    console.log(req.body);
    return res.json({
      sts: "ok",
    });
  });
};
