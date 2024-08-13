var express = require('express'),
    app = express(),
    port = process.env.PORT || 5225,
    bodyParser = require('body-parser'),
    cors = require("cors"),
    path = require("path");

app.use("*", cors());
app.use('/pic', express.static(__dirname+'/pic'))
// app.use('/pic', express.static(__dirname+'/Img'))
app.use('/Img', express.static(__dirname+'/Img'))
// app.use('/Img', express.static('Img'))
// app.use('/Img', express.static(__dirname+'/img'))
// app.use('/image', express.static('img'))
// app.use('/image', express.static(__dirname+'/image'))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));

var routes = require('./routes');
routes(app);

global.appRoot = path.resolve(__dirname);
app.listen(port);
console.log('RESTful API server started on: ' + port);



// var { sendNotif } = require("./app/middlewares");
// sendNotif.init();

// Job Notification
// var videos = require("./app/controller/videos.ctrl");
// setInterval(() => {
//     videos.jobVideo();
// }, 300000);