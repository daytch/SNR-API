const conf = {
    host: 'smtp.office365.com',
    port: 587,
    auth: {
       user: 'victor.simamora@outlook.com',
       pass: 'Victo512*'
    },
    tls: { 
        rejectUnauthorized: false 
    }
}
// const conf = {
//     host: 'smtpout.secureserver.net',
//     port: 587,
//     auth: {
//         user: 'notifications@snapnreview.com',
//         pass: 'Snr91255130*'
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// }
module.exports = conf;