const { dbmysql } = require('../middlewares');
const TableProduct = "reviews";

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);


exports.insertReview = async (param) => {
    var que = "INSERT INTO reviews (description, rate, productId, userId, isAnonymous)"
    que += "VALUES('" + param.description + "', " + param.rate + ", " + param.productId + ", " + param.userId + "," + param.isAnonymous + " ) "
    var rows = await query(que);
    return rows;
}

exports.insertReviewImages = async (reviewId, array) => {
    var values = [

    ]
    console.log(array);
    for (let index = 0; index < array.length; index++) {
        values.push([reviewId, array[index]])

    }
    var que = "INSERT INTO review_images (reviewId, imageLink ) VALUES ? ";

    // for (let index = 0; index < array.length; index++) {

    // que += " INSERT INTO product_images (productId, imageLink ) VALUES (1, 'asdasd' )";
    // que += " INSERT INTO product_images (productId, imageLink ) VALUES (1, 'asdasd' )";
    //     // que += "VALUES (" + productId + ", '" + array[index] + "' )";
    //     // que += " "
    // }
    // que += " VALUES (1, 'asdasd' ) ";
    // que += " VALUES (1, 'asdasd' ) ";
    // var que = "INSERT INTO " + TableProductImages + " (productId, imageLink, ) ";
    // que += "VALUES (" + param.productId + "," + param.categoryId + ",";
    // que += "'" + param.productName + "'," + param.isAnonymous + ",1 )";
    console.log(que);
    var response = true;
    var rows = await query(que, [values]);
    console.log(rows);
    return rows;
    // var rows = await query(que);
    // console.log(rows);
}

exports.inserReviewComment = async (param) => {
    var que = `INSERT INTO review_comments (reviewId, comment,  userId)
                VALUES(${param.reviewId}, '${param.comment}',  ${param.userId})`
    var rows = await query(que);
    return rows;
}

exports.getAllReviewbyProduct = async (param) => {

    var que = `SELECT r.id, r.isAnonymous, r.views, IFNULL(reviewVote.voted, 0) as voted, r.description, r.rate, u.name , dtl.img_avatar, r.createdAt, IFNULL(comment.keyword,0) AS searchKeyword, IFNULL(tc.countedComment, 0) as countedComment,
                    u.id as userId
                FROM reviews r
                JOIN users u ON r.userId = u.id
                LEFT JOIN ( SELECT reviewId, COUNT(id) as keyword FROM review_comments WHERE comment LIKE '%${param.search}%' AND rowStatus =1 GROUP BY reviewId) comment ON comment.reviewId = r.id
                JOIN users_details dtl ON dtl.userId = u.id
                LEFT JOIN ( SELECT reviewId, COUNT(id) as voted FROM review_upvotes GROUP BY reviewId) reviewVote ON reviewVote.reviewId = r.id
                LEFT JOIN (
                SELECT reviewId, count(id) as countedComment from review_comments WHERE rowStatus = 1
                GROUP by reviewId
                ) as tc ON tc.reviewId = r.id
              WHERE  r.productId = `+ param.productId + ` AND r.rowStatus = 1 AND u.isactive = 1 AND dtl.isMute = 0  `

    if (param.reviewId !== undefined && param.reviewId != "") {
        que += ` AND r.id = ${param.reviewId}`
    }

    if (param.search != "") {
        que += " AND (comment.keyword >= 1 OR r.description LIKE '%" + param.search + "%' )"
    }

    switch (param.order.toLowerCase()) {
        case "Date":
            que += " ORDER by r.createdAt DESC "
            break;
        case "views":
            que += " ORDER by r.views DESC "
            break;
        case "upvoted":
            que += " ORDER by voted DESC "
            break;

        default:
            que += " ORDER by r.createdAt Desc"
            break;
    }
    console.log(que);
    var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable "
    que += " LIMIT " + param.skip + ", " + param.take;
    // console.log(que);
    var countRows = await query(queryCount);
    var rows = await query(que);
    var arrayId = "0";
    rows.forEach(element => {
        arrayId += "," + element.id
    });
    queryImage = `SELECT * FROM review_images  WHERE reviewId IN (` + arrayId + `)`

    var rowImages = await query(queryImage);
    for (let index = 0; index < rows.length; index++) {
        rows[index].images = [];
        rowImages.forEach(element => {
            if (element.reviewId == rows[index].id) {
                rows[index].images.push(element.imageLink);
            }
        });

    }
    rows.total = countRows[0].total;
    // console.log(rows);
    return rows;
}



