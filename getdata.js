var request = require("request");
var fs = require("fs");
var async = require("async");
var Models = require("./models");
var mongoose = require("mongoose");
var log = require("./lib/logger").getLogger();





var ParseRecord = Models.ParseRecord;

var now = Date.now();

var startDate = Date.parse("2015-01-01");
startDate = new Date(startDate);



function startOne(){
    var day = startDate.getDate();
    startDate.setDate(day+1);
    start(startDate);
}

function start(date){
    if(date.valueOf() < now){
        var day = date.getDate();
        var month = date.getMonth();
        month = month + 1;
        if(month < 10){
            month = "0" + month;
        }
        var dayInt = day;
        if(day < 10){
            day = "0" + day;
        }
        var fileName = date.getFullYear() + "-" + month + "-" + day;
        var filePath = "data/" + fileName;
        async.waterfall([function(cb){

            var query = {name:filePath,complete:true};
            ParseRecord.findOne(query, function(err, doc){

                cb(null, doc)
            });
        }, function(exists, cb){
            if(exists){
                cb(null);
            }else{

                var url = "http://trade.500.com/jczq/?date=" + fileName  +"&playtype=both"
                request({pool:{maxSockets: 200},url:url,method:"GET",encoding:null}, function(err, res, body){

                    cb(err, body);



                });

            }
        }], function(err, body){


            if(body){

                console.log("filePath request complete, %s", filePath);
                fs.writeFile(filePath,body, function(err){

                    startOne()
                })
            }else{
                console.log("filePath exists , %s", filePath);
                startOne();
            }

        });




    }
    else{
         console.log("complete date is %s", date);
        //process.exit(0);

        return

    }


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


    startOne();
    startOne();
    startOne();
    startOne();

});


