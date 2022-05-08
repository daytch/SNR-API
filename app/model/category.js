const { dbmysql } = require('../middlewares');
const TableCategories = "categories";

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);



exports.createCategory = async(param) => {
    // var que = "INSERT INTO " + TableCategories + " (categoryName,isParent,iconUrl,rowStatus) ";
     var que = "INSERT INTO " + TableCategories + " (categoryName,isParent,parentCategoryId,iconUrl,rowStatus, createdAt) ";
    que += "VALUES ('" + param.categoryName + "','" + param.isParent + "'," ;
    que += param.parentCategoryId + ",";
    que += "'" + param.iconUrl + "',1, now() )";
    var rows = await query(que);
    return rows;
}

exports.updateCategory = async(param) =>{
    var que = "UPDATE " + TableCategories + " SET categoryName = '" + param.categoryName + "', isParent = " + param.isParent;
    que += ", parentCategoryId = " + param.parentCategoryId + " , iconUrl = '" + param.iconUrl + "' , modifiedAt = now() ";
    que += "WHERE id = '" + param.id + "'";
    var rows = await query(que);
    return rows;
}

exports.deleteCategory = async(param) =>{
    var que = "UPDATE " + TableCategories + " SET rowStatus = 0, modifiedAt = now() ";
        que += "WHERE id = '" + param.id + "'";

    var rows = await query(que);
    return rows;
}

exports.getAllParentCategory = async(param) =>{
    var que = "SELECT id, categoryName as text , iconUrl FROM " + TableCategories + " WHERE rowStatus = 1 AND isParent = 1 AND parentCategoryId IS NULL";
    if(param.categoryId !== undefined && param.categoryId !== ""){
        que += ` AND id = ${param.categoryId}`
    }
    var rows = await query(que);
    return rows;
}

exports.getAllSubCategory = async() =>{
    var que = "SELECT id, categoryName as text , iconUrl, parentCategoryId FROM " + TableCategories + " WHERE rowStatus = 1 AND parentCategoryId IS NOT NULL ";

    var rows = await query(que);
    return rows;
}

exports.getSubCategoryByParentId = async(parent_id) =>{
    var que = "SELECT id, categoryName as text , iconUrl FROM " + TableCategories + " WHERE rowStatus = 1 AND parentCategoryId = " + parent_id;

    var rows = await query(que);
    return rows;
}