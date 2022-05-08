const product = require("../model/product");
const formidable = require("formidable");
const conf = require("../config/upload.config");
const { uploadfile } = require("../middlewares");
const responseHelper = require("../helper/response.helper");
const notification = require("../controller/notification.ctrl");
const email = require("../middlewares/sendMail.js");
const { json } = require("body-parser");
const e = require("express");

exports.getReviewTitles = async (param, res) => {
  try {
    var rtn = {};
    var items = await product.getReviewTitles();
    rtn.isSuccess = true;
    rtn.message = "Success";
    rtn.data = items;
    return res.status(200).json(rtn);
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: error.message,
    });
  }
};

exports.insertProduct = async (param, res) => {
  var req = param.body;
  req.userId = param.userId;
  if (req.userId == undefined || req.userId == "") {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed to get profile, please relogin",
    });
  }
  var ins = await product.createProduct(req);
  if (ins.affectedRows > 0) {
    notification.notificationNotifyPostProduct({
      productId: ins.insertId,
      userId: req.userId,
    });
    return res.status(200).json({
      isSuccess: true,
      message: "Success insert data",
      productId: ins.insertId,
    });
  } else {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed insert data",
    });
  }
};

exports.countViewProduct = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    }
    var countedViews = await product.findCountViews(req);
    console.log(countedViews);
    if (countedViews.length > 0) {
      return res.status(200).json({
        isSuccess: true,
        message: "Already Vote",
      });
    } else {
      var ins = await product.countViews(req);
      if (ins.affectedRows > 0) {
        return res.status(200).json({
          isSuccess: true,
          message: "Success insert data",
        });
      } else {
        return res.status(200).json({
          isSuccess: false,
          message: "Failed insert data",
        });
      }
    }
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed insert data",
    });
  }
};

exports.countUpvoteProduct = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    }
    var hasCounted = await product.isUserhasCountedvote(req);
    
    if (hasCounted.length > 0) {
      var del = await product.deleteUpVote(hasCounted[0].id);
      if(del.affectedRows>0){
        return res.status(200).json({
          isSuccess: true,
          message: "Success insert data"
        })
      }
      else{
        return res.status(200).json({
          isSuccess: false,
          message: "Failed insert data"
        })
      }
    } else {
      var ins = await product.countUpvote(req);
      if (ins.affectedRows > 0) {
        // notification.notificationReviewUpvote(req);
        return res.status(200).json({
          isSuccess: true,
          message: "Success insert data",
        });
      } else {
        return res.status(200).json({
          isSuccess: false,
          message: "Failed insert data",
        });
      }
    }
  } catch (error) {
    console.log(error.message)
    return res.status(200).json({
      isSuccess: true,
      message: "Failed insert data"
    })
  }
};

exports.countProductImageLike = async (param, res) => {
  var req = param.body;
  req.userId = param.userId;
  if (req.userId == undefined || req.userId == "") {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed to get profile, please relogin",
    });
  }
  req.productId = req.id;
  try {
    var hasCounted = await product.isUserHasCountedProductImageLike(req);

    if (hasCounted.length > 0) {
      var ins = await product.discountProductImageLike(req);
      if (ins.affectedRows > 0) {
        return res.status(200).json({
          isSuccess: true,
          message: "Success update data",
        });
      }
      return res.status(200).json({
        isSuccess: false,
        message: "user has been liked",
      });
    } else {
      var ins = await product.countProductImageLike(req);
      if (ins.affectedRows > 0) {
        notification.notificationLikedImage({
          productId: req.productId,
          fromUserId: req.userId,
        });
        return res.status(200).json({
          isSuccess: true,
          message: "Success insert data",
        });
      } else {
        return res.status(200).json({
          isSuccess: false,
          message: "Failed insert data",
        });
      }
    }
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: "There Are something Wrong in Our System" + error,
    });
  }
};

exports.countViewProductImage = async (param, res) => {
  var req = param.body;
  req.userId = param.userId;
  if (req.userId == undefined || req.userId == "") {
    return res.status(200).json({
      isSuccess: false,
      message: "Failed to get profile, please relogin",
    });
  }
  try {
    var countedViews = await product.findCountViewsProductImage(req);
    if (countedViews.length > 0) {
      return res.status(200).json({
        isSuccess: true,
        message: "Already Vote",
      });
    } else {
      var ins = await product.countViewProductImage(req);
      if (ins.affectedRows > 0) {
        return res.status(200).json({
          isSuccess: true,
          message: "Success insert data",
        });
      } else {
        return res.status(200).json({
          isSuccess: false,
          message: "Failed insert data",
        });
      }
    }
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: "There Are something Wrong in Our System" + error,
    });
  }
};

