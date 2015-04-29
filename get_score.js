var request = require("request");
var fs = require("fs");
var async = require("async");
var Models = require("./models");
var mongoose = require("mongoose");
var iconv = require("iconv-lite");
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

function getScore(match, callback){
    var link = match.data.href;



    // Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
    //User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.94 Safari/537.36
   // Accept-Encoding: gzip,deflate,sdch
    //Accept-Language: zh-CN,zh;q=0.8,en;q=0.6,es;q=0.4

   /* Accept-Encoding: gzip,deflate,sdch
    Accept-Language: zh-CN,zh;q=0.8,en;q=0.6,es;q=0.4*/
     //*/
    async.waterfall([function(cb){
        var options = {pool:{maxSockets: 200},gzip:true,url:link,method:"GET",encoding:null};
        var headers = {};
        headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
        headers["User-Agent"] = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.94 Safari/537.36";
        headers["Accept-Language"] = "zh-CN,zh;q=0.8,en;q=0.6,es;q=0.4";
        headers["Accept-Encoding"] = "gzip,deflate,sdch";
        headers["Host"] = "odds.500.com";
        options.headers = headers;
        request(options, function(err, res, body){

            log.debug("request %s complete", link);
            cb(err, body);



        });

    },function(buffer, cb){
        buffer = iconv.decode(buffer,"GBK");
        cb(null,buffer.toString());

    }], function(err, content){
        var reg = /odds_hd_bf[^<]+<strong>(([\s\S](?!<\/strong>))*[\s\S]?)<\/strong>/g;
        var score = reg.exec(content);
        //log.debug("score is %s", score);
        log.debug("link is %s", link);

        if(score && /\d/.test(score)){
            score = score[1];
            log.debug("score is %s", score);
            score = score.split(":");
            match.data.team_info.home_team.score = score[0];
            match.data.team_info.visit_team.score = score[1];

            score = {home:score[0],visit:score[1]};
        }else{
            score = null;
        }
        callback(null, match, score);




    });





}

function start(){

    var Match = Models.Match;
    async.waterfall([function(cb){

        var q = {"data.team_info.complete":{"$ne":true}};
        q["data.team_info.match_date"] = {"$lt":new Date};
        Match.find(q, function(err, matches){
             log.debug(matches.length);

            cb(err, matches);



        });

    }], function(err, matches){

       async.each(matches, function(match,cb){

           getScore(match, function(err, match, score){
               log.debug(score);
               if(score){

                   match.data.team_info.complete = true;
                   Match.update({_id:match._id},{"$set":{data:match.data}}, function(err, result){
                       log.debug("save complete");
                       cb();
                   });

               }else{
                   cb();
               }
           })

       }, function(err, results){

           log.debug("complete");
           process.exit(0);
       });

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




   start();

});


