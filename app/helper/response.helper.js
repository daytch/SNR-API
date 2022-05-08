function SuccessWithEmptyData(){
    return {
        isSuccess: true,
        message :"Success",
    }
}

function Success(items) {
    var rtn = {};

    rtn.isSuccess = true;
    rtn.message = "Success";
    rtn.data = items;
    if (items.total !== undefined) {
        rtn.total = items.total;
    }
    return rtn;

}

function Fail() {
    var rtn = {
        isSuccess: false,
        message: "Something Error in Our System, Please Contact Administrator.! "
    };
    return rtn;
}

function FailWithMessage( message){
    var rtn = {
        isSuccess: false,
        message: message
    };
    return rtn;
}



const responseHelper = {
    Success: Success,
    Fail : Fail,
    FailWithMessage : FailWithMessage,
    SuccessWithEmptyData: SuccessWithEmptyData
}


module.exports = responseHelper;