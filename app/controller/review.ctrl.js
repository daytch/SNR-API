const review = require('../model/review');
const {
  notificationWriteReview,
  notificationNotifyPostReview,
} = require('./notification.ctrl');
const responseHelper = require('../helper/response.helper');
const notification = require('./notification.ctrl');
const { uploadfile } = require('../middlewares');
const formidable = require('formidable');
const conf = require('../config/upload.config');

exports.insertReview = async (param, res) => {
  var req = param.body;
  req.userId = param.userId;

  if (req.userId == undefined || req.userId == '') {
    return res.status(200).json({
      isSuccess: false,
      message: 'Failed to get profile, please relogin',
    });
  }
  var ins = await review.insertReview(req);

  if (ins.affectedRows > 0) {
    //notif
    notificationWriteReview({
      fromUserId: req.userId,
      productId: req.productId,
    });
    return res.status(200).json({
      isSuccess: true,
      message: 'Success insert data',
    });
  } else {
    return res.status(200).json({
      isSuccess: false,
      message: 'Failed insert data',
    });
  }
};

exports.insertReviewWithImages = async (param, res) => {
  try {
    var rtn = {};
    var imageUrls = [];
    var form = new formidable.IncomingForm();
    form.parse(param, async (err, fields, files) => {
      if (err) {
        console.error('Error', err);
        return res.status(200).json({
          isSuccess: false,
          message: 'Failed to insert review',
        });
      }
      var userId = param.userId;
      if (userId === undefined || userId == '') {
        return res.status(200).json({
          isSuccess: false,
          message: 'Failed to get profile, please relogin',
        });
      }

      var reqReview = {
        description: fields.description,
        rate: fields.rate,
        productId: fields.productId,
        userId: userId,
        isAnonymous: fields.isAnonymous,
      };

      var ins = await review.insertReview(reqReview);

      if (ins.affectedRows > 0) {
        //notif
        // notificationWriteReview(reqReview);
        notificationWriteReview({
          fromUserId: reqReview.userId,
          productId: reqReview.productId,
        });
        notificationNotifyPostReview({
          userId: reqReview.userId,
          productId: reqReview.productId,
        });

        // return res.status(200).json({
        //     isSuccess: true,
        //     message: "Success insert data"
        // });
      }
      var userId = param.userId;

      //check image1

      if (files.image1 !== undefined && files.image1 != '') {
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
      if (files.image2 !== undefined && files.image2 != '') {
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
      if (files.image3 !== undefined && files.image3 != '') {
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
      if (files.image4 !== undefined && files.image4 != '') {
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
      if (files.image5 !== undefined && files.image5 != '') {
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
      if (files.image6 !== undefined && files.image6 != '') {
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
      if (files.image7 !== undefined && files.image7 != '') {
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
      if (files.image8 !== undefined && files.image8 != '') {
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
      if (files.image9 !== undefined && files.image9 != '') {
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
      if (files.image10 !== undefined && files.image10 != '') {
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
      if (imageUrls.length > 0) {
        ins = await review.insertReviewImages(ins.insertId, imageUrls);
      }

      if (ins.affectedRows > 0) {
        return res.status(200).json({
          isSuccess: true,
          message: 'Success',
          // files: files
        });
      } else {
        return res.status(200).json({
          isSuccess: false,
          message: 'There Are something Wrong in Our System',
          // files: files
        });
      }
    });
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: 'There Are something Wrong in Our System',
      messageError: error.message,
    });
  }
};

exports.getAllReviewReports = async (param, res) => {
  try {
    var items = await review.getAllReviewReports(param.body);

    return res.status(200).json(responseHelper.Success(items));
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: 'There Are Something Wrong in Our System',
    });
  }
};
exports.getAllReviewbyProduct = async (param, res) => {
  var rtn = {};
  try {
    param.body.userId = param.userId
    var items = await review.getAllReviewbyProduct(param.body);

    status = 200;
    rtn.isSuccess = true;
    rtn.message = 'Success';
    rtn.data = items;
    rtn.total = items.total;
    return res.status(status).json(rtn);
  } catch (error) {
    (rtn.isSuccess = false), (rtn.status = 200);
    rtn.message = 'There Are Something Wrong in Our System';
    return res.status(200).json(error.message);
  }
};

exports.countViewReview = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == '') {
      return res.status(200).json({
        isSuccess: false,
        message: 'Failed to get profile, please relogin',
      });
    }
    var countedView = await review.findCountedViewReview(req);
    if (countedView.length > 0) {
      return res.status(200).json({
        isSuccess: true,
        message: 'Already Vote',
      });
    } else {
      var ins = await review.insertReviewView(req);
      if (ins.affectedRows > 0) {
        return res.status(200).json({
          isSuccess: true,
          message: 'Success insert data',
        });
      } else {
        return res.status(200).json({
          isSuccess: false,
          message: 'Failed insert data',
        });
      }
    }
  } catch (error) {
    return res.status(200).json({
      isSuccess: false,
      message: 'Failed to insert data',
    });
  }
};

exports.countviewComment = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == '') {
      return res.status(200).json({
        isSuccess: false,
        message: 'Failed to get profile, please relogin',
      });
    }
    var ins = await review.countViewComment(req);
    if (ins.affectedRows > 0) {
      return res.status(200).json({
        isSuccess: true,
        message: 'Success insert data',
      });
    } else {
      return res.status(200).json({
        isSuccess: false,
        message: 'Failed insert data',
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ isSuccess: false, message: 'Failed to insert data' });
  }
};

exports.countUpvoteReview = async (param, res) => {
  var req = param.body;
  req.userId = param.userId;
  var req = param.body;
  req.userId = param.userId;
  if (req.userId == undefined || req.userId == '') {
    return res.status(200).json({
      isSuccess: false,
      message: 'Failed to get profile, please relogin',
    });
  }
  var hasCounted = await review.isUserhasCountedvote(req);
  if (hasCounted.length > 0) {
    var del = await review.deletCountedVoteReview(hasCounted[0].id);
    if (del.affectedRows > 0) {
      return res.status(200).json({
        isSuccess: true,
        message: 'Success insert data',
        isUpvoted: false,
      });
    } else {
      return res.status(200).json({
        isSuccess: false,
        message: 'Failed insert data',
      });
    }
  } else {
    var ins = await review.countUpvote(req);
    if (ins.affectedRows > 0) {
      notification.notificationReviewUpvote({
        fromUserId: req.userId,
      });
      return res.status(200).json({
        isSuccess: true,
        message: 'Success insert data',
        isUpvoted: true,
      });
    } else {
      return res.status(200).json({
        isSuccess: false,
        message: 'Failed insert data',
      });
    }
  }
};

exports.countUpvoteReviewComment = async (param, res) => {
  var req = param.body;
  req.userId = param.userId;
  var req = param.body;
  req.userId = param.userId;
  try {
    if (req.userId == undefined || req.userId == '') {
      return res.status(200).json({
        isSuccess: false,
        message: 'Failed to get profile, please relogin',
      });
    }
    var hasCounted = await review.isUserhasCountedvoteReviewComment(req);
    if (hasCounted.length > 0) {
      var del = await review.deleteCountedVoteReviewComment(hasCounted[0].id);
      if (del.affectedRows > 0) {
        return res.status(200).json({
          isSuccess: true,
          message: 'Success insert data',
          isUpvoted: false,
        });
      }
      return res.status(200).json({
        isSuccess: false,
        message: 'user has been voted',
      });
    } else {
      var ins = await review.countUpvoteReviewComment(req);
      if (ins.affectedRows > 0) {
        // notification.notificationReviewUpvote(req);
        return res.status(200).json({
          isSuccess: true,
          message: 'Success insert data',
          isUpvoted: true
        });
      } else {
        return res.status(200).json({
          isSuccess: false,
          message: 'Failed insert data',
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ isSuccess: false, message: error.message });
  }
};

exports.GetallReviewComments = async (param, res) => {
  var rtn = {};
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == '') {
      return res.status(200).json({
        isSuccess: false,
        message: 'Failed to get profile, please relogin',
      });
    }
    var items = await review.GetallReviewComments(param.body);
    rtn = {
      data: items,
      total: items.total,
      isSuccess: true,
      message: 'Success',
    };
    return res.status(200).json(rtn);
  } catch (error) {
    (rtn.isSuccess = false), (rtn.status = 200);
    rtn.message = 'There Are somethign Wrong in Our System' + error;
    return res.status(200).json(rtn);
  }
};

exports.insertReport = async (param, res) => {
  try {
    req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == '') {
      return res.status(200).json({
        isSuccess: false,
        message: 'Failed to get profile, please relogin',
      });
    }
    var item = await review.insertReport(req);
    if (item.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    } else {
      return res
        .status(200)
        .json(
          responseHelper.FailWithMessage(
            'Failed to report data, please contact Administrator !'
          )
        );
    }
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.getAllReviewReported = async (param, res) => {
  try {
    var item = await review.getAllReviewReported(param.body);
    return res.status(200).json(responseHelper.Success(item));
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.disableReview = async (param, res) => {
  try {
    var item = await review.disableReview(param.body);
    if (item.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          'Failed to update, please contact Administrator !'
        )
      );
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.reportReviewComment = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == '') {
      return res.status(200).json({
        isSuccess: false,
        message: 'Failed to get profile, please relogin',
      });
    }
    var item = await review.reportReviewComment(req);
    if (item.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          'Failed to report comment, please contact Administrator !'
        )
      );
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.insertComment = async (param, res) => {
  try {
    var req = param.body;
    req.userId = param.userId;
    if (req.userId == undefined || req.userId == '') {
      return res.status(200).json({
        isSuccess: false,
        message: 'Failed to get profile, please relogin',
      });
    }
    var ins = await review.inserReviewComment(req);
    if (ins.affectedRows > 0) {
      notification.notificationReviewComment({
        fromUserId: fromUserId,
      });
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          'Failed to inser comment on review, please contact Administrator.!'
        )
      );
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.disableReviewComment = async (param, res) => {
  try {
    var item = await review.disableReviewComment(param.body);
    if (item.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          'Faile to disable comment, please contact Administrator !'
        )
      );
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.enableReviewComment = async (param, res) => {
  try {
    var item = await review.enableReviewComment(param.body);
    if (item.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          'Faile to enable comment, please contact Administrator !'
        )
      );
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.enableReview = async (param, res) => {
  try {
    var item = await review.enableReview(param.body);
    if (item.affectedRows > 0) {
      return res.status(200).json(responseHelper.SuccessWithEmptyData());
    }
    return res
      .status(200)
      .json(
        responseHelper.FailWithMessage(
          'Faile to enable review, please contact Administrator !'
        )
      );
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

exports.getAllReviewCommentsReported = async (param, res) => {
  try {
    var item = await review.getAllReviewCommentsReported(param.body);
    return res.status(200).json(responseHelper.Success(item));
  } catch (error) {
    return res.status(200).json(responseHelper.Fail());
  }
};

async function createImageUrl(image, category, userId) {
  var baseUrl = conf.base_url;
  var imageFolder = conf.folderReview + '/' + category;
  var imageBaseUrl = baseUrl + '/' + imageFolder;
  if (image.name == '' || image.name == undefined) {
    return {
      imageNull: true,
    };
  }
  var check = {
    filename: '',
  };
  check = await uploadfile.uploadImage(image, userId, imageFolder);

  if (check.error) {
    return check;
  }

  check.filename = imageBaseUrl + '/' + check.filename;
  return check;
}
