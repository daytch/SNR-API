const { dbmysql } = require('../middlewares');
const TableUsers = "users";
const TableUsersRole = "users_roles";
const TableRoles = "roles";
const TableUserDetails = "users_details";
const TableUserForgotPass = "user_forgotpassword";
const TableMerchDetails = "merchant_details";
const TableToken = "user_token_notif";
const moment = require("moment");

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = async (param) => {
    
    var que = "SELECT * FROM " + TableUsers + " WHERE 1=1 ";
    if (param.email != undefined && param.email != "") {
        que += "AND (email = '" + param.email + "' OR username = '" + param.email + "') ";
    }
    if (param.password != undefined) {
        que += "AND password = '" + param.password + "' ";
    }
    if (param.id != undefined && param.id != "") {
        que += "AND id = '" + param.id + "' ";
    }
    if (param.isActive != undefined && param.isActive != "") {
        que += "AND isactive = '" + param.isActive + "' ";
    }
    console.log(que);

    console.log("test");
    var rows = await query(que);
    console.log("find by username or email",rows);
    return rows;
};

exports.checkusers = async (param) => {

    var que = "SELECT * FROM " + TableUsers + " WHERE ";
    if (param.email != undefined && param.email != "") {
        que += " email = '" + param.email + "' ";
    }
    if (param.username != undefined && param.username != "") {
        que += "OR username = '" + param.username + "' ";
    }
    console.log(que);
    var rows = await query(que);
    return rows;
};

