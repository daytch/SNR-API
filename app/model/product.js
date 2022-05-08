const { dbmysql } = require("../middlewares");
const TableProduct = "products";
const TableProductImages = "product_images";

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);
var mysql = require("mysql");
const { response } = require("express");
const dbConfig = require("../config/db.config");
const { callbackPromise } = require("nodemailer/lib/shared");
const { count } = require("console");
var connection = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  // host: "5.189.134.84",
  // user : "root",
  // password: "Insy4AllahB3rk4H!!!",
  database: dbConfig.database,
});

exports.createProduct = async (param) => {
  // var que = "INSERT INTO " + TableCategories + " (categoryName,isParent,iconUrl,rowStatus) ";
  var que =
    "INSERT INTO " +
    TableProduct +
    " (userId,categoryId, productName, isAnonymous,rowStatus) ";
  que += "VALUES (" + param.userId + "," + param.categoryId + ",";
  que += "'" + param.productName + "'," + param.isAnonymous + ",1 )";
  console.log(que);
  var rows = await query(que);
  console.log(rows);
  return rows;
};

exports.countViews = async (param) => {
  // var que =
  //   "UPDATE " + TableProduct + " SET views = views+1 WHERE id =" + param.id;
  // var rows = await query(que);

  var que = `INSERT INTO product_views (productId, userId)
              VALUES (${param.id}, ${param.userId})`;

  var rows = await query(que);
  return rows;
};

exports.findCountViews = async (param) => {
  var que = `SELECT * FROM product_views
              WHERE productId = ${param.id} AND userId = ${param.userId}`;
  var rows = await query(que);
  console.log(que);
  return rows;
};

exports.findCountViewsProductImage = async (param) => {
  var que = `SELECT * FROM product_image_views
            WHERE productImageId = ${param.id} AND userId = ${param.userId}`;
  var rows = await query(que);
  return rows;
};

exports.countViewProductImage = async (param) => {
  var que = `INSERT INTO product_image_views(productImageId, userId)
              VALUES(${param.id}, ${param.userId})`;
  var rows = await query(que);
  return rows;
};

// exports.countViewProductImage = async (param) => {
//   var que = "UPDATE product_images SET views = views+1 WHERE id = " + param.id;
//   var rows = await query(que);
//   return rows;
// };

exports.countUpvote = async (param) => {
  var que = "INSERT INTO product_upvotes (userId, productId) ";
  que += "VALUES(" + param.userId + ", " + param.productId + " )";
  console.log(que);
  var rows = await query(que);

  return rows;
};

exports.deleteUpVote = async (param) =>{
  var que = `DELETE FROM product_upvotes WHERE id = ${param}`
  var rows = await query(que)

  return rows;
}

exports.isUserhasCountedvote = async (param) => {
  var que = `SELECT id FROM product_upvotes WHERE userId = ${param.userId} AND productId = ${param.productId}`;
  var rows = await query(que);
  return rows;
};

exports.countProductImageLike = async (param) => {
  console.log(param);
  var que =
    `INSERT INTO product_image_likes (userId, productImageId)
                VALUES (` +
    param.userId +
    `, ` +
    param.productId +
    `)`;
  console.log(que);
  var rows = await query(que);

  return rows;
};

exports.discountProductImageLike = async (param) => {
  var que = `DELETE FROM product_image_likes WHERE productImageId = ${param.productId} AND userId = ${param.userId}`;

  console.log(que);
  var rows = await query(que);

  return rows;
};

exports.isUserHasCountedProductImageLike = async (param) => {
  var que =
    "SELECT id FROM product_image_likes WHERE userId =" +
    param.userId +
    " AND productImageId = " +
    param.productId;
  console.log(que);
  var rows = await query(que);
  return rows;
};

exports.deleteProductImageLike = async(param)=>{
  var que = `DELETE FROM product_image_likes WHERE id = ${param}`
  var rows = await query(que);
  return rows;
}

