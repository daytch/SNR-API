const { dbmysql } = require('../middlewares');
const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);


exports.getAllReasons = async () => {

    var que = `SELECT id as reportReasonId, reasonName FROM report_reasons WHERE rowStatus = 1`;
    var rows = await query(que);
    return rows;
}