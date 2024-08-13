const { dbmysql } = require("../middlewares");
const TableProduct = "questions";
// const TableProductImages = "product_images";
const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);
var mysql = require("mysql");
const { response } = require("express");
const dbConfig = require("../config/db.config");
const { callbackPromise } = require("nodemailer/lib/shared");
const { count } = require("console");

exports.getQuestionById = async (param) => {
  var que = `SELECT *, FindFullpathCategory(categoryId) as categoryPath FROM questions WHERE ID = ${param}`;
  var rows = await query(que);
  return rows;
};

exports.insertQuestion = async (param) => {
  // var que = "INSERT INTO " + TableCategories + " (categoryName,isParent,iconUrl,rowStatus) ";
  var askUserId =
    param.askUserId === undefined || param.askUserid === ""
      ? null
      : param.askUserId;
  var que =
    "INSERT INTO " +
    TableProduct +
    " (userId,categoryId, questionName, description, isAnonymous,rowStatus, askUserId) ";
  que += "VALUES (" + param.userId + "," + param.categoryId + ",";
  que +=
    "'" +
    param.question +
    "', '" +
    param.description +
    "'," +
    param.isAnonymous +
    ",1, " +
    askUserId +
    ")";
  var rows = await query(que);
  return rows;
};

exports.countViews = async (param) => {
  var que = `INSERT INTO question_views (questionId, userId)
                VALUES(${param.id}, ${param.userId})`;
  var rows = await query(que);
  return rows;
};

exports.findCountedViewQuestion = async (param) => {
  var que = `SELECT * FROM question_views
            WHERE questionId = ${param.id} and userId = ${param.userId}`;
  var rows = await query(que);
  return rows;
};

// exports.countViews = async (param) => {
//     var que = "UPDATE " + TableProduct + " SET views = views+1 WHERE id =" + param.id
//     var rows = await query(que);

//     return rows;
// }

exports.searchMatchQuestion = async (param) => {
  if (param.search === undefined) {
    param.search = "";
  }
  var que = `SELECT 
                    DISTINCT
                    questionName as title, categoryName,
                    categories.id as categoryId,
                    questions.id as questionId
                FROM questions
                JOIN categories ON questions.CategoryId = categories.id
                WHERE categories.rowStatus = 1 AND questions.rowStatus = 1 AND questionName LIKE '%${param.search}%'
                LIMIT 5
                `;
  var rows = await query(que);

  return rows;
};

exports.getAllQuestion = async (param) => {
  var que = `SELECT questions.id AS questionId, 
                    questions.questionName as title ,
                    questions.description as content, 
                    IFNULL(countedViews.views, 0 ) as views,
                    questions.isAnonymous, 
                    questions.createdAt,
                    users.name,
                    users.id AS userId,
                    users_details.img_avatar,
                    countAnswer.countedAnswer,
                    categories.id as categoryId,
                    categories.categoryName,
                    !ISNULL(question_follows.id) as isFollowed
                FROM questions
                JOIN categories ON questions.categoryId = categories.id
                LEFT JOIN (
                  SELECT COUNT(id) views, questionId
                  FROM question_views
                  GROUP BY questionId 
                ) countedViews ON questions.id = countedViews.questionId
                LEFT JOIN (
                    SELECT COUNT(id) AS countedAnswer, questionsId FROM question_answers
                    GROUP BY questionsId
                    ) countAnswer ON questions.id =  countAnswer.questionsId
                JOIN users ON questions.userId = users.id
                JOIN users_details ON users_details.userId = users.id
                LEFT JOIN question_follows ON question_follows.questionId = questions.id AND question_follows.userId = ${param.userId} AND  question_follows.rowStatus = 1
                WHERE questions.rowStatus = 1 AND users.isactive = 1 AND users_details.isMute = 0 AND categories.rowStatus = 1`;
  if (param.categoryId != undefined && param.categoryId != "") {
    que += ` AND questions.categoryId = ` + param.categoryId;
  }
  if (param.questionId != undefined && param.questionId != "") {
    que += ` AND questions.id = ` + param.questionId;
  }
  if (param.search != undefined && param.search != "") {
    que += ` AND questions.questionName LIKE '%` + param.search + `%' `;
  }
  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  
  switch (param.order) {
    case "views":
      
      que += " ORDER by views DESC ";
      break;
    case "answers":
      que += " ORDER by countAnswer.countedAnswer DESC ";
      break;
    case "date":
      que += " ORDER by questions.createdAt DESC ";
      break;
  }
  que += " LIMIT " + param.skip + ", " + param.take;
  var rows = await query(que);
  var countRows = await query(queryCount);
  console.log(que)
  rows.total = countRows[0].total;
  return rows;
};

