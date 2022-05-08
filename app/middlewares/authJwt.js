const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

function verifyToken (req, res, next) {
    // console.log(req.headers);
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            res.status(401).send({
                message: err// "Unauthorized!"
            });
            return err;
        }

        req.userId = decoded.id;
        req.roleName = decoded.role;
        
        // console.log(decoded);
        next();
    });
};

function verifyTokenX (req, res, next, callback) {
    // console.log(req.headers);
    let token = req.headers["x-access-token"];
    
    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            res.status(401).send({
                message: err// "Unauthorized!"
            });
            return err;
        }

        req.userId = decoded.id;
        req.roleName = decoded.role;
        // console.log(decoded);
        callback();
    });
};

function verifyTokenResetPass (req, res, next, callback) {
    // console.log(req.headers);
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            res.status(401).send({
                message: err// "Unauthorized!"
            });
            return err;
        }

        req.email = decoded.email;
        req.desc = decoded.desc;
        // console.log(decoded);
        callback();
    });
};

isUser = (req,res,next) => {
    // var err = verifyToken(req,res,next);
    // if(err != null && err == true){
    //     if(!req.roleName.includes("User")){
    //         return res.status(401).send({
    //             message: "Unauthorized Token"// "Unauthorized!"
    //         });
    //     }
    //     next();
    // }
    // else {
    //     return false;
    // }
    verifyTokenX(req,res,next, () => {
        if(!req.roleName.includes("User")){
            return res.status(401).send({
                message: "Unauthorized Token"// "Unauthorized!"
            });
        }
        next();
    });
};

isMerchant = (req,res,next) => {
    // var err = verifyToken(req,res,next);
    // // if(err != null && err == true){
    //     console.log(req.roleName);
    //     if(!req.roleName.includes("Merchant")){
    //         return res.status(401).send({
    //             message: "Unauthorized Token"// "Unauthorized!"
    //         });
    //     }
    //     next();
    // // }
    // // else {
    // //     return false;
    // // }
    verifyTokenX(req,res,next, () => {
        if(!req.roleName.includes("Merchant")){
            return res.status(401).send({
                message: "Unauthorized Token"// "Unauthorized!"
            });
        }
        next();
    });
};

isAdmin = (req,res,next) => {
    verifyTokenX(req,res,next, () => {
        if(!req.roleName.includes("Admin")){
            return res.status(401).send({
                message: "Unauthorized Token"// "Unauthorized!"
            });
        }
        next();
    });
};

isResetPassword = (req,res,next) => {
    verifyTokenResetPass(req,res,next, () => {
        if(req.email == ""){
            return res.status(401).send({
                message: "Unauthorized Token"// "Unauthorized!"
            });
        }
        next();
    });
};

getUserId = async(req,res) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            res.status(401).send({
                message: err// "Unauthorized!"
            });
            return err;
        }

        return decoded.id;
    });
};

// isAdmin = (req, res, next) => {
//     User.where('id',req.userId)
//     .fetch()
//     .then(user=>{

//     })
//     User.findByPk(req.userId).then(user => {
//         user.getRoles().then(roles => {
//             for (let i = 0; i < roles.length; i++) {
//                 if (roles[i].name === "admin") {
//                     next();
//                     return;
//                 }
//             }

//             res.status(403).send({
//                 message: "Require Admin Role!"
//             });
//             return;
//         });
//     });
// };

// isMerchant = (req, res, next) => {
//     User.findByPk(req.userId).then(user => {
//         user.getRoles().then(roles => {
//             for (let i = 0; i < roles.length; i++) {
//                 if (roles[i].name === "moderator") {
//                     next();
//                     return;
//                 }
//             }

//             res.status(403).send({
//                 message: "Require Moderator Role!"
//             });
//         });
//     });
// };

// isMerchantOrAdmin = (req, res, next) => {
//     User.findByPk(req.userId).then(user => {
//         user.getRoles().then(roles => {
//             for (let i = 0; i < roles.length; i++) {
//                 if (roles[i].name === "moderator") {
//                     next();
//                     return;
//                 }

//                 if (roles[i].name === "admin") {
//                     next();
//                     return;
//                 }
//             }

//             res.status(403).send({
//                 message: "Require Moderator or Admin Role!"
//             });
//         });
//     });
// };

const authJwt = {
    isUser : isUser,
    isAdmin: isAdmin,
    isMerchant: isMerchant,
    isResetPassword : isResetPassword,
    getUserId : getUserId
};
module.exports = authJwt;