exports.getAllProduct = async (param, res) => {
  var rtn = {};
  try {
    var items = await product.getAllProduct(param.body);

    status = 200;
    rtn.isSuccess = true;
    rtn.message = "Success";
    rtn.data = items;
    rtn.total = items.total;
    return res.status(status).json(rtn);
  } catch (error) {
    rtn.isSuccess = false;
    rtn.status = 200;
    rtn.message = "There Are something Wrong in Our System";
    return res.status(200).json(rtn);
  }
};

exports.uploadProductImages = async (param, res) => {
  try {
    var rtn = {};
    var imageUrls = [];
    var form = new formidable.IncomingForm();
    form.parse(param, async (err, fields, files) => {
      if (err) {
        console.error("Error", err);
        return res.status(200).json({
          isSuccess: false,
          message: "Failed Update Profile",
        });
      }

      var userId = param.userId;
      var category = fields.category;
      if (userId === undefined || userId == "") {
        return res.status(200).json({
          isSuccess: false,
          message: "Failed to get profile, please relogin",
        });
      }
      if (category === undefined || category == "") {
        return res.status(200).json({
          isSuccess: false,
          message: "There Are something Wrong in Our System",
        });
      }

      if (files.image1 !== undefined && files.image1 != "") {
        var image1 = await createImageUrl(
          files.image1,
          fields.category,
          userId
        );
        if (image1.error) {
          return res.status(200).json({
            isSuccess: false,
            message: image1.message,
          });
        }

        if (!image1.imageNull) {
          imageUrls.push(image1.filename);
        }
      }
      if (files.image2 !== undefined && files.image2 != "") {
        var image2 = await createImageUrl(
          files.image2,
          fields.category,
          userId
        );
        if (image2.error) {
          return res.status(200).json({
            isSuccess: false,
            message: image2.message,
          });
        }
        if (!image2.imageNull) {
          imageUrls.push(image2.filename);
        }
      }
      if (files.image3 !== undefined && files.image3 != "") {
        var image3 = await createImageUrl(
          files.image3,
          fields.category,
          userId
        );
        if (image3.error) {
          return res.status(200).json({
            isSuccess: false,
            message: image3.message,
          });
        }
        if (!image3.imageNull) {
          imageUrls.push(image3.filename);
        }
      }
      if (files.image4 !== undefined && files.image4 != "") {
        var image4 = await createImageUrl(
          files.image4,
          fields.category,
          userId
        );
        if (image4.error) {
          return res.status(200).json({
            isSuccess: false,
            message: image4.message,
          });
        }
        if (!image4.imageNull) {
          imageUrls.push(image4.filename);
        }
      }
      if (files.image5 !== undefined && files.image5 != "") {
        var image5 = await createImageUrl(
          files.image5,
          fields.category,
          userId
        );
        if (image5.error) {
          return res.status(200).json({
            isSuccess: false,
            message: image5.message,
          });
        }
        if (!image5.imageNull) {
          imageUrls.push(image5.filename);
        }
      }
      if (files.image6 !== undefined && files.image6 != "") {
        var image6 = await createImageUrl(
          files.image6,
          fields.category,
          userId
        );
        if (image6.error) {
          return res.status(200).json({
            isSuccess: false,
            message: image6.message,
          });
        }
        if (!image6.imageNull) {
          imageUrls.push(image6.filename);
        }
      }
      if (files.image7 !== undefined && files.image7 != "") {
        var image7 = await createImageUrl(
          files.image7,
          fields.category,
          userId
        );
        if (image7.error) {
          return res.status(200).json({
            isSuccess: false,
            message: image7.message,
          });
        }
        if (!image7.imageNull) {
          imageUrls.push(image7.filename);
        }
      }
      if (files.image8 !== undefined && files.image8 != "") {
        var image8 = await createImageUrl(
          files.image8,
          fields.category,
          userId
        );
        if (image8.error) {
          return res.status(200).json({
            isSuccess: false,
            message: image8.message,
          });
        }
        if (!image8.imageNull) {
          imageUrls.push(image8.filename);
        }
      }
      if (files.image9 !== undefined && files.image9 != "") {
        var image9 = await createImageUrl(
          files.image9,
          fields.category,
          userId
        );
        if (image9.error) {
          return res.status(200).json({
            isSuccess: false,
            message: image9.message,
          });
        }
        if (!image9.imageNull) {
          imageUrls.push(image9.filename);
        }
      }
      if (files.image10 !== undefined && files.image10 != "") {
        var image10 = await createImageUrl(
          files.image10,
          fields.category,
          userId
        );
        if (image10.error) {
          return res.status(200).json({
            isSuccess: false,
            message: image10.message,
          });
        }
        if (!image10.imageNull) {
          imageUrls.push(image10.filename);
        }
      }
      if (files.image10 !== undefined && files.image10 != "") {
        var image10 = await createImageUrl(
          files.image10,
          fields.category,
          userId
        );
        if (image10.error) {
          return res.status(200).json({
            isSuccess: false,
            message: image10.message,
          });
        }
        imageUrls.push(image10.filename);
      }

      var ins = await product.insertProductImages(
        fields.productId,
        imageUrls,
        fields.isAnonymous
      );
      if (ins.affectedRows > 0) {
        notification.notificationAddImage({
          fromUserId: userId,
          productId: fields.productId,
          isAnonymous: fields.isAnonymous,
        });
        return res.status(200).json({
          isSuccess: true,
          message: "Success",
          // files: files
        });
      } else {
        return res.status(200).json({
          isSuccess: false,
          message: "There Are something Wrong in Our System",
          // files: files
        });
      }
    });
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: "There Are something Wrong in Our System",
    });
  }
};

