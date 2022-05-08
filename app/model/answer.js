const { dbmysql } = require("../middlewares");
const TableProduct = "questions_answers";
// const TableProductImages = "product_images";
const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);
var mysql = require("mysql");
const { response } = require("express");
const dbConfig = require("../config/db.config");
const { callbackPromise } = require("nodemailer/lib/shared");
const { count } = require("console");

exports.insertQuestionAnswer = async (param) => {
  var que =
    "INSERT INTO question_answers (description, questionsId, userId, isAnonymous)";
  que +=
    "VALUES('" +
    param.description +
    "', " +
    param.questionId +
    ", " +
    param.userId +
    ", " +
    param.isAnonymous +
    " )";
  console.log(que);
  var rows = await query(que);
  return rows;
};

exports.findViewsQuestionAnswer = async (param) => {
  var que = `SELECT * FROM question_answer_views
                WHERE questionAnswerId = ${param.id} AND userId = ${param.userId}`;
  var rows = await query(que);
  return rows;
};

exports.countViews = async (param) => {
  var que = `INSERT INTO question_answer_views(questionAnswerId, userId)
                VALUES(${param.id}, ${param.userId})`;
  var rows = await query(que);
  return rows;
};

// exports.countViews = async (param) => {
//     var que = "UPDATE question_answers SET views = views+1 WHERE id =" + param.id
//     var rows = await query(que);

//     return rows;
// }

exports.isUserhasCountedvote = async (param) => {
  var que = `SELECT id FROM question_answer_upvotes WHERE userId = ${param.userId} AND questionAnswerId = ${param.id}`;
  var rows = await query(que);
  return rows;
};

exports.deleteCountedVote = async (param) => {
  var que = `DELETE FROM question_answer_upvotes WHERE id = ${param}`;
  var rows = await query(que);
  return rows;
};

exports.countUpvote = async (param) => {
  var que = "INSERT INTO question_answer_upvotes (userId, questionAnswerId) ";
  que += "VALUES(" + param.userId + ", " + param.id + " )";
  console.log(que);
  var rows = await query(que);

  return rows;
};

exports.reportAnswer = async (param) => {
  var description = param.description === undefined ? "" : param.description;
  var que = `INSERT INTO question_answers_report (questionAnswerId, userId, description, reportReasonId )
                VALUES(${param.questionAnswerId}, ${param.userId}, '${description}', ${param.reportReasonId} ) `;
  var rows = await query(que);
  return rows;
};

exports.disableAnswer = async (questionAnswerID) => {
  var que = `UPDATE question_answers SET rowStatus = 0 WHERE id = ${questionAnswerID}`;
  var rows = await query(que);
  return rows;
};

exports.enableAnswer = async (questionAnswerId) => {
  var que = `UPDATE question_answers SET rowStatus = 1 WHERE id = ${questionAnswerId}`;
  var rows = await query(que);
  return rows;
};

exports.GetAllReportedAnswer = async (param) => {
  var search = param.search === undefined ? "" : param.search;
  var que = `SELECT 
                DISTINCT
                question_answers.id as questionAnswerID,
                questions.id as questionId,
                question_answers.description as answerDescription,
                IFNULL(countedViews.views,0) as answerViews,
                questions.questionName as question,
                questions.description as questionDescription,
                users.id as userId,
                users.name as whoAnswer,
                categories.id as categoryId,
                categories.categoryName,
                !ISNULL(question_answers_report.id) isReported,
                (!question_answers.rowStatus) as isDisable
                    
            FROM question_answers
            JOIN questions ON question_answers.questionsId = questions.id
            JOIN users ON users.id = question_answers.userId 
            JOIN categories ON questions.categoryId = categories.id
            LEFT JOIN (SELECT COUNT(id) as views, questionAnswerId 
                    FROM question_answer_views) countedViews ON question_answers.id = countedViews.questionAnswerId
            LEFT JOIN question_answers_report ON question_answers_report.questionAnswerId = question_answers.id
            WHERE 
                   ( question_answers.description LIKE '%${search}%'
                    OR questions.questionName LIKE '%${search}%'
                    OR questions.description  LIKE '%${search}%'
                    OR users.name  LIKE '%${search}%'
                    OR categories.categoryName  LIKE '%${search}%'
                    ) `;
  if (param.questionAnswerId !== undefined && param.questionAnswerId !== "") {
    que += ` AND question_answers.id = ${param.questionAnswerId}`;
  }
  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  que += " LIMIT " + param.skip + ", " + param.take;

  var countRows = await query(queryCount);
  var rows = await query(que);
  rows.total = countRows[0].total;
  // console.log(rows);
  return rows;
};

