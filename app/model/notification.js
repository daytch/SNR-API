const { dbmysql } = require('../middlewares');
const util = require("util");
const TableName = "notification";

const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getRecord = async (id, user_id, pkey, isRead) => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";
    if (id != "") {
        que += "AND id = '" + id + "' ";
    }
    if (user_id != "") {
        que += "AND userId = '" + user_id + "' ";
    }
    if (pkey != "") {
        que += "AND pkey = '" + pkey + "' ";
    }
    if (isRead != "") {
        que += "AND isRead = '" + isRead + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.getCountRecord = async (id, user_id, pkey, isRead) => {
    var que = "SELECT COUNT(*) as cnt FROM " + TableName + " WHERE 1=1 ";
    if (id != "") {
        que += "AND id = '" + id + "' ";
    }
    if (user_id != "") {
        que += "AND userId = '" + user_id + "' ";
    }
    if (pkey != "") {
        que += "AND pkey = '" + pkey + "' ";
    }
    if (isRead != "") {
        que += "AND isRead = '" + isRead + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.getListPaging = async (id, user_id, pkey, isRead, skip, take, type) => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";
    if (id != "") {
        que += "AND id = '" + id + "' ";
    }
    if (user_id != "") {
        que += "AND userId = '" + user_id + "' ";
    }
    if (pkey != "") {
        que += "AND pkey = '" + pkey + "' ";
    }
    if (isRead != "") {
        que += "AND isRead = '" + isRead + "' ";
    }
    if (type != "") {
        que += "AND type = '" + type + "' ";
    }
    que += "ORDER BY createdAt desc ";
    que += "LIMIT " + skip + "," + take + " ";

    var rows = await query(que);
    return rows;
};

exports.updateReadLastId = async (last_id, user_id, isRead) => {
    var que = "UPDATE " + TableName + " SET isRead = '" + isRead + "' WHERE id < '" + (last_id + 1) + "' AND userId = '" + user_id + "'";

    var rows = await query(que);
    return rows;
}

exports.insertRecord = async (user_id, pkey, type, title, description, isRead, countPeople) => {
    var que = "INSERT INTO " + TableName + " (userId,pkey,type,title,description,isRead,createdAt, countPeople) ";
    que += "VALUES ('" + user_id + "','" + pkey + "','" + type + "','" + title + "','" + description + "','" + isRead + "',now(), " + countPeople + ")";
    var rows = await query(que);
    return rows;
}




exports.insertRecord = async (param) => {
    
    var categories = param.categories === undefined ? '' : param.categories;
    var table = param.table === undefined ? '' : param.table;
    var que = "INSERT INTO " + TableName + " (userId,pkey,type,title,description,isRead,createdAt, countPeople, categories) ";
    // que += "VALUES ('" + param.userId + "','" + param.pkey + "','" + param.type + "','" + param.title + "','" + param.description + "','" + param.isRead + "',now(), " + param.countPeople + ","+ `'${categories}', ''` +")";
    que += `VALUES(${param.userId}, ${param.pkey}, '${param.type}', '${param.title}', '${param.description}', ${param.isRead}, now(), ${param.countPeople}, '${categories}')`
    var rows = await query(que);

    return rows;
}

exports.getSpecificNotification = async (param) => {
    console.log(param)
    var que = `SELECT * 
                FROM notification
                WHERE type = '${param.type}' AND pkey = ${param.pkey} AND userId= ${param.userId} AND isRead = 0 
                ORDER BY id DESC
                LIMIT 1`

    var rows = await query(que);
    return rows;
}

exports.updateNotification = async (param) => {
    var que = `UPDATE notification SET title = '${param.title}' , countPeople = ${param.countPeople}, description ='${param.description}', modifiedAt = now() WHERE id = ${param.notifId}`;
    var rows = await query(que);
    return rows;
}
// exports.getJobNotif = async(pkey, type) => {
//     var que = "SELECT * FROM job_notification WHERE pkey = '"+pkey+"' AND type = '"+type+"'";
//     var rows = await query(que);
//     return rows;
// }

// exports.insertJobNotif = async(pkey, type) => {
//     var que = "INSERT INTO job_notification (pkey, type) VALUES ('"+pkey+"','"+type+"')";
//     var rows = await query(que);
//     return rows;
// }

exports.getCategories = async (param) => {
    var que = `SELECT FindFullpathCategory(${param.categories})`;
    var rows = await query(que);
    return rows;
}

exports.getAllNotification = async (param) => {
    var que = `SELECT * FROM notification 
                WHERE userId = ${param.userId}`

    var queryAnyNoRead = `SELECT IF(COUNT(que.id) > 0, 1, 0) as NoRead
                        from (${que}) as que
                        WHERE que.isRead = 0`

    var queryCount = " SELECT COUNT(*) as total FROM ( " + que + ")countTable "
    que += ` ORDER BY isRead asc, createdAt desc`
    que += " LIMIT " + param.skip + ", " + param.take;


    var isAnyNoRead = await query(queryAnyNoRead);
    var rows = await query(que);
    var countRows = await query(queryCount);
    rows.total = countRows[0].total;
    rows.isAnyNoRead = isAnyNoRead[0].NonRead

    return rows;


}

exports.markAllAsRead = async (param) => {
    var que = `UPDATE notification SET isRead = 1 WHERE userId = ${param.userId}`
    var rows = await query(que);
    return rows;
}

exports.readNotification = async (param) => {
    var que = `UPDATE notification SET isRead = 1 WHERE id = ${param.notificationId} AND userId = ${param.userId}`
    var rows = await query(que);
    return rows;
}