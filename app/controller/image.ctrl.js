const { uploadfile } = require("../middlewares");
const responseHelper = require("../helper/response.helper");
const formidable = require("formidable");
const conf = require("../config/upload.config");


async function createImageUrl(image, category, userId) {
    var baseUrl = conf.base_url;
    var imageFolder = conf.folderReview + "/" + category;
    var imageBaseUrl = baseUrl + "/" + imageFolder;
    var check = {
        filename: ""
    }
    check = await uploadfile.uploadImage(image, userId, imageFolder)
    if (check.error) {
        return check;
    }

    check.filename = imageBaseUrl + "/" + check.filename;
    return check;
}


exports.uploadImage = async (param,res)=>{

    try{

        var form = new formidable.IncomingForm();
        form.parse(param, async (err, fields, files) => {
            if (err) {
                console.error('Error', err)
                return res.status(200).json({
                    isSuccess: false,
                    message: "Failed upload image"
                });
            }
            var userId = param.userId;
            var type = fields.type;
            if (userId === undefined || userId == "") {
                return res.status(200).json({
                    isSuccess: false,
                    message: "Failed to get profile, please relogin"
                });
            }
            if (type === undefined || type == "") {
                return res.status(200).json({
                    isSuccess: false,
                    message: "There Are something Wrong in Our System"
                })
            }
            if (files.image !== undefined && files.image != "") {
                var image = await createImageUrl(files.image, fields.type, userId);
                if (image.error) {
                    return res.status(200).json({
                        isSuccess: false,
                        message: image.message
                    });
                }
                return res.status(200).json(responseHelper.Success(image.filename))
                // imageUrls.push(image.filename);
            }
        });
        // var req = param.body;
        // req.userId = param.userId;
        // if(req.userId === undefined || req.userId === ''){
        //     return res.status(401).json(responseHelper.FailWithMessage("Failed to get user, please relogin !"))
        // }


    }
    catch(error){
        return res.status(200).json(responseHelper.Fail());
    }
}