exports.getAllRecordSSO = async (param) => {
    var que = "SELECT * FROM " + TableUsers + " WHERE 1=1 ";
    if (param.sorce === 'google') {
        que += `AND googleMail = '${param.email}' `
    }
    if (param.source === 'facebook') {
        que += `AND facebookMail = '${param.email}' `
    }

    if (param.password != undefined) {
        que += "AND password = '" + param.password + "' ";
    }

    if (param.isActive != undefined && param.isActive != "") {
        que += "AND isactive = '" + param.isActive + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.getCountRecord = async (param) => {
    var que = "SELECT COUNT(*) as cnt FROM " + TableUsers + " WHERE 1=1 ";
    if (param.email != undefined && param.email != "") {
        que += "AND email = '" + param.email + "' ";
    }
    if (param.password != undefined) {
        que += "AND password = '" + param.password + "' ";
    }
    if (param.id != undefined && param.id != "") {
        que += "AND id = '" + param.id + "' ";
    }
    if (param.isActive != undefined && param.isActive != "") {
        que += "AND isactive = '" + param.isActive + "' ";
    }
    if (param.year != undefined && param.year != "") {
        que += "AND year(createdAt) = '" + param.year + "' ";
    }
    if (param.month != undefined && param.month != "") {
        que += "AND month(createdAt) = '" + param.month + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.loginUser = function (email, role, res, callback) {
    // var que = "SELECT a.*,b.roleId,c.name as role_name FROM " + TableUsers + " as a "
    //     + " INNER JOIN " + TableUsersRole + " as b on a.id = b.userId "
    //     + " LEFT JOIN " + TableRoles + " as c on b.roleId = c.id "
    //     // + " WHERE a.email = '" + email + "' AND a.password = '" + password + "' "
    //     + " WHERE a.email = '" + email + "' "
    //     + " AND a.isactive = 1 ";
    var que = `SELECT users.*, users_roles.roleId, roles.name as role_name ,
    IFNULL(follow.followers,0) as countedFollowers,
    IFNULL(proPosted.productsPosted,0) as countedProductPosted,
    IFNULL(questPosted.questionsPosted, 0) countedQuestionPosted,
    IFNULL(followed.following,0) countedFollowing,
    IFNULL(reviewed.reviews,0) countedProductReviewed,
    IFNULL(answered.answers,0) countedQuestionAnswer,
    users_details.bio,
    users_details.img_avatar,
    users_details.country
    FROM users
    JOIN users_roles  ON users.id = users_roles.userId
    JOIN users_details on users.id = users_details.userId
    LEFT JOIN ( SELECT COUNT(follows.userId) Followers, userFollowedId
                    FROM (
                        SELECT DISTINCT follows.userId , userFollowedId
                        FROM follows
                        JOIN users ON users.id = follows.userId
                        JOIN users_details ON users.id = users_details.userId AND users_details.isMute = 0
                        WHERE follows.IsActive = 1 AND users.isactive = 1
                    ) as follows
                    GROUP BY userFollowedId  ) follow ON follow.userFollowedId = users.id
    LEFT JOIN ( SELECT COUNT(id)  productsPosted , userId
                        FROM products
                        WHERE rowStatus = 1
                        GROUP BY userId) proPosted ON proPosted.userId = users.id
    LEFT JOIN ( SELECT COUNT(id) questionsPosted, userId
                        FROM questions
                        WHERE rowStatus =1
                        GROUP BY userId) questPosted ON questPosted.userId = users.id
     LEFT JOIN ( SELECT COUNT(follows.userFollowedId) following, follows.userId
                        FROM (SELECT DISTINCT follows.userFollowedId, follows.userId
                                FROM follows
                                JOIN users ON users.id = follows.userFollowedId
                                JOIN users_details ON users.id = users_details.userId AND users_details.isMute = 0
                                WHERE follows.IsActive = 1 AND users.isactive = 1
                                ) as follows
                        GROUP BY userId) followed ON followed.userId = users.id  
    LEFT JOIN ( SELECT COUNT(id) reviews, userId
                        FROM reviews
                        WHERE rowStatus = 1
                        GROUP BY userId) reviewed ON reviewed.userId = users.id     
    LEFT JOIN ( SELECT COUNT(ID) answers, userId
                        FROM question_answers
                        WHERE rowStatus = 1
                        GROUP BY userId) answered ON answered.userId = users.id                    
    LEFT JOIN roles ON users_roles.roleId = roles.id
    WHERE ( users.email = '${email}' OR users.username= '${email}'  )AND users.isActive = 1`
    // if(role != ""){
    //     que += " AND c.name = '" + role + "'";
    // }
    // console.log(que);
    dbmysql.query(que, function (error, rows, fields) {
        if (error) {
            callback(error, null, res, role);
        }
        else {
            console.log("check return res",res);
            callback(null, rows, res, role);
        }
    });
};

exports.loginUserSSOCallback = function (email, role, source, res, callback) {
    console.log(source);
    var que = `SELECT users.*, users_roles.roleId, roles.name as role_name ,
    IFNULL(follow.followers,0) as countedFollowers,
    IFNULL(proPosted.productsPosted,0) as countedProductPosted,
    IFNULL(questPosted.questionsPosted, 0) countedQuestionPosted,
    IFNULL(followed.following,0) countedFollowing,
    IFNULL(reviewed.reviews,0) countedProductReviewed,
    IFNULL(answered.answers,0) countedQuestionAnswer,
    users_details.bio,
    users_details.img_avatar,
    users_details.country
    FROM users
    JOIN users_roles  ON users.id = users_roles.userId
    JOIN users_details on users.id = users_details.userId
    LEFT JOIN ( SELECT COUNT(follows.id) Followers, userFollowedId
                    FROM follows
                    JOIN users ON users.id = follows.userId
                    JOIN users_details ON users.id = users_details.userId AND users_details.isMute = 0
                    WHERE follows.IsActive = 1 AND users.isactive = 1
                    GROUP BY userFollowedId  ) follow ON follow.userFollowedId = users.id
    LEFT JOIN ( SELECT COUNT(id)  productsPosted , userId
                        FROM products
                        WHERE rowStatus = 1
                        GROUP BY userId) proPosted ON proPosted.userId = users.id
    LEFT JOIN ( SELECT COUNT(id) questionsPosted, userId
                        FROM questions
                        WHERE rowStatus =1
                        GROUP BY userId) questPosted ON questPosted.userId = users.id
     LEFT JOIN ( SELECT COUNT(follows.id) following, follows.userId
                        FROM follows
                         JOIN users ON users.id = follows.userFollowedId
                        JOIN users_details ON users.id = users_details.userId AND users_details.isMute = 0
                        WHERE follows.IsActive = 1 AND users.isactive = 1
                        GROUP BY userId) followed ON followed.userId = users.id  
    LEFT JOIN ( SELECT COUNT(id) reviews, userId
                        FROM reviews
                        WHERE rowStatus = 1
                        GROUP BY userId) reviewed ON reviewed.userId = users.id     
    LEFT JOIN ( SELECT COUNT(ID) answers, userId
                        FROM question_answers
                        WHERE rowStatus = 1
                        GROUP BY userId) answered ON answered.userId = users.id                    
    LEFT JOIN roles ON users_roles.roleId = roles.id
    WHERE users.isActive = 1 `
    if (source === 'facebook') {
        que += ` AND facebookMail = '${email}'`
    }
    else if (source === 'google') {
        que += ` AND googleMail = '${email}'`
    }
    else {
        throw new Error('source is not valid : ' + source)
    }
    // if(role != ""){
    //     que += " AND c.name = '" + role + "'";
    // }
    // console.log(que);
    dbmysql.query(que, function (error, rows, fields) {
        if (error) {

            callback(error, null, res, role);
        }
        else {
            callback(null, rows, res, role);
        }
    });
};

exports.loginUserSSO = async (email, role, source) => {
    console.log(role);
    var que = "SELECT a.*,b.roleId,c.name as role_name FROM " + TableUsers + " as a "
        + " INNER JOIN " + TableUsersRole + " as b on a.id = b.userId "
        + " INNER JOIN " + TableRoles + " as c on b.roleId = c.id "

        + " WHERE a.isActive = 1 ";
    if (source === "facebook") {
        que = que + ` AND a.facebookMail = '${email}' `
    }
    else if (source === "google") {
        que = que + ` AND a.googleMail = '${email}'`
    }
    else {
        throw new Error(`Failed to Login with ${source}`);
    }
    if (role != "") {
        que += ` AND c.name =  '${role}'`;
    }

    var rows = await query(que);
    return rows;
};

exports.registerUser = function (param, callback) {
    var que = "INSERT INTO " + TableUsers + " (email,password,name,isActive,source, username) ";
    que += "VALUES ('" + param.email + "','" + param.password + "',";
    que += "'" + param.name + "',1,'" + param.source + "', '" + param.username + "' )";

    dbmysql.query(que, function (error, rows, fields) {
        if (error) {
            callback(error, null);
        }
        else {
            callback(null, rows);
        }
    });
}

exports.registerUserGoogle = function (param, callback) {
    var que = "INSERT INTO " + TableUsers + " (googleMail,password,name,isActive,source) ";
    que += "VALUES ('" + param.email + "','" + param.password + "',";
    que += "'" + param.name + "',1,'" + param.source + "' )";

    dbmysql.query(que, function (error, rows, fields) {
        if (error) {
            callback(error, null);
        }
        else {
            callback(null, rows);
        }
    });
}

exports.registerUserFacebook = function (param, callback) {
    var que = "INSERT INTO " + TableUsers + " (facebookMail,password,name,isActive,source) ";
    que += "VALUES ('" + param.email + "','" + param.password + "',";
    que += "'" + param.name + "',1,'" + param.source + "' )";

    dbmysql.query(que, function (error, rows, fields) {
        if (error) {

            callback(error, null);
        }
        else {
            callback(null, rows);
        }
    });
}

exports.registerUsersRole = function (param, callback) {
    var que = "INSERT INTO " + TableUsersRole + " (userId, roleId) ";
    que += "VALUES ('" + param.userId + "','" + param.roleId + "')";
    dbmysql.query(que, function (error, rows, fields) {
        if (error) {
            callback(error, null);
        }
        else {
            callback(null, rows);
        }
    });
}

exports.registerUsersRoleAwait = async (param) => {
    var que = "INSERT INTO " + TableUsersRole + " (userId, roleId) ";
    que += "VALUES ('" + param.userId + "','" + param.roleId + "')";

    var rows = await query(que);
    return rows;
}

exports.getUserDetails = async (user_id) => {
    var que = "SELECT a.*,b.name,b.email,b.source,b.isActive, b.username FROM " + TableUserDetails + " as a "
    que += "LEFT JOIN " + TableUsers + " as b on a.userId = b.id WHERE 1=1 ";
    if (user_id != null && user_id != "") {
        que += "AND a.userId = '" + user_id + "'";
    }
    var rows = await query(que);
    
    return rows;
}

exports.getUserDetailsWithName = async (user_id) => {
    var que = "SELECT a.*,b.name FROM " + TableUserDetails + " as a ";
    que += "INNER JOIN " + TableUsers + " as b on a.userId = b.id WHERE 1=1 ";
    if (user_id != null && user_id != "") {
        que += "AND a.userId = " + user_id;
    }

    var rows = await query(que);
    return rows;
}

exports.insertUsertDetails = async (param) => {
    var bio = param.bio === undefined ? '' : param.bio;
    var country = param.country === undefined ? '' : param.country;
    // var que = `REPLACE INTO users_details (userId,img_avatar, isMute, bio, Country) 
    //             VALUES(`+ param.id + `, '` + param.img_avatar + `', ` + param.isMute + `, '${bio}', '${country}')`;
    var que = `REPLACE INTO users_details (userId`
    var queValues = `VALUES ( ${param.id}`;

    if (param.img_avatar != undefined && param.img_avatar !== "" && (param.flagDeleteAva === "" || param.flagDeleteAva === undefined)) {
        que += ` ,img_avatar`;
        queValues += `, '${param.img_avatar}'`;
    }
    if (param.bio != undefined && param.bio != "") {
        que += ` ,bio`;
        queValues += `, '${bio}'`;
    }
    if (param.country != undefined && param.country !== "") {
        que += ` ,Country`;
        queValues += `, '${country}'`;
    }
    que += ` ) `;
    queValues += ` ) `;
    que = que + queValues;

    console.log(que);
    // console.log(que);
    // var que = "REPLACE INTO " + TableUserDetails + " (userId,img_avatar";
    // if(param.isMute !== undefined && param.isMute != ""){
    //     que += ",isMute";
    // }
    // que += ") VALUES (" + param.userId + ", '" + param.img_avatar + "'";
    // if(param.isMute !== undefined && param.isMute != ""){
    //     que += ",'"+param.isMute+"'";
    // }
    // que += ")";

    var rows = await query(que);
    // console.log(que);
    return rows;
}

exports.updateUser = async (param) => {
    var que = `UPDATE users 
                SET id= ${param.id},${param.name === undefined || param.name === '' ? '' : `name =  '${param.name}',`}${param.email === undefined || param.email === '' ? '' : `email =  '${param.email}',`}${param.username === undefined || param.username === '' ? '' : `username =  '${param.username}'`}`
    if (que.charAt(que.length - 1) === ',') {
        que = que.slice(0, -1);
    }
    que += ` WHERE id = ` + param.id;

    // var que = "REPLACE INTO " + TableUserDetails + " (userId,img_avatar";
    // if(param.isMute !== undefined && param.isMute != ""){
    //     que += ",isMute";
    // }
    // que += ") VALUES (" + param.userId + ", '" + param.img_avatar + "'";
    // if(param.isMute !== undefined && param.isMute != ""){
    //     que += ",'"+param.isMute+"'";
    // }
    // que += ")";
    console.log(que);
    var rows = await query(que);
    return rows;
}

exports.getRolesByName = async (name) => {
    var que = "SELECT * FROM " + TableRoles + " WHERE name = '" + name + "'";

    var rows = await query(que);
    return rows;
}

exports.getListMerchant = async (role_id, id_merchant, type, offset, per_page) => {
    var que = "SELECT a.id,a.name,a.email,c.img_avatar,d.createdAt,d.about,d.fb_url,d.ig_url,d.tiktok_url,a.last_login,a.isActive";
    if (type != undefined && type == "popular") {
        que += ",(SELECT COUNT(*) FROM favorites f WHERE f.pkey = a.id AND f.type_fav = 'Merchant' AND f.status = 1) as total_subs ";
    }
    que += " FROM " + TableUsers + " as a ";
    que += "INNER JOIN " + TableUsersRole + " as b ";
    que += "ON a.id = b.userId AND b.roleId = '" + role_id + "' ";
    que += "INNER JOIN " + TableUserDetails + " as c ";
    que += "ON a.id = c.userId ";
    que += "INNER JOIN " + TableMerchDetails + " as d ";
    que += "ON a.id = d.userId ";
    que += "WHERE 1=1 ";
    if (id_merchant != undefined && id_merchant > 0) {
        que += "AND a.id = '" + id_merchant + "' ";
    }
    else if (type != undefined && type == "recom") {
        que += "AND d.isrecom = 1 ";
    }
    else if (type != undefined && type == "new_comer") {
        // 30 Day Join
        que += "AND date(d.createdAt) between '" + moment().subtract(30, "days").format("YYYY-MM-DD") + "' AND '" + moment().add(1, "days").format("YYYY-MM-DD") + "'";
    }

    if (type != undefined && type == "popular") {
        que += "ORDER BY total_subs desc ";
    }
    else {
        que += "ORDER BY d.createdAt desc ";
    }
    que += "LIMIT " + offset + "," + per_page + " ";

    var rows = await query(que);
    return rows;
}

exports.getListMerchantRecom = async (role_id, id_merchant, type, offset, per_page, cat_in) => {
    var que = "SELECT a.id,a.name,a.email,c.img_avatar,d.createdAt,d.about,d.fb_url,d.ig_url,d.tiktok_url,a.last_login";
    que += ",(SELECT COUNT(*) FROM favorites f WHERE f.pkey = a.id AND f.type_fav = 'Merchant' AND f.status = 1) as total_subs ";
    que += " FROM " + TableUsers + " as a ";
    que += "INNER JOIN " + TableUsersRole + " as b ";
    que += "ON a.id = b.userId AND b.roleId = '" + role_id + "' ";
    que += "INNER JOIN " + TableUserDetails + " as c ";
    que += "ON a.id = c.userId ";
    que += "INNER JOIN " + TableMerchDetails + " as d ";
    que += "ON a.id = d.userId ";
    que += "INNER JOIN merchant_category as mc on a.id = mc.userId AND mc.category_id in (" + cat_in + ") ";
    que += "WHERE 1=1 ";
    if (id_merchant != undefined && id_merchant > 0) {
        que += "AND a.id = '" + id_merchant + "' ";
    }
    que += "GROUP BY a.id ";
    que += "ORDER BY total_subs desc ";
    que += "LIMIT " + offset + "," + per_page + " ";

    var rows = await query(que);
    return rows;
}

exports.getCountListMerchant = async (role_id, id_merchant, type) => {
    var que = "SELECT count(*) as cnt FROM " + TableUsers + " as a ";
    que += "INNER JOIN " + TableUsersRole + " as b ";
    que += "ON a.id = b.userId AND b.roleId = '" + role_id + "' ";
    que += "INNER JOIN " + TableUserDetails + " as c ";
    que += "ON a.id = c.userId ";
    que += "INNER JOIN " + TableMerchDetails + " as d ";
    que += "ON a.id = d.userId ";
    que += "WHERE 1=1 ";
    if (id_merchant != undefined && id_merchant > 0) {
        que += "AND a.id = '" + id_merchant + "' ";
    }
    else if (type != undefined && type == "recom") {
        que += "AND d.isrecom = 1 ";
    }
    else if (type != undefined && type == "new_comer") {
        // 30 Day Join
        que += "AND date(d.createdAt) between '" + moment().subtract(30, "days").format("YYYY-MM-DD") + "' AND '" + moment().add(1, "days").format("YYYY-MM-DD") + "'";
    }

    var rows = await query(que);
    return rows;
}

exports.getCountListMerchantRecom = async (role_id, id_merchant, type, cat_in) => {
    var que = "SELECT count(*) as cnt FROM " + TableUsers + " as a ";
    que += "INNER JOIN " + TableUsersRole + " as b ";
    que += "ON a.id = b.userId AND b.roleId = '" + role_id + "' ";
    que += "INNER JOIN " + TableUserDetails + " as c ";
    que += "ON a.id = c.userId ";
    que += "INNER JOIN " + TableMerchDetails + " as d ";
    que += "ON a.id = d.userId ";
    que += "INNER JOIN merchant_category as mc on a.id = mc.id AND mc.category_id in (" + cat_in + ") ";
    que += "WHERE 1=1 ";
    if (id_merchant != undefined && id_merchant > 0) {
        que += "AND a.id = '" + id_merchant + "' ";
    }

    var rows = await query(que);
    return rows;
}

exports.getCountListMerchantByYear = async (role_id, id_merchant, type, year, month) => {
    var que = "SELECT count(*) as cnt FROM " + TableUsers + " as a ";
    que += "INNER JOIN " + TableUsersRole + " as b ";
    que += "ON a.id = b.userId AND b.roleId = '" + role_id + "' ";
    que += "INNER JOIN " + TableUserDetails + " as c ";
    que += "ON a.id = c.userId ";
    que += "INNER JOIN " + TableMerchDetails + " as d ";
    que += "ON a.id = d.userId ";
    que += "WHERE 1=1 ";
    if (id_merchant != undefined && id_merchant > 0) {
        que += "AND a.id = '" + id_merchant + "' ";
    }
    if (type != undefined && type == "popular") {
        que += "AND d.ispopular = 1 ";
    }
    else if (type != undefined && type == "recom") {
        que += "AND d.isrecom = 1 ";
    }
    else if (type != undefined && type == "new_comer") {
        // 30 Day Join
        que += "AND date(d.createdAt) between '" + moment().subtract(30, "days").format("YYYY-MM-DD") + "' AND '" + moment().add(1, "days").format("YYYY-MM-DD") + "'";
    }
    if (year != undefined && year > 0) {
        que += "AND year(d.createdAt) = '" + year + "' ";
    }
    if (year != undefined && year > 0) {
        que += "AND month(d.createdAt) = '" + month + "' ";
    }

    var rows = await query(que);
    return rows;
}

exports.getRecordForgotPass = async (token) => {
    var que = "SELECT * FROM " + TableUserForgotPass + " WHERE 1=1 ";
    if (token != null && token != "") {
        que += "AND token = '" + token + "'";
    }

    var rows = await query(que);
    return rows;
}

exports.insertForgotPass = async (email, status, expired_time, token) => {
    var que = "INSERT INTO " + TableUserForgotPass + " (email, status, expired_time, token) ";
    que += "VALUES ('" + email + "','" + status + "','" + expired_time + "','" + token + "')";

    var rows = await query(que);
    return rows;
}


exports.getAllUsers = async (param) => {
    var que = `SELECT  a.id as userId, a.name, a.email, a.source,  a.isactive as isEnable, a.username, a.googleMail, a.facebookMail, b.img_avatar, b.Bio as bio, b.Country as country
                FROM users a
                JOIN users_details b
                ON a.id = b.userId
                WHERE a.name LIKE '%${param.search}%' OR a.email LIKE '%${param.search}%' OR a.username LIKE '%${param.search}%' OR a.googleMail LIKE '%${param.search}%' 
                OR a.facebookMail LIKE '%${param.search}%'`
    var queryCount = `SELECT COUNT(*) as total FROM (` + que + `) countTable`;

    que += " LIMIT " + param.skip + ", " + param.take;

    var countRows = await query(queryCount);
    var rows = await query(que);
    rows.total = countRows[0].total;
    return rows;
}

exports.changePassword = async (userId, password) => {
    var que = "UPDATE " + TableUsers + " SET password = '" + password + "' ";
    que += "WHERE id = '" + userId + "' ";

    var rows = await query(que);
    return rows;
}


exports.disableUser = async (param) => {
    var que = `update users SET isActive = ${param.isActive}
                WHERE id = ${param.userId}`;
    var rows = await query(que);
    return rows;
}

exports.selectUsers = async(param)=>{
    var que = `SELECT * FROM users WHERE id = ${param.userId}`
    var rows = await query(que);
    return rows;
}

exports.enableUser = async (param) => {
    var que = `UPDATE users SET isActive = 1
                WHERE id = ${param.userId}`;
    var rows = await query(que);
    return rows;
}


exports.updateName = async (name, user_id) => {
    var que = "UPDATE " + TableUsers + " SET name = '" + name + "' ";
    que += "WHERE id = '" + user_id + "' ";

    var rows = await query(que);
    return rows;
}

exports.updateMute = async (user_id, isMute) => {
    var que = "UPDATE " + TableUserDetails + " SET isMute = '" + isMute + "' WHERE userId = '" + user_id + "'";
    var rows = await query(que);
    return rows;
}

exports.updateAvatar = async (user_id, img_avatar) => {
    var que = "UPDATE " + TableUserDetails + " SET img_avatar = '" + img_avatar + "' WHERE userId = '" + user_id + "'";
    var rows = await query(que);
    return rows;
}

exports.getRecordToken = async (token, userId, type_device) => {
    var que = "SELECT * FROM " + TableToken + " WHERE 1=1 ";
    que += "AND token = '" + token + "' AND type_device = '" + type_device + "' AND userId = '" + userId + "'";

    // console.log(que);
    var rows = await query(que);
    return rows;
}

exports.insertToken = async (token, userId, type_device) => {
    var que = "INSERT INTO " + TableToken + " (token, userId, type_device, createdAt) ";
    que += "VALUES ('" + token + "','" + userId + "','" + type_device + "',now())";

    var rows = await query(que);
    return rows;
}

exports.getLastToken = async (userId, type_device) => {
    var que = "SELECT * FROM " + TableToken + " WHERE 1=1 ";
    if (userId !== undefined && userId != "") {
        que += "AND userId = '" + userId + "' ";
    }
    if (type_device !== undefined && type_device != "") {
        que += "AND type_device = '" + type_device + "' ";
    }
    que += "AND (token <> '' AND token <> 'undefined') ";
    que += "ORDER BY createdAt desc LIMIT 1";

    var rows = await query(que);
    return rows;
}

exports.updateLastLogin = async (user_id) => {
    var que = "UPDATE " + TableUsers + " SET last_login = now() WHERE id = '" + user_id + "'";
    var rows = await query(que);
    return rows;
}

exports.deleteToken = async (token, userId, type_device) => {
    var que = "DELETE FROM " + TableToken + " WHERE userId = '" + userId + "' AND token = '" + token + "' AND type_device = '" + type_device + "'";

    var rows = await query(que);
    return rows;
}

exports.updateActive = async (user_id, isActive) => {
    var que = "UPDATE " + TableUsers + " SET isActive = " + isActive + " WHERE id = '" + user_id + "'";
    var rows = await query(que);
    return rows;
}

exports.checkUser = async (param) => {
    var que = "SELECT * FROM users WHERE (email = '" + param.email + "' OR username = '" + (param.username ?? "") + "') AND id !=" + param.userId;
    var rows = await query(que);

    return rows;
}

exports.getUserProfile = async (param) => {

    var que = `SELECT users.id as userId, users.username, users.email, users.googleMail, users.facebookMail, users.name, users.createdAt as joinDate, users_details.country, users_details.bio, 
    IFNULL(answered.answers,0) countedQuestionAnswer,IFNULL(reviewed.reviews,0) countedProductReviewed, IFNULL(followed.following,0) countedFollowing, 
    IFNULL(questPosted.questionsPosted, 0) countedQuestionPosted ,IFNULL(follow.followers,0) as countedFollowers, 
    IFNULL(proPosted.productsPosted,0) as countedProductPosted,
    users_details.img_avatar
    FROM users
    LEFT JOIN users_details on users.id = users_details.userId
    LEFT JOIN ( SELECT COUNT(follows.userId) Followers, userFollowedId
                FROM (SELECT DISTINCT userFollowedId, userId, IsActive FROM follows) as follows
                JOIN users ON users.id = follows.userId
				JOIN users_details ON users.id = users_details.userId AND users_details.isMute = 0
                WHERE follows.IsActive = 1 AND users.isactive = 1
                GROUP BY userFollowedId  ) follow ON follow.userFollowedId = users.id
    LEFT JOIN ( SELECT userId,
                    Count(id) as countedProductPosted
                FROM products
                WHERE rowStatus = 1
                GROUP BY userId) productPosted ON productPosted.userId = users.id
    LEFT JOIN ( SELECT COUNT(id)  productsPosted , userId
                    FROM products
                    WHERE rowStatus = 1
                    GROUP BY userId) proPosted ON proPosted.userId = users.id
    LEFT JOIN ( SELECT COUNT(id) questionsPosted, userId
                    FROM questions
                    WHERE rowStatus =1
                    GROUP BY userId) questPosted ON questPosted.userId = users.id
    LEFT JOIN (  SELECT COUNT(follows.userFollowedId) following, follows.userId
                FROM (SELECT DISTINCT userFollowedId, userId, IsActive FROM follows) as follows
                JOIN users ON users.id = follows.userFollowedId
                JOIN users_details ON users.id = users_details.userId AND users_details.isMute = 0
                WHERE follows.IsActive = 1 AND users.isactive = 1
                GROUP BY userId) followed ON followed.userId = users.id
    LEFT JOIN ( SELECT COUNT(reviews.id) reviews, users.id as userId
                FROM  reviews
                JOIN products ON reviews.productId = products.id
                JOIN users ON reviews.userId = users.id
                JOIN users_details ON users_details.userId = users.id
                LEFT JOIN (SELECT  reviewId,
                        group_concat(imageLink) as images
                    FROM review_images 
                    GROUP By reviewId) images ON reviews.id =  images.reviewId
                WHERE users_details.isMute = 0 AND reviews.rowStatus = 1 AND products.rowStatus = 1
                    GROUP BY userId) reviewed ON reviewed.userId = users.id
    LEFT JOIN (SELECT 
         count(question_answers.id) as answers, users.id as userId
      FROM question_answers
      JOIN users ON question_answers.userId = users.id
      JOIN questions on question_answers.questionsId = questions.id
      JOIN users_details ON users.id = users_details.userId
      WHERE users.isactive = 1 AND users_details.isMute = 0 AND questions.rowStatus = 1 AND question_answers.rowStatus = 1
                    GROUP BY userId) answered ON answered.userId = users.id  `;

    que += `WHERE users.id = ` + param.userId
    console.log(que);
    // console.log(que);
    var rows = await query(que);

    return rows;


}

exports.getFollowers = async (param) => {

    var que = `SELECT 
                    DISTINCT
	                users.id as userid, users.name, users_details.country ,
                    users_details.img_avatar,
                    follows.isActive
                FROM follows
                JOIN users ON users.id = follows.userId
                JOIN users_details ON users.id = users_details.userid
                WHERE  users_details.isMute = 0 AND users.isactive = 1 AND `

    que += `userFollowedId =  ${param.userId}`;

    if (param.search !== "" && param.search !== undefined) {
        que += ` AND (users.name like '%${param.search}%'  OR users_details.country LIKE '%${param.search}%')`
    }

    var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable "
    que += " LIMIT " + param.skip + ", " + param.take;
    var rows = await query(que);


    var countRows = await query(queryCount);
    rows.total = countRows[0].total;
    return rows;

}

exports.removeFollowers = async (param) => {
    var que = `UPDATE follows SET isActive = 0 WHERE userId = ` + param.removedId + ` AND userFollowedId = ` + param.userId + ``

    var rows = await query(que);

    return rows;
}

exports.getFollowing = async (param) => {
    var que = `SELECT 
                    DISTINCT
                    users.id as userid, 
                    users.name, 
                    users_details.country,
                    users_details.img_avatar,
                    follows.isactive
                FROM follows
                JOIN users ON users.id = follows.userFollowedId
                JOIN users_details ON users.id = users_details.userid
                WHERE  users_details.isMute = 0 AND users.isactive = 1 AND `;

    que += `follows.userId =  ${param.userId}`;

    if (param.search !== "" && param.search !== undefined) {
        que += ` AND (users.name like '%${param.search}%'  OR users_details.country LIKE '%${param.search}%')`
    }


    var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable "
    que += " LIMIT " + param.skip + ", " + param.take;
    var rows = await query(que);

    var countRows = await query(queryCount);
    rows.total = countRows[0].total;
    return rows;
}


exports.unfollow = async (param) => {
    var que = `UPDATE follows SET isActive = 0 WHERE userId = ` + param.userId + ` AND userFollowedId = ` + param.removedId + ``

    var rows = await query(que);

    return rows;
}

exports.getUsers = async (param) => {

    var que = `SELECT 
                    DISTINCT
                    users.id,
                    users.id as userId,
                    users.name,
                    users.username,
                    users.email,
                    users.createdAt as joinDate,
                    users.googleMail,
                    users.facebookmail,
                    users_details.img_avatar,
                    users_details.country,
                    users_details.bio,
                    IFNULL(followers.countedFollowers,0) as countedFollowers,
                    IFNULL(following.countedFollowing,0) as countedFollowing,
                    IFNULL(productPosted.countedProductPosted,0) as countedProductPosted,
                    IFNULL(reviewPosted.countedProductReviewed,0) as countedProductReviewed,
                    IFNULL(questionPosted.countedQuestionPosted,0) as countedQuestionPosted,
                    IFNULL(questionAnswered.countedQuestionAnswer,0) as countedQuestionAnswer,
                    !ISNULL(follows.id) as IsFollowed,
                    !ISNULL(notify_me.id) as IsNotifyMe
                FROM users
                JOIN users_details ON users.id = users_details.userId
                LEFT JOIN (SELECT userFollowedId, 
                        COUNT(userId) countedFollowers
                    FROM (SELECT DISTINCT userFollowedId, userId
                        FROM follows
                        WHERE IsActive = 1
                        ) as follows
                    
                    GROUP BY userFollowedId) followers ON followers.userFollowedId = users.id
                LEFT JOIN (SELECT userId,
                        COUNT(userFollowedId) countedFollowing
                    FROM (SELECT DISTINCT userFollowedId, userId
                        FROM follows
                        WHERE IsActive = 1
                        ) as follows
                    
                    GROUP BY userId) following ON following.userId = users.id
                LEFT JOIN ( SELECT userId,
                        Count(id) as countedProductPosted
                    FROM products
                    WHERE rowStatus = 1
                    GROUP BY userId) productPosted ON productPosted.userId = users.id
                LEFT JOIN ( SELECT userId,
                            COUNT(id) as countedProductReviewed
                        FROM reviews
                        WHERE rowStatus=1 
                        GROUP BY userId) reviewPosted ON reviewPosted.userId = users.id
                LEFT JOIN ( SELECT userId,
                            COUNT(id) as countedQuestionPosted
                        FROM questions
                        WHERE rowStatus =1
                        GROUP BY userId) questionPosted on questionPosted.userId = users.id
                LEFT JOIN ( SELECT userId,
                            COUNT(id) as countedQuestionAnswer
                        FROM question_answers
                        WHERE rowStatus = 1
                        GROUP BY userId) questionAnswered ON questionAnswered.userId = users.id
                LEFT JOIN follows ON follows.userFollowedId = users.id AND follows.userId = ${param.currentLoginId} AND follows.IsActive = 1
                LEFT JOIN notify_me ON notify_me.userId = users.id AND notify_me.notifyUserId = ${param.currentLoginId} AND notify_me.isActive = 1
                WHERE users.isactive = 1 AND users_details.isMute = 0  AND users.name LIKE '%`+ param.search + `%' AND users.username LIKE '%` + param.search + `%' AND users.id!= ${param.currentLoginId} `
    if (param.userId !== undefined && param.userId !== "") {
        que += ` AND users.id = ${param.userId}`
    }
    var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable ";
    console.log(que);


    que += " LIMIT " + param.skip + ", " + param.take;


    var rows = await query(que);
    console.log(que);
    var countRows = await query(queryCount);
    rows.total = countRows[0].total;
    return rows;
}


exports.followUser = async (param) => {
    var que = `INSERT INTO follows(userId, userFollowedId)
    VALUES(${param.userId}, ${param.userFollowedId})
    ON DUPLICATE KEY UPDATE    
    userId=${param.userId}, userFollowedId = ${param.userFollowedId}, isActive = 1
    `
    var rows = await query(que);
    return rows;
}


exports.notifyUsers = async (param) => {
    var selectQue = `SELECT * FROM notify_me WHERE userId = ${param.fromUserId} AND notifyUserId = ${param.userId}`
    var rowSelect = await query(selectQue);
    var que = ''
    if(rowSelect.length > 0){
        que = `UPDATE notify_me SET isActive = ${!rowSelect[0].isActive} WHERE id = ${rowSelect[0].id}`
    }
    else{
        que = `INSERT INTO notify_me(userId, notifyUserId)
    VALUES(${param.fromUserId}, ${param.userId})
    
    `
    }

    
    var rows = await query(que);
    return rows;
}

exports.getNotifyUsers = async(param)=>{
    var que = `SELECT * FROM notify_me WHERE userId = ${param.userId}`
    var rows = await query(que);
    return rows;
}

exports.connectGoogle = async (param) => {
    var que = `UPDATE users SET googleMail = '${param.googleMail}' WHERE id = ${param.userId}`
    var rows = await query(que);
    return rows;
}

exports.connectFacebook = async (param) => {
    var que = `UPDATE users SET facebookMail = '${param.facebookMail}' WHERE id = ${param.userId}`
    var rows = await query(que);
    return rows;
}


exports.checkGoogleMail = async (param) => {
    var que = `SELECT * FROM users WHERE googleMail = '${param.googleMail}' AND id != ${param.userId}`
    var rows = await query(que)
    return rows;
}

exports.checkFacebookMail = async (param) => {
    var que = `SELECT * FROM users WHERE facebookmail = '${param.facebookMail}' AND id != ${param.userId}`
    var rows = await query(que)
    return rows;
}