exports.getAllProduct = async (param) => {
  var que = `SELECT
    pro.id ,
    pro.categoryId,
    pro.productName AS title,
    IFNULL(productVote.voted, 0) AS voted,
    IFNULL(countedViews.views, 0) AS views,
    pro.createdAt,
    pro.isAnonymous,
    cat.categoryName,
    usr.name,
    usrdetail.img_avatar,
    productRate.rate AS aveRating,
    productRate.countedRate AS rating,
    productLiked.imageLink AS image,
    IFNULL(countedReview.countReview, 0) AS countReview
  FROM
    products pro
    JOIN users usr ON pro.userId = usr.id
    JOIN users_details usrdetail ON usrdetail.userId = usr.id 
    JOIN categories cat ON pro.categoryId = cat.id
    LEFT JOIN( SELECT COUNT(id) views, productId
              FROM product_views
              GROUP BY productId) countedViews ON pro.id = countedViews.productId
    LEFT JOIN (
      SELECT COUNT(id) as countReview, productId
      FROM reviews  WHERE rowStatus = 1
      GROUP BY productId
      )countedReview ON countedReview.productId = pro.id
    LEFT JOIN (
      SELECT
        product.id,
        rate,
        countedRate,
        createdAt
      FROM
        products
        JOIN (
          SELECT
            product.id,
            AVG(reviews.rate) AS rate,
            COUNT(reviews.rate) AS countedRate
          FROM
            products product
            JOIN reviews ON product.id = reviews.productId
          GROUP BY
            id
        ) product ON products.id = product.id
    ) productRate ON productRate.id = pro.id
    LEFT JOIN (
      SELECT
        productId,
        COUNT(id) AS voted
      FROM
        product_upvotes
      GROUP BY
        productId
    ) productVote ON productVote.productId = pro.id
    LEFT JOIN (SELECT
       proImages.productId,
        imageLink,
        createdAt
      FROM
        product_images proImages
        JOIN (
          SELECT
           MAX(product_images.id) as id,
            MAX(IFNULL(liked, 0)) AS liked
          FROM
            product_images
            LEFT JOIN (
              SELECT
                productImageId,
                COUNT(id) AS liked
              FROM
                product_image_likes
              GROUP BY
                productImageId
            ) imageLiked ON imageLiked.productImageId = product_images.id
          group BY product_images.productId
          ORDER BY
            liked DESC
            
          
        ) productLiked ON productLiked.id = proImages.id
    ) productLiked ON productLiked.productId = pro.id `;
  que +=
    "WHERE pro.rowStatus = 1 AND usr.isactive = 1 AND usrdetail.isMute = 0 ";
  console.log(que);
  if (
    param.categoryId != undefined &&
    param.categoryId != "" &&
    param.categoryId != undefined
  ) {
    que += "AND pro.categoryId = " + param.categoryId;
  }
  if (param.search != undefined && param.search != "") {
    que += " AND pro.productName LIKE '%" + param.search + "%'";
  }
  switch (param.order.toLowerCase()) {
    case "reviews":
      que += " ORDER by countReview DESC ";
      break;
    case "image":
      que += " ORDER by productLiked.createdAt DESC ";
      break;
    case "upvoted":
      que += " ORDER by productRate.rate DESC ";
      break;
    case "views":
      que += " ORDER by Views DESC ";
      break;
    case "Date":
      que += " ORDER by productRate.createdAt DESC ";
      break;
    default:
      break;
  }

  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  que += " LIMIT " + param.skip + ", " + param.take;

  console.log(que);
  var countRows = await query(queryCount);

  var rows = await query(que);

  console.log(countRows);
  rows.total = countRows[0].total;
  console.log(rows);
  return rows;
};

exports.insertProductImages = async (productId, array, isAnonymous) => {
  var values = [];
  for (let index = 0; index < array.length; index++) {
    values.push([productId, array[index], isAnonymous]);
  }
  console.log(values);
  var que =
    "INSERT INTO product_images (productId, imageLink, isAnonymous ) VALUES ? ";

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
};