exports.getAllQuestionAnswer = async (param) => {
  var userIdQuery =
    param.userId === undefined || param.userId === ""
      ? ""
      : `AND question_comment_upvotes.userId = ${param.userId}`;
  var search = param.search === undefined ? "" : param.search;
  // var que = `SELECT question_comments.id, question_comments.comments, question_comments.createdAt, question_comments.questionAnswersId, question_comments.isAnonymous, question_comments.userId, users.name, users_details.img_avatar,
  // IF(questions.userId = users.id, 'Creator', '') AS isCreator,
  // !ISNULL(question_comment_upvotes.id) AS isVoted,
  // voted.countedVote
  // FROM question_comments
  // JOIN users ON question_comments.userId = users.id
  // JOIN users_details ON question_comments.userId = users_details.userId
  // JOIN question_answers ON question_comments.questionAnswersId = question_answers.id
  // JOIN questions ON question_answers.questionsId = questions.id
  // LEFT JOIN question_comment_upvotes ON question_comments.id = question_comment_upvotes.questionCommentId ${userIdQuery}
  // LEFT JOIN (SELECT COUNT(id) AS countedVote, questionCommentId
  //                 FROM question_comment_upvotes
  //                 GROUP BY questionCommentId) AS voted ON question_comments.id = voted.questionCommentId
  // WHERE question_comments.rowStatus = 1`

  var que = `SELECT 
                DISTINCT
                users.id as userId,
                users.name,
                users_details.img_avatar,
                question_answers.id as questionAnswerId,
                IFNULL(countedViews.views,0) as views,
                question_answers.createdAt,
                question_answers.description,
                commented.countedComment,
                voted.countedVote,
                question_answers.questionsId,
                IF(questions.userId = users.id, 'Creator', '') AS isCreator,
                question_answers.isAnonymous,
                users.username,
                !ISNULL(question_answer_upvotes.id) AS isVoted,
                firstComment.id as firstComment_Id,
                firstComment.comments as firstComment_Comment,
                firstComment.createdAt as firstComment_createdAt,
                firstComment.questionAnswersId as firstComment_questionAnswersId,
                firstComment.isAnonymous as firstComment_isAnonymous,
                firstComment.userId as firstComment_userId,
                firstComment.name as firstComment_name,
                firstComment.img_avatar as firstComment_img_avatar,
                firstComment.isCreator as firstComment_isCreator,
                firstComment.isVoted as firstComment_isVoted,
                firstComment.countedVote as firstComment_countedVote
                
            FROM question_answers
            JOIN questions ON question_answers.questionsId = questions.id
            JOIN users ON question_answers.userId = users.id
            JOIN users_details ON users.id = users_details.userId
            LEFT JOIN ( SELECT COUNT(id) views, questionAnswerId
                        FROM question_answer_views
                        GROUP BY questionAnswerId) countedViews ON question_answers.id = countedViews.questionAnswerId
            LEFT JOIN (SELECT COUNT(id) AS countedVote, questionAnswerId 
                    FROM question_answer_upvotes
                    GROUP BY questionAnswerId) AS voted ON question_answers.id = voted.questionAnswerId
            LEFT JOIN question_answer_upvotes  ON question_answer_upvotes.questionAnswerId = question_answers.id AND question_answer_upvotes.userId = ${param.userId}
            LEFT JOIN (SELECT COUNT(question_comments.id) AS countedComment, questionAnswersId 
                    FROM question_comments
                    JOIN users ON question_comments.userId = users.id 
                    JOIN users_details ON question_comments.userId = users_details.userId
                    JOIN question_answers ON question_comments.questionAnswersId = question_answers.id
                    JOIN questions ON question_answers.questionsId = questions.id
                    WHERE question_comments.rowStatus = 1
                    GROUP BY questionAnswersId) as commented ON question_answers.id = commented.questionAnswersId
            LEFT JOIN(
                        SELECT question_comments.id, question_comments.comments, question_comments.createdAt, question_comments.questionAnswersId, question_comments.isAnonymous, question_comments.userId, users.name, users_details.img_avatar, 
                        IF(questions.userId = users.id, 'Creator', '') AS isCreator,
                        !ISNULL(question_comment_upvotes.id) AS isVoted,
                        voted.countedVote
                        FROM question_comments 
                        JOIN(
                            SELECT MAX(question_comments.id) as commentId, MAX(createdAt)
                            FROM question_comments
                            GROUP BY  questionAnswersId
                        ) groupedComment ON question_comments.id = groupedComment.commentId
                        JOIN users ON question_comments.userId = users.id 
                        JOIN users_details ON question_comments.userId = users_details.userId
                        JOIN question_answers ON question_comments.questionAnswersId = question_answers.id
                        JOIN questions ON question_answers.questionsId = questions.id
                        LEFT JOIN question_comment_upvotes ON question_comments.id = question_comment_upvotes.questionCommentId ${userIdQuery}
                        LEFT JOIN (SELECT COUNT(id) AS countedVote, questionCommentId 
                                        FROM question_comment_upvotes
                                        GROUP BY questionCommentId) AS voted ON question_comments.id = voted.questionCommentId
                        WHERE question_comments.rowStatus = 1
            ) AS firstComment ON question_answers.id = firstComment.questionAnswersId
            WHERE 	question_answers.questionsId =  ${param.questionId} AND (question_answers.description LIKE '%${search}%' OR question_answers.id IN ((SELECT distinct questionAnswersId FROM question_comments
                WHERE comments LIKE '%${search}%')) )`;

  if (param.questionAnswerId != "" && param.questionAnswerId != undefined) {
    que += ` AND question_answers.id = ${param.questionAnswerId} `;
  }
  switch (param.order.toLowerCase()) {
    case "date":
      que += " ORDER by question_answers.createdAt DESC ";
      break;
    case "views":
      que += " ORDER by countedViews.views DESC ";
      break;
    case "upvoted":
      que += " ORDER by voted.countedVote DESC ";
      break;

    default:
      que += " ORDER by question_answers.createdAt Desc";
      break;
  }

  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  que += " LIMIT " + param.skip + ", " + param.take;
  // console.log(que);
  var countRows = await query(queryCount);
  var rows = await query(que);
  console.log(que);
  var arrayId = "0";
  var rowsResult = [];
  await rows.forEach((element) => {
    // arrayId += "," + element.id

    child = {
      id: element.firstComment_Id,
      comments: element.firstComment_Comment,
      createdAt: element.firstComment_createdAt,
      questionAnswersId: element.firstComment_questionAnswersId,
      isAnonymous: element.firstComment_isAnonymous,
      userId: element.firstComment_userId,
      name: element.firsctComment_name,
      img_avatar: element.firstComment__img_avatar,
      isCreator: element.firstComment_isCreator,
      isVoted: element.firstComment_isVoted,
      countedVote: element.firstComment_countedVote,
    };
    element["child"] = child;
    console.log(element.userId);
    rowsResult.push({
      userId: element.userId,
      username: element.username,
      name: element.name,
      img_avatar: element.img_avatar,
      questionAnswerId: element.questionAnswerId,
      views: element.views,
      createdAt: element.createdAt,
      description: element.description,
      countedComment: element.countedComment,
      countedVote: element.countedVote,
      questionsId: element.questionsId,
      isCreator: element.isCreator,
      isAnonymous: element.isAnonymous,
      isVoted: element.isVoted,

      child: {
        id: element.firstComment_Id,
        comments: element.firstComment_Comment,
        createdAt: element.firstComment_createdAt,
        questionAnswersId: element.firstComment_questionAnswersId,
        isAnonymous: element.firstComment_isAnonymous,
        userId: element.firstComment_userId,
        name: element.firsctComment_name,
        img_avatar: element.firstComment__img_avatar,
        isCreator: element.firstComment_isCreator,
        isVoted: element.firstComment_isVoted,
        countedVote: element.firstComment_countedVote,
      },
    });
  });
  // queryImage = `SELECT * FROM review_images  WHERE reviewId IN (` + arrayId + `)`

  // var rowImages = await query(queryImage);
  // console.log(rowImages);
  // for (let index = 0; index < rows.length; index++) {
  //     rows[index].images = [];
  //     rowImages.forEach(element => {
  //         if (element.reviewId == rows[index].id) {
  //             rows[index].images.push(element.imageLink);
  //         }
  //     });

  // }
  rowsResult["total"] = countRows[0].total;
  // rows.total = countRows[0].total;
  // console.log(rows);
  return rows;
};

