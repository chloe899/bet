
var request = require("request");
var log = require("../lib/logger").getLogger();
var fs = require("fs");

var url = "https://translate.google.com/translate_tts?ie=UTF-8&q=%CF%80%CF%8E%CF%82%20%CE%B5%CE%AF%CF%83%CE%B1%CE%B9&tl=el&total=1&idx=0&textlen=9&client=t";


request({url:url,encoding:null}, function(err, res, body){


    log.debug(res.headers);
    log.debug(err);
    log.debug(body);

    fs.writeFile("tmp/aa.mpg",body, function(err, result){

       log.debug(arguments);
    });


});