exports.getProductById = async (param) => {
  var que =
    "SELECT \n" +
    "pro.id as productId, \n" +
    "!pro.rowStatus as isDisable, \n" +
    "	pro.productName as title,\n" +
    "    pro.isAnonymous,\n" +
    "    IFNULL(countedViews.views,0) as views ,\n" +
    "    pro.createdAt,\n" +
    "    usr.name,\n" +
    "    usr.username,\n" +
    "    usr.id as userId,\n" +
    "    usrdetail.img_avatar,\n" +
    "	productRate.rate as aveRating, \n" +
    "    productRate.countedRate as rating,\n" +
    "pro.categoryId, \n " +
    "!ISNULL(pf.id) as isFollowed, \n " +
    "(SELECT FindFullpathCategory(pro.categoryId)) as categoryName \n " +
    "FROM products pro\n" +
    "JOIN users usr ON pro.userId = usr.id\n" +
    "LEFT JOIN (SELECT COUNT(id) as views, productId FROM product_views GROUP BY productId)\n" +
    " countedViews ON pro.id = countedViews.productId \n" +
    "LEFT JOIN product_follows pf ON pro.id = pf.productId AND pf.rowStatus = 1 AND pf.userId =" +
    param.userId +
    " \n" +
    "JOIN categories cat ON pro.categoryId = cat.id\n" +
    "LEFT JOIN users_details usrdetail ON usr.id = usrdetail.userId\n" +
    "LEFT JOIN (\n" +
    "    SELECT \n" +
    "      product.id, \n" +
    "      rate, \n" +
    "      countedRate, \n" +
    "      createdAt \n" +
    "    FROM \n" +
    "      products \n" +
    "      JOIN (\n" +
    "        SELECT \n" +
    "          product.id, \n" +
    "          AVG(reviews.rate) as rate, \n" +
    "          COUNT(reviews.rate) as countedRate \n" +
    "        FROM \n" +
    "          products product \n" +
    "          JOIN reviews ON product.id = reviews.productId \n" +
    "        GROUP BY \n" +
    "          id\n" +
    "      ) product ON products.id = product.id\n" +
    "  ) productRate ON productRate.id = pro.id \n" +
    "\n" +
    "WHERE pro.id = " +
    param.id;
  console.log(que);
  var rows = await query(que);
  return rows;
};

exports.getProductOnlyById = async (id) => {
  var que = `SELECT *,FindFullpathCategory(categoryId) as categoryPath FROM products WHERE id = ${id}`;
  var rows = await query(que);

  return rows;
};

exports.getProductTopImagesById = async (param) => {
  var que =
    `SELECT proImages.id,
     proImages.productId, 
     proImages.imageLink, 
     proImages.createdAt, 
     proImages.modifiedAt, 
     proImages.isAnonymous, 
     productLiked.liked,
     IFNULL(countedViews.views, 0) as views
      
    FROM product_images proImages 
                JOIN (
                    SELECT 
                         product_images.id, 
                           IFNULL(liked, 0) AS liked 
                         FROM 
                           product_images 
                           LEFT JOIN (
                             SELECT 
                               productImageId, 
                               COUNT(id) AS liked 
                             FROM 
                               product_image_likes 
                             GROUP BY 
                               productImageId
                           ) imageLiked ON imageLiked.productImageId = product_images.id 
                         ORDER BY 
                           liked
                       ) productLiked ON productLiked.id = proImages.id
                LEFT JOIN (SELECT COUNT(id) views, productImageId
                            FROM product_image_views
                            GROUP BY productImageId) countedViews ON proImages.id = countedViews.productImageId
                WHERE productId = ` +
    param.id +
    `
                ORDER BY liked DESC
                LIMIT 4`;
  console.log(que);
  var rows = await query(que);

  var queryCount =
    `SELECT count(*) as total FROM product_images
                        WHERE productId = ` + param.id;
  var countRows = await query(queryCount);
  surplusImges = countRows[0].total - 4;
  rows.surplusImages = surplusImges > 0 ? countRows[0].total - 4 : 0;
  rows.total = countRows[0].total;
  return rows;
};