exports.countView = async (param) => {
    var que = "UPDATE reviews SET views= views+1 WHERE id =" + param.reviewId;
    var rows = await query(que);
    return rows;
}

exports.countViewComment = async (param) => {
    var que = "UPDATE review_comments SET views= views+1 WHERE id =" + param.commentId;
    var rows = await query(que);
    return rows;
}

exports.countUpvote = async (param) => {

    var que = "INSERT INTO review_upvotes (userId, reviewId) ";
    que += "VALUES(" + param.userId + ", " + param.reviewId + " )"
    console.log(que);
    var rows = await query(que);

    return rows;
}

exports.countUpvoteReviewComment = async (param) => {

    var que = "INSERT INTO review_comments_upvote (userId, reviewCommentId) ";
    que += "VALUES(" + param.userId + ", " + param.reviewCommentId + " )"
    console.log(que);
    var rows = await query(que);

    return rows;
}


exports.isUserhasCountedvote = async (param) => {

    var que = `SELECT id FROM review_upvotes WHERE userId =${param.userId} AND reviewId = ${param.reviewId}`;
    var rows = await query(que);
    return rows;
}


exports.isUserhasCountedvoteReviewComment = async (param) => {

    var que = `SELECT id FROM review_comments_upvote WHERE userId =${param.userId} AND reviewCommentId = ${param.reviewCommentId}`;
    console.log(que);
    var rows = await query(que);
    return rows;
}

exports.GetallReviewComments = async (param) => {
    var que = `SELECT review_comments.id, review_comments.reviewId, voted.countedVote , review_comments.comment,  review_comments.views,  users.id as userId, users.name, 
                users_details.img_avatar, review_comments.createdAt, reviews.description
                FROM review_comments
                JOIN users ON users.id = review_comments.userId
                JOIN users_details ON users.id = users_details.userid
                JOIN reviews ON review_comments.reviewId = reviews.id
                LEFT JOIN (SELECT COUNT(id) AS countedVote, reviewCommentId 
                    FROM review_comments_upvote
                    GROUP BY reviewCommentId) AS voted ON review_comments.id = voted.reviewCommentId
                WHERE review_comments.rowStatus = 1 AND review_comments.reviewId = `+ param.reviewId


    var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";

    que += " LIMIT " + param.skip + ", " + param.take;
    console.log(que);
    var countRows = await query(queryCount);
    var rows = await query(que);
    rows.total = countRows[0].total;
    return rows;
}

exports.insertReport = async (param) => {
    var description = param.description === undefined ? "" : param.description;

    var que = `INSERT INTO reviews_report (reviewId, userId, description, reportReasonId)
                VALUES( ${param.reviewId}, ${param.userId}, '${description}', ${param.reportReasonId})`
    var rows = await query(que);
    return rows;
}


exports.getAllReviewReported = async (param) => {

    var search = param.search === undefined ? "" : param.search;
    var que = `
                SELECT 
                DISTINCT
                reviews.id as reviewId, 
                reviews.description as reviewDescription,
                products.id as productId,
                products.productName as productName,
                categories.id as categoryId,
                categories.categoryName as categoryName,
                users.id as userId,
                users.name,
                !ISNULL(reviews_report.id) as IsReported,
                !reviews.rowStatus as isDisable
            FROM reviews
            JOIN products ON products.id = reviews.productId
            JOIN users ON users.id = reviews.userId
            JOIN categories ON categories.id = products.categoryId
            LEFT JOIN reviews_report ON reviews.id = reviews_report.reviewId
            WHERE products.rowStatus = 1 AND categories.rowStatus = 1 AND ( reviews.description LIKE '%${search}%' OR products.productName LIKE '%${search}%' OR categories.categoryName LIKE '%${search}%') `
    if (param.reviewId !== undefined) {
        que += ` AND reviews.id = ${param.reviewId}`
    }
    var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable "
    que += " LIMIT " + param.skip + ", " + param.take;
    var rows = await query(que);
    var countRows = await query(queryCount);
    rows.total = countRows[0].total;
    return rows;

}