exports.getProductbyId = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (param.userId === undefined || param.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    } else {
      var items = await product.getProductById(req);
      return res.status(200).json({
        isSuccess: true,
        message: "Success",
        data: items,
      });
    }
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: "Something Error in Our System, please Contact Administrator.!",
    });
  }
};

exports.getProductTopImagesById = async (param, res) => {
  try {
    var userId = param.userId;
    if (userId == undefined || userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    } else {
      var items = await product.getProductTopImagesById(param.body);
      return res.status(200).json({
        isSuccess: true,
        message: "Success",
        data: items,
        total: items.total,
        surplusImages: items.surplusImages,
      });
    }
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: "Something Error in Our System, please Contact Administrator.!",
    });
  }
};

exports.getAllImageByProductId = async (param, res) => {
  try {
    var userId = param.userId;
    param.body.userId = userId;
    if (userId == undefined || userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    } else {
      var items = await product.getAllImageByProductId(param.body);
      return res.status(200).json({
        isSuccess: true,
        message: "Success",
        data: items,
        total: items.total,
      });
    }
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: "Something Error in Our System, please Contact Administrator.!",
    });
  }
};

exports.getProductPosted = async (param, res) => {
  var rtn = {};
  var req = param.body;

  try {
    if (param.userId === "" || param.userId === undefined) {
      return res
        .status(401)
        .json(
          responseHelper.FailWithMessage(
            "Failed to get profile, please relogin.!"
          )
        );
    }
    req.userId = req.userId === undefined || "" ? param.userId : req.userId;
    var items = await product.getProductPosted(req);
    rtn.isSuccess = true;
    rtn.message = "Success";
    rtn.data = items;
    rtn.total = items.total;
    return res.status(200).json({
      isSuccess: true,
      message: "Success",
      data: items,
      total: items.total,
    });
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: "Something Error in Our System, Please Contact Administrator.! ",
    });
  }
};

exports.getReviewsPosted = async (param, res) => {
  var rtn = {};
  var req = param.body;
  try {
    if (param.userId === undefined || param.userId === "") {
      return res
        .status(401)
        .json(
          responseHelper.FailWithMessage(
            "Failed to get profile, please contanct Administrator!"
          )
        );
    }
    req.userId =
      req.userId === undefined || req.userId === "" ? param.userId : req.userId;
    var items = await product.getReviewsPosted(req);
    rtn.isSuccess = true;
    rtn.message = "Success";
    rtn.data = items;
    rtn.total = items.total;
    return res.status(200).json(rtn);
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message:
        "Something Error in Our System, Please Contact Administrator.! " +
        error,
    });
  }
};