exports.getAllImageByProductId = async (param) => {
  var que =
    `SELECT proImages.Id,
                imageLink,
                  
                    IFNULL(countedViews.views, 0) as views,
                    productLiked.liked,
                    products.productName,
                    proImages.productId,
                    users.name,
                    users_details.img_avatar ,
                users.id as userId,
                    proImages.createdAt,
                    proImages.isAnonymous,
                    !ISNULL(product_image_likes.id) as isLiked
            FROM product_images proImages 
            JOIN (
                SELECT 
                    product_images.id, 
                    IFNULL(liked, 0) AS liked 
                    FROM 
                    product_images 
                    LEFT JOIN (
                        SELECT 
                        productImageId, 
                        COUNT(id) AS liked 
                        FROM 
                        product_image_likes 
                        GROUP BY 
                        productImageId
                    ) imageLiked ON imageLiked.productImageId = product_images.id 
                    ORDER BY 
                    liked
                ) productLiked ON productLiked.id = proImages.id
            LEFT JOIN ( SELECT COUNT(id) views, productImageId
                      FROM product_image_views
                      GROUP BY productImageId) countedViews ON proImages.id = countedViews.productImageId
            LEFT JOIN product_image_likes ON proImages.id = product_image_likes.productImageId AND product_image_likes.userId = ${param.userId}
            JOIN products ON products.id = proImages.productId
            JOIN users ON products.userId = users.Id
            JOIN users_details ON users.Id = users_details.userId
                WHERE productId = ` + param.productId;

  switch (param.order) {
    case "views":
      que += " ORDER by views DESC ";
      break;
    case "liked":
      que += " ORDER by liked DESC ";
      break;
    case "date":
      que += " ORDER by createdAt DESC ";
      break;

    default:
      que += " ORDER by liked DESC ";
      break;
  }
  console.log(que);
  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  que += " LIMIT " + param.skip + ", " + param.take;
  var countRows = await query(queryCount);

  var rows = await query(que);
  console.log("test");
  rows.total = countRows[0].total;

  return rows;
};

exports.getProductPosted = async (param) => {
  // var que = `SELECT
  // products.id,
  //   productName,
  //   IFNULL(views, 0) as views,
  //   IFNULL(avgRated,0) as avgRated,
  //   IFNULL(countedReview,0) as countedReview,
  //   (SELECT FindFullpathCategory(categories.id) ) as categoryPath,
  //   IFNULL(imageLink,'') as imageLink
  // FROM products
  // JOIN categories
  // ON	products.categoryId = categories.id
  // LEFT JOIN 	(SELECT productId,
  //       AVG(rate) as avgRated,
  //               COUNT(productId) as countedReview
  //     FROM reviews
  //           WHERE reviews.rowStatus = 1
  //     GROUP By ProductId) rated
  // ON		rated.productId = products.id
  // LEFT JOIN	(SELECT max(id) as imageId,
  //       imageLink,
  //               MAX(views) imageViews,
  //               product_images.productId
  //     FROM product_images
  //     GROUP BY productId
  //     HAVING MAX(views) ) image
  // ON		products.id = image.productId
  // WHERE categories.rowStatus = 1 AND products.rowStatus = 1  AND userId = `+ param.userId
  var que =
    `SELECT
              products.id,
                productName,
                IFNULL(countedViews.views, 0) as views,
                IFNULL(avgRated,0) as avgRated,
                IFNULL(countedReview,0) as countedReview,
                (SELECT FindFullpathCategory(categories.id) ) as categoryPath,
                IFNULL(imageLink,'') as imageLink
              FROM products
              JOIN categories 
              ON	products.categoryId = categories.id
              LEFT JOIN ( SELECT COUNT(id) views, productId
                          FROM product_views
                          GROUP BY productId) countedViews ON products.id = countedViews.productId
              LEFT JOIN 	(SELECT productId, 
                    AVG(rate) as avgRated,
                            COUNT(productId) as countedReview 
                  FROM reviews
                        WHERE reviews.rowStatus = 1
                  GROUP By ProductId) rated 
              ON		rated.productId = products.id
              LEFT JOIN	(SELECT max(id) as imageId, 
                    imageLink, 
                            MAX(views) imageViews,
                            product_images.productId
                  FROM product_images
                  GROUP BY productId) image
              ON		products.id = image.productId
              WHERE categories.rowStatus = 1 AND products.rowStatus = 1  AND userId = ` +
    param.userId;

  if (param.search != undefined && param.search != "") {
    que += " AND products.productName LIKE '%" + param.search + "%'";
  }
  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  que += " LIMIT " + param.skip + ", " + param.take;

  console.log(que);
  var countRows = await query(queryCount);

  var rows = await query(que);

  // console.log(countRows);
  rows.total = countRows[0].total;
  // console.log(rows);
  return rows;
};