exports.getQuestionDetails = async () => {
  var que = `SELECT 
                DISTINCT
                users.id as userId,
                users.name,
                users_details.img_avatar,
                question_answers.id as questionAnswerId,
                IFNULL(countedViews.views,0) as views,
                question_answers.createdAt,
                question_answers.description,
                commented.countedComment,
                voted.countedVote,
                question_answers.questionsId,
                IF(questions.userId = users.id, 'Creator', '') AS isCreator,
                question_answers.isAnonymous,
                users.username,
                !ISNULL(question_answer_upvotes.id) AS isVoted,
                firstComment.id as firstComment_Id,
                firstComment.comments as firstComment_Comment,
                firstComment.createdAt as firstComment_createdAt,
                firstComment.questionAnswersId as firstComment_questionAnswersId,
                firstComment.isAnonymous as firstComment_isAnonymous,
                firstComment.userId as firstComment_userId,
                firstComment.name as firstComment_name,
                firstComment.img_avatar as firstComment_img_avatar,
                firstComment.isCreator as firstComment_isCreator,
                firstComment.isVoted as firstComment_isVoted,
                firstComment.countedVote as firstComment_countedVote
                
            FROM question_answers
            JOIN questions ON question_answers.questionsId = questions.id
            JOIN users ON question_answers.userId = users.id
            JOIN users_details ON users.id = users_details.userId
            LEFT JOIN ( SELECT COUNT(id) views, questionAnswerId
                        FROM question_answer_views
                        GROUP BY questionAnswerId) countedViews ON question_answers.id = countedViews.questionAnswerId
            LEFT JOIN (SELECT COUNT(id) AS countedVote, questionAnswerId 
                    FROM question_answer_upvotes
                    GROUP BY questionAnswerId) AS voted ON question_answers.id = voted.questionAnswerId
            LEFT JOIN question_answer_upvotes  ON question_answer_upvotes.questionAnswerId = question_answers.id
            LEFT JOIN (SELECT COUNT(question_comments.id) AS countedComment, questionAnswersId 
                    FROM question_comments
                    JOIN users ON question_comments.userId = users.id 
                    JOIN users_details ON question_comments.userId = users_details.userId
                    JOIN question_answers ON question_comments.questionAnswersId = question_answers.id
                    JOIN questions ON question_answers.questionsId = questions.id
                    WHERE question_comments.rowStatus = 1
                    GROUP BY questionAnswersId) as commented ON question_answers.id = commented.questionAnswersId
            LEFT JOIN(
                        SELECT question_comments.id, question_comments.comments, question_comments.createdAt, question_comments.questionAnswersId, question_comments.isAnonymous, question_comments.userId, users.name, users_details.img_avatar, 
                        IF(questions.userId = users.id, 'Creator', '') AS isCreator,
                        !ISNULL(question_comment_upvotes.id) AS isVoted,
                        voted.countedVote
                        FROM question_comments 
                        JOIN(
                            SELECT MAX(question_comments.id) as commentId, MAX(createdAt)
                            FROM question_comments
                            GROUP BY  questionAnswersId
                        ) groupedComment ON question_comments.id = groupedComment.commentId
                        JOIN users ON question_comments.userId = users.id 
                        JOIN users_details ON question_comments.userId = users_details.userId
                        JOIN question_answers ON question_comments.questionAnswersId = question_answers.id
                        JOIN questions ON question_answers.questionsId = questions.id
                        LEFT JOIN question_comment_upvotes ON question_comments.id = question_comment_upvotes.questionCommentId
                        LEFT JOIN (SELECT COUNT(id) AS countedVote, questionCommentId 
                                        FROM question_comment_upvotes
                                        GROUP BY questionCommentId) AS voted ON question_comments.id = voted.questionCommentId
                        WHERE question_comments.rowStatus = 1
            ) AS firstComment ON question_answers.id = firstComment.questionAnswersId`;

  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  // console.log(que);
  var countRows = await query(queryCount);
  var rows = await query(que);
  console.log(que);
  var arrayId = "0";
  var rowsResult = [];
  await rows.forEach((element) => {
    // arrayId += "," + element.id

    child = {
      id: element.firstComment_Id,
      comments: element.firstComment_Comment,
      createdAt: element.firstComment_createdAt,
      questionAnswersId: element.firstComment_questionAnswersId,
      isAnonymous: element.firstComment_isAnonymous,
      userId: element.firstComment_userId,
      name: element.firsctComment_name,
      img_avatar: element.firstComment__img_avatar,
      isCreator: element.firstComment_isCreator,
      isVoted: element.firstComment_isVoted,
      countedVote: element.firstComment_countedVote,
    };
    element["child"] = child;
    console.log(element.userId);
    rowsResult.push({
      userId: element.userId,
      username: element.username,
      name: element.name,
      img_avatar: element.img_avatar,
      questionAnswerId: element.questionAnswerId,
      views: element.views,
      createdAt: element.createdAt,
      description: element.description,
      countedComment: element.countedComment,
      countedVote: element.countedVote,
      questionsId: element.questionsId,
      isCreator: element.isCreator,
      isAnonymous: element.isAnonymous,
      isVoted: element.isVoted,

      child: {
        id: element.firstComment_Id,
        comments: element.firstComment_Comment,
        createdAt: element.firstComment_createdAt,
        questionAnswersId: element.firstComment_questionAnswersId,
        isAnonymous: element.firstComment_isAnonymous,
        userId: element.firstComment_userId,
        name: element.firsctComment_name,
        img_avatar: element.firstComment__img_avatar,
        isCreator: element.firstComment_isCreator,
        isVoted: element.firstComment_isVoted,
        countedVote: element.firstComment_countedVote,
      },
    });
  });

  rowsResult["total"] = countRows[0].total;
  // rows.total = countRows[0].total;
  // console.log(rows);
  return rows;
};

