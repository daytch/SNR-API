const { dbmysql } = require('../middlewares');
// const TableProductImages = "product_images";
const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);
var mysql = require('mysql');
const { response } = require('express');
const dbConfig = require("../config/db.config");
const { callbackPromise } = require('nodemailer/lib/shared');
const { count } = require('console');
const exp = require('constants');


exports.insertQuestionAnswerComment = async (param) => {
    var que = "INSERT INTO question_comments (userId, questionAnswersId, comments, isAnonymous) ";
    que += "VALUES (" + param.userId + "," + param.questionAnswerId + ",'" + param.comments + "', " + param.isAnonymous + " )";
    console.log(que);
    var rows = await query(que);
    console.log(rows);

    return rows;
}

exports.getQuestionAnswerCommentById = async (param) => {
    // var que =`SELECT * FROM  question_comments WHERE id = ${param}`
    var userIdQuery = param.userId === undefined || param.userId === '' ? '' : `AND question_comment_upvotes.userId = ${param.userId}`;
    var que = `SELECT question_comments.id, question_comments.comments, question_comments.createdAt, question_comments.questionAnswersId, question_comments.isAnonymous, question_comments.userId, users.name, users_details.img_avatar, 
    IF(questions.userId = users.id, 'Creator', '') AS isCreator,
    !ISNULL(question_comment_upvotes.id) AS isVoted,
    voted.countedVote
    FROM question_comments 
    JOIN users ON question_comments.userId = users.id 
    JOIN users_details ON question_comments.userId = users_details.userId
    JOIN question_answers ON question_comments.questionAnswersId = question_answers.id
    JOIN questions ON question_answers.questionsId = questions.id
    LEFT JOIN question_comment_upvotes ON question_comments.id = question_comment_upvotes.questionCommentId ${userIdQuery}
    LEFT JOIN (SELECT COUNT(id) AS countedVote, questionCommentId 
                    FROM question_comment_upvotes
                    GROUP BY questionCommentId) AS voted ON question_comments.id = voted.questionCommentId
    WHERE question_comments.id = ${param.id} AND question_comments.rowStatus = 1`
    var rows = await query(que);

    return rows;
}

exports.isUserhasCountedVote = async (param) => {

    var que = `SELECT id FROM question_comment_upvotes WHERE userId =${param.userId} AND questionCommentId = ${param.id}`;
    var rows = await query(que);
    return rows;
}
exports.deleteVotedComment = async (param) => {
    var que = `DELETE FROM question_comment_upvotes WHERE id = ${param}`
    var rows = await query(que);
    return rows;
}

exports.countUpvote = async (param) => {
    var que = "INSERT INTO question_comment_upvotes (userId, questionCommentId)";
    que += "VALUES(" + param.userId + "," + param.id + ")"
    console.log(que);
    var rows = await query(que);
    return rows;
}

exports.disableQuestionComment = async (questionCommentId) => {
    var que = `UPDATE question_comments SET rowStatus = 0 WHERE id = ${questionCommentId}`
    var rows = await query(que);
    return rows;
}

exports.enableQuestionComment = async (questionCommentId) => {
    var que = `UPDATE question_comments SET rowStatus = 1 WHERE id = ${questionCommentId}`
    var rows = await query(que);
    return rows;
}

exports.reportComment = async (param) => {

    var description = param.description === undefined ? "" : param.description;
    var que = `INSERT INTO question_comment_report (questionCommentId, userId, description, reportReasonId)
                VALUES(${param.questionCommentId}, ${param.userId}, '${description}', ${param.reportReasonId}) `
    var rows = await query(que);
    return rows;
}

exports.getAllCommentWithReported = async (param) => {
    que = `SELECT a.id as questionCommentId, a.comments, a.createdAt, a.questionAnswersId, !a.rowStatus as isDisable, a.isAnonymous, b.description, u.id as userId, u.name as user_name, u.username, !ISNULL(c.id) as isReported
            FROM question_comments a
            JOIN question_answers b
            ON a.questionAnswersId = b.id
            JOIN users u
            ON a.userId = u.id
            LEFT JOIN question_comment_report c
            ON a.id = c.questionCommentId
            WHERE a.comments LIKE '%${param.search}%' OR  u.username LIKE '%${param.search}%' OR b.description LIKE '%${param.search}%' `

    var queryCount = `SELECT COUNT(*) as total FROM (` + que + `) countTable`;
    que += " LIMIT " + param.skip + ", " + param.take;
    var countRows = await query(queryCount);
    var rows = await query(que);
    rows.total = countRows[0].total;
    return rows;
}