exports.getReviewsPosted = async (param) => {
  var que =
    `SELECT products.productName,
                    reviews.id as reviewId,
                      reviews.description,
                      IFNULL(countedViews.views, 0) as views,
                      reviews.createdAt,
                      (SELECT FindFullpathCategory(products.categoryId)) as categoryName,
                      users_details.img_avatar,
                      users.name,
                      reviews.rate,
                      images.images,
                      users.id as userId
                  FROM  reviews
                  JOIN products ON reviews.productId = products.id
                  JOIN users ON reviews.userId = users.id
                  JOIN users_details ON users_details.userId = users.id
                  LEFT JOIN(SELECT COUNT(ID) views, reviewId
                            FROM review_views
                            GROUP BY reviewId) countedViews ON reviews.id = countedViews.reviewId
                  LEFT JOIN (SELECT  reviewId,
                          group_concat(imageLink) as images
                      FROM review_images 
                      GROUP By reviewId) images ON reviews.id =  images.reviewId
                  WHERE users_details.isMute = 0 AND reviews.rowStatus = 1 AND products.rowStatus = 1 AND users.id = ` +
    param.userId;
  if (param.search !== "" && param.search !== undefined) {
    que += ` AND ( products.productName LIKE '%${param.search}%' OR reviews.description LIKE '%${param.search}%'

    )`;
  }
  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  que += " LIMIT " + param.skip + ", " + param.take;

  var countRows = await query(queryCount);

  var rows = await query(que);
  var arrayId = "0";
  rows.forEach((element) => {
    arrayId += "," + element.reviewId;
  });
  queryImage =
    `SELECT * FROM review_images  WHERE reviewId IN (` + arrayId + `)`;
  // console.log(queryImage);
  var rowImages = await query(queryImage);

  for (let index = 0; index < rows.length; index++) {
    rows[index].images = [];
    rowImages.forEach((element) => {
      if (element.reviewId == rows[index].reviewId) {
        rows[index].images.push(element.imageLink);
      }
    });
  }

  rows.total = countRows[0].total;

  return rows;
};

exports.getReviewTitles = async () => {
  var que = `SELECT 
                  DISTINCT
                  products.productName,
                  categories.id as categoryId,
                  categories.categoryName
                  FROM  products
                  JOIN categories ON categories.id = products.categoryId
                  JOIN users ON products.userId = users.id
                  JOIN users_details ON users_details.userId = users.id
                  WHERE users_details.isMute = 0 AND products.rowStatus = 1 AND categories.rowStatus = 1 `;

  // var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable "
  // que += " LIMIT " + param.skip + ", " + param.take;

  var rows = await query(que);

  // console.log(countRows);

  // console.log(rows);
  return rows;
};

