
const category = require("../model/category");



exports.insertCategory = async (param, res) => {
    var req = param.body;

    var ins = await category.createCategory(req);
    if (ins.affectedRows > 0) {
        return res.status(200).json({
            isSuccess: true,
            message: "Success insert data"
        });
    }
    else {
        return res.status(200).json({
            isSuccess: false,
            message: "Failed insert data"
        });
    }
}

exports.updateCategory = async (param, res) => {
    var req = param.body;

    var ins = await category.updateCategory(req);
    if (ins.affectedRows > 0) {
        return res.status(200).json({
            isSuccess: true,
            message: "Success update data"
        });
    }
    else {
        return res.status(200).json({
            isSuccess: false,
            message: "Failed update data"
        });
    }
}

exports.deleteCategory = async (param, res) => {
    var req = param.body;

    var ins = await category.deleteCategory(req);
    if (ins.affectedRows > 0) {
        return res.status(200).json({
            isSuccess: true,
            message: "Success update data"
        });
    }
    else {
        return res.status(200).json({
            isSuccess: false,
            message: "Failed update data"
        });
    }
}

exports.getAllParentCategory = async (param, res) => {
    var rtn = {};
    try {
        
        
        var cat = await category.getAllParentCategory(param.body);
        
        if (cat.length > 0) {
            status = 200;
            rtn.isSuccess = true;
            rtn.message = "Success";
            rtn.data = cat;
            rtn.total = cat.length;
        }

        return res.status(status).json(rtn);
    }
    catch (error) {
        rtn.isSuccess = false,
            rtn.status = 200;
        rtn.message = "There Are somethign Wrong in Our System"
        return res.status(200).json(rtn);
    }

};

exports.getAllSubCategory = async (param, res) => {
    var rtn = {};

    try {
        var cat = await category.getAllSubCategory();


        if (cat.length > 0) {
            status = 200;
            rtn.isSuccess = true;
            rtn.message = "Success";
            rtn.data = cat;
            rtn.total = cat.length;
        }

        return res.status(status).json(rtn);
    }
    catch (error) {
        rtn.isSuccess = false,
            rtn.status = 200;
        rtn.message = "There Are somethign Wrong in Our System"
        return res.status(200).json(rtn);
    }
};

exports.getSubCategoryByParentId = async (param, res) => {
    var rtn = {};
    try {
        var query = param.query;
        var cat = await category.getSubCategoryByParentId(query.parentId);


        if (cat.length > 0) {
            status = 200;
            rtn.isSuccess = true;
            rtn.message = "Success";
            rtn.data = cat;
            rtn.total = cat.length;
        }

        return res.status(status).json(rtn);
    }
    catch (error) {
        rtn.isSuccess = false,
            rtn.status = 200;
        rtn.message = "There Are somethign Wrong in Our System"
        return res.status(200).json(rtn);
    }

}