exports.getAllQuestionTitle = async () => {
  var que = `SELECT  
                    DISTINCT
                    questions.questionName as title ,
                    categories.id as categoryId,
                    categories.categoryName
                FROM questions
                JOIN categories ON questions.categoryId = categories.id
                WHERE questions.rowStatus = 1  AND categories.rowStatus = 1`;

  var rows = await query(que);
  return rows;
};
exports.reportQuestion = async (param) => {
  var description = param.description === undefined ? "" : param.description;
  var que = `INSERT INTO questions_report(questionId, userId, description, reportReasonId )
                VALUES(${param.questionId}, ${param.userId}, '${description}', ${param.reportReasonId})`;
  var rows = await query(que);
  return rows;
};

exports.disableQuestion = async (questionId) => {
  var que = `UPDATE questions SET rowStatus = 0 WHERE id = ${questionId}`;
  var rows = await query(que);
  return rows;
};

exports.enableQuestion = async (questionId) => {
  var que = `UPDATE questions SET rowStatus = 1 WHERE id = ${questionId}`;
  var rows = await query(que);
  return rows;
};

exports.getAllReportedQuestion = async (param) => {
  var search = param.search === undefined ? "" : param.search;
  var que = `SELECT DISTINCT 
                    questions.id as questionId,
                    questions.questionName as title,
                    questions.description as questionDescription,
                    categories.id as categoryId,
                    categories.categoryName,
                    users.id as userId,
                    users.name,
                    !ISNULL(questions_report.id) as isReported,
                    (!questions.rowStatus) as isDisabled
                    
                FROM questions
                JOIN categories ON categories.id = questions.categoryId
                JOIN users ON users.id = questions.userId
                LEFT JOIN questions_report ON questions_report.questionId = questions.id 
                WHERE  questions.questionName LIKE '%${search}%' OR questions.description LIKE '%${search}%' 
                        OR categories.categoryName LIKE '%${search}%' OR users.name LIKE '%${search}%'
                `;
  if (param.questionId !== undefined && param.questionId !== "") {
    que += ` AND questions.id = ${param.questionId}`;
  }
  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  que += " LIMIT " + param.skip + ", " + param.take;
  var rows = await query(que);
  var countRows = await query(queryCount);
  rows.total = countRows[0].total;
  return rows;
};

exports.followQuestion = async (param) => {
  var que = `INSERT INTO question_follows(userId, questionId)
                VALUES(${param.userId}, ${param.questionId})
                ON DUPLICATE KEY UPDATE    
                userId=${param.userId}, questionId = ${param.questionId}, rowStatus = 1
                `;
  var rows = await query(que);
  return rows;
};

exports.unfollowQuestion = async (param) => {
  var que = `UPDATE question_follows SET rowStatus = 0 WHERE userId = ${param.userId} AND questionId = ${param.questionId}`;
  var rows = await query(que);
  return rows;
};

exports.getAllQuestionReport = async (param) => {
  var que = `SELECT 
                  questions_report.id as questionsReportId,
                  users.name,
                  questions.id as questionId,
                  report_reasons.reasonName,
                  questions.questionName,
                  categories.categoryName
                FROM questions_report
                JOIN questions ON questions.id = questions_report.questionId
                JOIN categories ON questions.categoryId = categories.id
                JOIN report_reasons ON questions_report.reportReasonId = report_reasons.id
                JOIN users ON questions.userId = users.id
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