// exports.getReviewsPosted = async (param) => {
//   var que = `SELECT products.productName,
//                     reviews.id as reviewId,
//                       reviews.description,
//                       reviews.views,
//                       reviews.createdAt,
//                       (SELECT FindFullpathCategory(products.categoryId)) as categoryName,
//                       users_details.img_avatar,
//                       users.name,
//                       reviews.rate,
//                       images.images,
//                       users.id as userId
//                   FROM  reviews
//                   JOIN products ON reviews.productId = products.id
//                   JOIN users ON reviews.userId = users.id
//                   JOIN users_details ON users_details.userId = users.id
//                   LEFT JOIN (SELECT  reviewId,
//                           group_concat(imageLink) as images
//                       FROM review_images
//                       GROUP By reviewId) images ON reviews.id =  images.reviewId
//                   WHERE users_details.isMute = 0 AND reviews.rowStatus = 1 AND products.rowStatus = 1 AND users.id = `+ param.userId;

//   var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable "
//   que += " LIMIT " + param.skip + ", " + param.take;

//   console.log(que);
//   var countRows = await query(queryCount);

//   var rows = await query(que);

//   // console.log(countRows);
//   rows.total = countRows[0].total;
//   // console.log(rows);
//   return rows;

// }

exports.getQuestionPosted = async (param) => {
  var search = param.search === undefined ? "" : param.search;
  var que = `SELECT 
                    DISTINCT
                    questions.id as questionId,
                    questions.questionName as title,
                    questions.description,
                        IFNULL(countedViews.views, 0) as views,
                        IFNULL(countAnswer.countedAnswer,0) as countedAnswer,
                        users.id as userId,
                        categories.id as categoryId,
                        categories.categoryName
                  FROM questions
                  JOIN users ON questions.userId = users.id
                  LEFT JOIN (SELECT COUNT(ID) views, questionId
                              FROM question_views
                              GROUP BY questionId) countedViews ON questions.id = countedViews.questionId
                  LEFT JOIN (
                    SELECT COUNT(id) AS countedAnswer, questionsId FROM question_answers
                    GROUP BY questionsId
             ) countAnswer ON questions.id =   countAnswer.questionsId
                  JOIN categories ON questions.categoryId = categories.id
                 
                  JOIN users_details ON users.id = users_details.userId
                  WHERE users.isactive = 1 AND users_details.isMute = 0  AND questions.rowStatus = 1 AND users.id = ${param.userId}
                  AND questions.questionName LIKE '%${search}%'`;
  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  que += " ORDER BY questions.createdAt DESC ";
  que += " LIMIT " + param.skip + ", " + param.take;
  console.log(que);
  var countRows = await query(queryCount);

  var rows = await query(que);
  console.log(que);
  // console.log(countRows);
  rows.total = countRows[0].total;
  // console.log(rows);
  return rows;
};

exports.getQuestionAnswered = async (param) => {
  var que =
    `SELECT DISTINCT
              question_answers.description as answerDescription,
                  question_answers.createdAt,
                  users.name,
                  users.id as userId,
                  questions.questionName,
                  users_details.img_avatar,
                  questions.id as questionId,
                  question_answers.id as questionAnswerId,
                  IFNULL(countedViews.views,0) AS views
            FROM question_answers
            JOIN users ON question_answers.userId = users.id
            JOIN questions on question_answers.questionsId = questions.id
            JOIN users_details ON users.id = users_details.userId
            LEFT JOIN (SELECT (ID) views, questionAnswerId
                      FROM question_answer_views
                      GROUP BY questionAnswerId) countedViews ON question_answers.id = countedViews.questionAnswerId
            WHERE users.isactive = 1 AND users_details.isMute = 0 AND questions.rowStatus = 1 AND question_answers.rowStatus = 1
            AND users.id = ` + param.userId;
  if (param.search !== "" && param.search !== undefined) {
    que += ` AND (users.name LIKE '%${param.search}%' OR questions.questionName LIKE '%${param.search}%' OR question_answers.description LIKE '%${param.search}%')`;
  }
  que += " ORDER BY question_answers.createdAt DESC ";
  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  que += " LIMIT " + param.skip + ", " + param.take;
  console.log(que);
  var countRows = await query(queryCount);

  var rows = await query(que);

  rows.total = countRows[0].total;
  return rows;
};