exports.getAnswerById = async (param) => {
  var que = `SELECT question_answers.userId as userId
                , question_answers.description
                ,questions.questionName
                , questions.id as questionId
                ,FindFullpathCategory(questions.categoryId) as categoryPath
                FROM question_answers 
                JOIN questions
                ON question_answers.questionsId = questions.id
                WHERE  question_answers.id = ${param.questionAnswerId}`;
  var rows = await query(que);
  return rows;
};

exports.getAllAnswerReport = async (param) => {
  var que = `SELECT 
                  question_answers_report.id as questionAnswerReportId,
                  users.name,
                  questions.id as questionId,
                  report_reasons.reasonName,
                  questions.questionName,
                  categories.categoryName,
                  question_answers.id as questionAnswersId
                FROM question_answers_report
                JOIN question_answers ON question_answers_report.questionAnswerId = question_answers.id
                JOIN questions ON questions.id = question_answers.questionsId
                JOIN categories ON questions.categoryId = categories.id
                JOIN report_reasons ON question_answers_report.reportReasonId = report_reasons.id
                JOIN users ON question_answers.userId = users.id
                WHERE (questions.questionName LIKE '%${param.search}%' 
                OR report_reasons.reasonName LIKE '%${param.search}%'
                OR categories.categoryName LIKE '%${param.search}%' 
                OR users.name LIKE '%${param.search}%'
                )
                `;
  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  console.log(que);
  que += " LIMIT " + param.skip + ", " + param.take;
  var rows = await query(que);

  var countRows = await query(queryCount);
  rows.total = countRows[0].total;

  return rows;
};
