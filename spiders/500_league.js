var request = require("request");
var fs = require("fs");
var async = require("async");
var Models = require("./models");
var mongoose = require("mongoose");
var log = require("../lib/logger").getLogger();
var now = Date.now();






function start(item, callback){


    var filePath = item.file_path;

    var url = item.url;
    async.waterfall([

        function(cb){

            //var url = "http://trade.500.com/jczq/?date=" + fileName  +"&playtype=both";
            log.debug(url);
            request({pool:{maxSockets: 20},url:url,method:"GET",encoding:null}, function(err, res, body){

                log.debug(err);
                cb(err, body);



            });


        }], function(err, body){

        if(err){
            log.error(err);
        }
        if(body){

            log.debug("filePath request complete, %s", filePath);
            //log.debug(body);
            fs.writeFile(filePath, body, function(err){
                log.debug(err);
                item.complete = true;
                item.last_modifed = new Date();
                item.download_times = item.download_times || 0;
                item.download_times++;
                item.save(function(err){

                    callback(err);
                });


            })
        }else{
            console.log("filePath exists , %s", filePath);
            callback();
        }

    });







}

async.waterfall([function(cb){


    var db = mongoose.connection;
    db.on("error",function(err){
        log.error(err.stack || err);
    });
    mongoose.connect("mongodb://localhost/lottery", function(err, db){
        cb(err, db);
    });



}], function(err, result){


    log.debug("start");

    function startDownload(complete) {





    }

    startDownload();



});


