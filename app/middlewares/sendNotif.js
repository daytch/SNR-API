const admin = require("firebase-admin");
const serviceAccount = require("../../fbase/snapnreviewtrial-firebase-adminsdk-zzdz7-f2a7e4440a.json");
const apn = require("apn");
const users = require("../model/users");

exports.init = async () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase init");
}

exports.process = async (userId, title, body, deeplink) => {
    var android = await users.getLastToken(userId, "android");
    var token_and = "";
    for (var a of android) {
        token_and = a.token;
    }
    if (token_and != "") {
        var data = {
            title: title,
            body: body,
            deeplink: deeplink
        }
        this.pushAndroid(token_and, data);
    }

    var ios = await users.getLastToken(userId, "ios");
    var token_ios = "";
    for (var i of ios) {
        token_ios = i.token;
    }
    if (token_ios != "") {
        var data = {
            "alert": title,
            "badge": 1,
            "sound": "default",
            "deeplink": deeplink
        }
        this.pushIos(token_ios, data);
    }
}

// exports.processBulk = async (userIds, title, body, deeplink) => {
//     for (let id in userIds) {
//         try {

//         } catch (error) {

//         }
//     }

// }

exports.pushAndroid = async (token, data) => {
    var message = {
        //         data: {
        //             title: "Your password was changed",
        //             body: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt",
        //             // image: "optional",
        //             deepLink: "pito://video?video_id=1"
        //         },
        data: data,
        token: token
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });

    return true;
}

exports.pushIos = async (token, data) => {
    var options = {
        pfx: appRoot + "/ioscert/certif.p12",
        production: true
    };

    var apnConnection = new apn.Provider(options);

    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.rawPayload = {
        // "aps" : {
        //     "alert" :"Testing.. (15)",
        //     "badge" : 1,
        //     "sound":"default",
        //     "deeplink": "pito://video?video_id=1"
        // }
        "aps": data
    }
    note.topic = "com.snr";

    apnConnection.send(note, token).then((result) => {
        // see documentation for an explanation of result
        // console.log("result",result);
        if (result.failed.length > 0) {
            console.log("response", result.failed[0].response);
        }
    });

    return true;
}