exports.GetAllComment = async (param) => {

    var userIdQuery = param.userId === undefined || param.userId === '' ? '' : `AND question_comment_upvotes.userId = ${param.userId}`;
    var que = `SELECT question_comments.id, question_comments.comments, question_comments.createdAt, question_comments.questionAnswersId, question_comments.isAnonymous, question_comments.userId, users.name, users_details.img_avatar, 
    IF(questions.userId = users.id, 'Creator', '') AS isCreator,
    !ISNULL(question_comment_upvotes.id) AS isVoted,
    voted.countedVote
    FROM question_comments 
    JOIN users ON question_comments.userId = users.id 
    JOIN users_details ON question_comments.userId = users_details.userId
    JOIN question_answers ON question_comments.questionAnswersId = question_answers.id
    JOIN questions ON question_answers.questionsId = questions.id
    LEFT JOIN question_comment_upvotes ON question_comments.id = question_comment_upvotes.questionCommentId ${userIdQuery}
    LEFT JOIN (SELECT COUNT(id) AS countedVote, questionCommentId 
                    FROM question_comment_upvotes
                    GROUP BY questionCommentId) AS voted ON question_comments.id = voted.questionCommentId
    WHERE question_comments.questionAnswersId = ${param.questionAnswerId} AND question_comments.rowStatus = 1`

    que += ' ORDER BY question_comments.id desc'
    var queryCount = `SELECT COUNT(*) as total FROM ( ${que} LIMIT 18446744073709551610  offset 1) countTable`;
    console.log(queryCount);
    que += " LIMIT " + (param.skip + 1) + ", " + (param.take);

    var countRows = await query(queryCount);
    var rows = await query(que);
    console.log(que);
    rows.total = countRows[0].total;
    return rows;
}

exports.getCommentById = async (param) => {
    var que = `SELECT 
                    question_comments.id as questionCommentId,
                    question_answers.id as questionAnswerId,
                    questions.id as questionId,
                    questions.questionName,
                    FindFullpathCategory(questions.categoryId) as categoryPath
                FROM question_comments
                JOIN question_answers ON question_comments.questionAnswersId
                JOIN questions ON question_answers.questionsId = questions.id
                WHERE question_comments.id = ${param}
    `;
    var rows = await query(que);
    return rows;
}

exports.GetAllReviewCommentReports = async (param) => {
    var que = `SELECT 
            review_comments_report.id as reviewCommentReportId,
            users.name,
            report_reasons.reasonName,
            products.productName,
            categories.categoryName,
            review_comments.id as reviewCommentId
            FROM review_comments_report
            JOIN report_reasons ON review_comments_report.reportReasonId = report_reasons.id
            JOIN review_comments ON review_comments_report.reviewCommentId = review_comments.id
            JOIN reviews ON review_comments.reviewId = reviews.id
            JOIN users ON review_comments.userId = users.id
            JOIN products ON reviews.productId = products.id
            JOIN categories ON products.categoryId = categories.Id
            WHERE (products.productName LIKE '%${param.search}%' 
            OR report_reasons.reasonName LIKE '%${param.search}%'
            OR categories.categoryName LIKE '%${param.search}%' 
            OR users.name LIKE '%${param.search}%'
            )
            `
    var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable "
    console.log(que);
    que += " LIMIT " + param.skip + ", " + param.take;
    var rows = await query(que);

    var countRows = await query(queryCount);
    rows.total = countRows[0].total;

    return rows;
}


exports.getAllQuestionCommentReport = async (param) => {
    var que = `SELECT 
                  question_comment_report.id as questionCommentReportId,
                  users.name,
                  questions.id as questionId,
                  report_reasons.reasonName,
                  questions.questionName,
                  categories.categoryName,
                  question_answers.id as questionAnswersId,
                  question_comments.id as questionCommentId
                FROM question_comment_report
                JOIN question_comments ON question_comment_report.questionCommentId = question_comments.id
                JOIN question_answers ON question_comments.questionAnswersId = question_answers.id
                JOIN questions ON questions.id = question_answers.questionsId
                JOIN categories ON questions.categoryId = categories.id
                JOIN report_reasons ON question_comment_report.reportReasonId = report_reasons.id
                JOIN users ON question_comments.userId = users.id
                WHERE (questions.questionName LIKE '%${param.search}%' 
                OR report_reasons.reasonName LIKE '%${param.search}%'
                OR categories.categoryName LIKE '%${param.search}%' 
                OR users.name LIKE '%${param.search}%'
                )
                `
    var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable "
    console.log(que);
    que += " LIMIT " + param.skip + ", " + param.take;
    var rows = await query(que);
  
    var countRows = await query(queryCount);
    rows.total = countRows[0].total;
  
    return rows;
  }