exports.disableReview = async (param) => {
    var que = `UPDATE reviews SET rowStatus = 0  WHERE id = ${param.reviewId} `

    var rows = await query(que);

    return rows;
}

exports.enableReview = async (param) => {
    var que = `UPDATE reviews SET rowStatus = 1  WHERE id = ${param.reviewId} `

    var rows = await query(que);

    return rows;
}

exports.reportReviewComment = async (param) => {
    var description = param.description === undefined ? "" : param.description;
    var que = `INSERT review_comments_report (reviewCommentId, userId, description, reportReasonId)
                VALUES(${param.reviewCommentId}, ${param.userId}, '${description}', ${param.reportReasonId})`

    var rows = await query(que);
    return rows;
}



exports.disableReviewComment = async (param) => {
    var que = `UPDATE review_comments SET rowStatus = 0 WHERE id = ${param.reviewCommentId}`

    var rows = await query(que);

    return rows;
}

exports.enableReviewComment = async (param) => {
    var que = `UPDATE review_comments SET rowStatus = 1 WHERE id = ${param.reviewCommentId}`

    var rows = await query(que);

    return rows;
}



exports.getAllReviewCommentsReported = async (param) => {
    var search = param.search === undefined ? "" : param.search;
    var que = `SELECT 
                review_comments.id as reviewCommentId, 
                review_comments.comment, 
                users.name, 
                users.id as userId,
                !ISNULL(review_comments_report.id) as isReported,
                !review_comments.rowStatus as isDisable,
                reviews.id as reviewId
            FROM review_comments
            JOIN users ON review_comments.userId = users.id
            JOIN reviews ON reviews.id = review_comments.reviewId
            LEFT JOIN review_comments_report ON review_comments.id = review_comments_report.reviewCommentId
            WHERE  (review_comments.comment LIKE '%${search}%' OR users.name LIKE '%${search}%')`

    if (param.reviewCommentId !== undefined && param.reviewCommentId !== "") {
        que += ` AND review_comments.id = ${param.reviewCommentId}`
    }

    var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable "
    que += " LIMIT " + param.skip + ", " + param.take;
    var rows = await query(que);
    var countRows = await query(queryCount);
    rows.total = countRows[0].total;
    return rows;
}

exports.getProductUsingReviewId = async (param) => {
    var que = `SELECT DISTINCT products.*, FindFullpathCategory(products.categoryId) as categoryPath
                FROM reviews 
                JOIN products ON reviews.productId = products.id
                WHERE reviews.id = ${param}`
    var rows = await query(que);
    return rows;
}

exports.getProductAndReviewUsingReviewId = async (param) => {
    var que = `SELECT DISTINCT products.*, FindFullpathCategory(products.categoryId) as categoryPath, reviews.id as reviewId, reviews.userId as reviewUserId
                FROM reviews 
                JOIN products ON reviews.productId = products.id
                WHERE reviews.id = ${param}`
    var rows = await query(que);
    return rows;
}

exports.getAllReviewReports = async (param) => {
    var que = `SELECT 
            reviews_report.id as reviewReportId,
            users.name,
            report_reasons.reasonName,
            products.productName,
            categories.categoryName,
            reviews.id as reviewId
            FROM reviews_report
            JOIN report_reasons ON reviews_report.reportReasonId = report_reasons.id
            JOIN reviews ON reviews_report.reviewId = reviews.id
            JOIN users ON reviews.userId = users.id
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