exports.searchMatchProduct = async (param) => {
  if (param.search === undefined) {
    param.search = "";
  }

  var que = `SELECT 
	             DISTINCT productName, categoryId, categoryName
              FROM products
              JOIN categories ON products.categoryId = categories.Id
              WHERE categories.rowStatus = 1 AND products.rowStatus = 1 AND  products.productName LIKE'%${param.search}%'
              LIMIT 5
            `;
  var rows = await query(que);
  console.log(que);
  return rows;
};

exports.disableProduct = async (param) => {
  var que = `UPDATE products SET rowStatus = 0 WHERE id = ${param} `;
  var rows = await query(que);

  return rows;
};

exports.enableProduct = async (param) => {
  var que = `UPDATE products SET rowStatus = 1 WHERE id = ${param} `;
  var rows = await query(que);

  return rows;
};

exports.getUserByProductId = async (param) => {
  var que = `SELECT 
                *
              FROM users JOIN products ON users.id = products.userId
              WHERE products.id = ${param.productId}
            `;
  var rows = await query(que);
  console.log(que);
  return rows;
};

exports.getProductByImageId = async (param) => {
  var que = `SELECT *, FindFullpathCategory(p.categoryId) as categoryPath from product_images pi JOIN products p ON p.id = pi.productid LIMIT 1`;
  var rows = await query(que);
  console.log(que);
  return rows;
};

exports.reportProduct = async (param) => {
  var description =
    param.description == undefined || param.description == ""
      ? ""
      : param.description;
  var que = `INSERT INTO products_report(productId, userId, description, reportReasonId)
              VALUES(${param.productId}, ${param.userId}, '${description}', ${param.reportReasonId})`;
  var rows = await query(que);
  console.log(que);
  return rows;
};

exports.getAllReportedProduct = async (param) => {
  var search = param.search === undefined ? "" : param.search;

  var que = `
            SELECT distinct products.id, products.productName as productname, users.id as userId, users.name, categories.id as categoryId, categories.categoryName, products.isAnonymous, (!products.rowStatus) as isDisable, !ISNULL(products_report.productId) as reported,
            IFNULL(countedViews.views,0) as productView
            from products
            JOIN users 
            ON users.id = products.userId
            LEFT JOIN( SELECT COUNT(id) views, productId
                        FROM product_views
                        GROUP BY productId) countedViews ON products.id = countedViews.productId
            JOIN categories
            ON categories.id = products.categoryId
            LEFT JOIN products_report on products.id = products_report.productId
            WHERE categories.rowStatus = 1 
            `;
  que += ` AND products.productName LIKE '%${search}%' OR users.name LIKE '%${search}%' OR categories.categoryName LIKE '%${search}%'`;

  console.log(que);

  var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
  que += " LIMIT " + param.skip + ", " + param.take;
  var rows = await query(que);

  var countRows = await query(queryCount);
  rows.total = countRows[0].total;
  return rows;
};

exports.followProduct = async (param) => {
  var que = `INSERT INTO product_follows(userId, productId)
              VALUES(${param.userId}, ${param.productId})
               ON DUPLICATE KEY UPDATE    
              userId=${param.userId}, productId = ${param.productId}, rowStatus = 1
          `;
  console.log(que);
  var rows = await query(que);
  return rows;
};

exports.unfollowProduct = async (param) => {
  var que = `UPDATE product_follows SET rowStatus = 0 WHERE userId = ${param.userId} AND productId = ${param.productId}`;
  var rows = await query(que);
  return rows;
};

exports.getAllProductRepots = async (param) => {
  var que = `SELECT 
                products_report.id as productsReportId,
                users.name,
                products_report.productId,
                report_reasons.reasonName,
                products.productName,
                categories.categoryName
              FROM products_report
              JOIN products ON products.id = products_report.productId
              JOIN categories ON products.categoryId = categories.id
              JOIN report_reasons ON products_report.reportReasonId = report_reasons.id
              JOIN users ON products.userId = users.id
              WHERE (products.productName LIKE '%${param.search}%' 
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
