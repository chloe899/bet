var request = require("request");
var fs = require("fs");
var async = require("async");
var Models = require("./models");
var mongoose = require("mongoose");
var log = require("./lib/logger").getLogger();
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

    function startDownload(complete){



        complete = complete || 0;
        var size = 1000;
        async.waterfall([function(cb){

            Models.RequestPlan.find({"complete":{"$ne":true},
                "$or":[{"download_times":{"$lt":500}},{"download_times":{"$exists":false}}]}).sort({last_modified:1}).skip(complete).limit(size).exec(function(err, docs){

                cb(err, docs);
            });


        }], function(err, arr){

            log.debug(arguments);
            async.eachLimit(arr, 30, function(item, cb){

                start(item,function(){
                    cb(null);
                });
            }, function(err, results){
                if(err){
                    log.error(err);
                    log.error("there is an error");
                    process.exit(0);
                    return;
                }
                if(arr.length < size){

                    if(complete == 0 && arr.length == 0){
                        log.debug("no plan");

                    }else{
                        log.debug("all request complete, %s files download", complete + arr.length);
                    }

                    process.exit(0);
                }else{

                    startDownload(complete + size);
                }


            });


        });








    }

    startDownload();



});