exports.getQuestionPosted = async (param, res) => {
  var rtn = {};
  var req = param.body;
  try {
    if (param.userId === undefined || param.userid === "") {
      return res
        .status(401)
        .json(
          responseHelper.FailWithMessage(
            "Failed to get profile, please relogin.!"
          )
        );
    }

    req.userId =
      req.userId === undefined || req.userId === "" ? param.userId : req.userId;
    var items = await product.getQuestionPosted(req);
    rtn.isSuccess = true;
    rtn.message = "Success";
    rtn.data = items;
    rtn.total = items.total;
    return res.status(200).json(rtn);
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message:
        "Something Error in Our System, Please Contact Administrator.! " +
        error.message,
    });
  }
};

exports.getQuestionAnswered = async (param, res) => {
  var rtn = {};
  var req = param.body;
  try {
    if (param.userId === undefined || param.userId === "") {
      return res
        .status(401)
        .json(
          responseHelper.FailWithMessage(
            "Failed to get profile, please relogin!"
          )
        );
    }
    req.userId =
      req.userId === undefined || req.userId === "" ? param.userId : req.userId;
    var items = await product.getQuestionAnswered(req);
    rtn.isSuccess = true;
    rtn.message = "Success";
    rtn.data = items;
    rtn.total = items.total;
    return res.status(200).json(rtn);
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: "Something Error in Our System, Please Contact Administrator.! ",
    });
  }
};

exports.searchMatchProduct = async (param, res) => {
  var rtn = {};
  var req = param.body;
  try {
    var items = await product.searchMatchProduct(req);
    rtn = responseHelper.Success(items);

    return res.status(200).json(rtn);
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.disableProductByAdmin = async (param, res) => {
  try {
    var req = param.body;
    var item = await product.disableProduct(req.productId);
    var usr = await product.getUserByProductId(req);
    if (item.affectedRows > 0) {
      if (usr[0].email != null && usr[0].email != "") {
        email.sendMail(
          usr[0].email,
          "Your Product Post Disabled by Admin",
          `Your post on "${usr[0].productName}" has been removed, you may want to check our Terms & Conditions. ${usr[0].email}`
        );
      }
      req.userId = usr[0].id;

      notification.notificationDisableProduct({
        productId: req.productId,
        fromUserId: req.userId,
      });
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    } else {
      return res
        .status(200)
        .json(
          responseHelper.FailWithMessage("Data not found or has been disabled")
        );
    }
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.enableProduct = async (param, res) => {
  try {
    var ins = await product.enableProduct(param.body.productId);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Fail to enable product, please contact Administrator.!"
        )
      );
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.followProduct = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    }
    var ins = await product.followProduct(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to follow, please contact Administrator.!"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.unfollowProduct = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    }
    var ins = await product.unfollowProduct(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          "Failed to unfollow, please contact Administrator.!"
        )
      );
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

// exports.saveProductImages = async (param, res) => {
//     try {

//     } catch (error) {

//     }
// }

exports.reportProduct = async (param, res) => {
  try {
    req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == "") {
      return res.status(200).json({
        isSuccess: false,
        message: "Failed to get profile, please relogin",
      });
    }
    var item = await product.reportProduct(req);
    if (item.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(responseHelper.FailWithMessage("Failed to report product!"));
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};
exports.getAllReportedProduct = async (param, res) => {
  try {
    console.log("test");
    var item = await product.getAllReportedProduct(param.body);

    return res.status(200).json(responseHelper.Success(item));
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.getAllProductRepots = async (param, res) => {
  try {
    console.log("test");
    var item = await product.getAllProductRepots(param.body);

    return res.status(200).json(responseHelper.Success(item));
  } catch (error) {
    console.log(error.message);
    return res.status(200).json(responseHelper.Fail());
  }
};

async function createImageUrl(image, category, userId) {
  var baseUrl = conf.base_url;
  var imageFolder = conf.folderReview + "/" + category;
  var imageBaseUrl = baseUrl + "/" + imageFolder;
  if (image.name == "" || image.name == undefined) {
    return {
      error: true,
    };
  }
  var check = {
    filename: "",
  };
  check = await uploadfile.uploadImage(image, userId, imageFolder);
  console.log(check);
  if (check.error) {
    return check;
  }

  check.filename = imageBaseUrl + "/" + check.filename;
  return check;
}
