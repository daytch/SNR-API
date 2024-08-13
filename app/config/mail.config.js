const conf = {
    host: 'mail.nurulhidayat.com',
    port: 587,
    auth: {
       user: 'admin_snr@nurulhidayat.com',
       pass: 'BuruanCair40%'
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