// const ROLES = require('../models/role');
// const User = require('../models/user');


// checkDuplicateUsernameOrEmail = async (req, res, next) => {
//     await User
//         .where({ 'email': req.body.email })
//         .count('*')
//         .then(count => {
//             console.log(count);
//             if (count > 0) {
//                 res.status(400).send({
//                     message: "Failed! Email is already in use!"
//                 });
//                 return;
//             }
//             next();
//         });

//     next();
// };

// checkRolesExisted = async (req, res, next) => {
//     console.log('checkRolesExisted, req :' + req);
//     if (req.body.roles) {
//         ROLES.where('name', 'in', req.body.roles)
//             .count('*')
//             .then(count => {
//                 if (count < 1) {
//                     res.status(400).send({
//                         message: "Failed! Role does not exist!"
//                     });
//                     return;
//                 }
//                 next();
//             })
//     }

//     next();
// };

// const verifySignUp = {
//     checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
//     checkRolesExisted: checkRolesExisted
// };

// module.exports = verifySignUp;