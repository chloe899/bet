var fs = require("fs");
var util = require("./lib/common");
var async = require("async");
var iconv = require("iconv-lite");
var log = require("./lib/logger").getLogger();
var mongoose = require("mongoose");
var Models = require("./models/");
var Game = Models.Game;
var _ = require("underscore");



//var startDate = Date.parse("2015-04-13");
var startDate = Date.parse("2011-04-01");
startDate = new Date(startDate);



function startOne(){
    var day = startDate.getDate();
    startDate.setDate(day+1);
    start(startDate);
}

var gameFound = 0;
var pathArr = [];


function parseRate(trContent){


    function formatKey(key){
        var reg = /<span[^>]+>([^<]+)<\/span>/;
        key  = key || "";
        key = key.replace(reg, function(a,b){
            return b;
        });

        return key;


    }

    var reg  = /<p[\s]*class="concede[^"]*">(([\s\S](?!<\/p>))*[\s\S]?)<\/p>/g;
    var rateResult  = reg.exec(trContent);
    var rate = {};
    var key = rateResult[1];

    if(key){
        rate[key] = {};
    }

    rateResult  = reg.exec(trContent);
    var key2 = key;
    if(rateResult){
        key2 = rateResult[1];
        key2 = formatKey(key2);
        rate[key2] = {};
    }





    var valReg = /([^\s=]+)="([^"]+)"/g;

    var rate1Reg = /<div\s*class="bet_odds">(([\s\S](?!<\/div>))*[\s\S]?)<\/div>/g;
    var rate2Reg = /<div\s*class="bet_odds\s*bet_odds_2">(([\s\S](?!<\/div>))*[\s\S]?)<\/div>/g;
    var regs = [[key,rate1Reg], [key2,rate2Reg]];
    var setObj = rate[key];
    //log.debug("key1 = %s, key2 = %s",key,key2);
    _.each(regs, function(item,i){
        var reg = item[1];
        var name = item[0];
        var  rateReg = /<span[\s]*class="odds_item[^<]+<\/span[^>]*>/g;
        setObj = rate[name];

        var rateBoxContent = reg.exec(trContent);

        rateBoxContent = rateBoxContent && rateBoxContent[0];
        //log.debug(rateBoxContent);
        var rateVal = rateReg.exec(rateBoxContent);
        while(rateVal){
            var content = rateVal[0];
            var subVal = valReg.exec(content);
            var tempObj = {};
            while(subVal){
                var subKey = subVal[1];
                var keyVal = subVal[2];
                tempObj[subKey] = keyVal;
                //log.debug("key is:%s, val is:%s", key, keyVal);
                subVal = valReg.exec(content);

            }
            var rateKey = tempObj["value"];
            setObj[rateKey] = tempObj["data-sp"];
            rateVal = rateReg.exec(rateBoxContent);
        }

    });
    //log.debug(rate);


    //log.debug(rate);
    return rate;

}


function parseGameInfo(trContent){
    var leftReg = /<td[\s]*class="left_team"(([\s\S](?!<\/td>))+[\s\S])<\/td>/g;
    var visitReg = /<td[\s]*class="right_team"(([\s\S](?!<\/td>))+[\s\S])<\/td>/g;
    var end_timeReg = /<span\s*class="match_time"\s*title="开赛时间：([^"]+)"/g;
    var valReg = /([^\s=]+)="([^"]+)"/g;
    var tdReg = /<td([^]+)>/;
    valReg.lastIndex = 0;
    var scoreReg = /<a[\s]*class="score"[^>]+>(\d+):(\d+)<\/a>/g;
    var tdContent;
    var dataArr =  _.map([leftReg,visitReg], function(reg){

        var result = {};
        var leftContent = reg.exec(trContent);
        var rankReg = /<span[\s]*class="gray">\[(\d+)\]<\/span>/;
        if(leftContent){
            leftContent = leftContent[0];
            tdContent = tdReg.exec(leftContent);
            var val = valReg.exec(tdContent);
            while(val){
                var key = val[1];
                var keyVal = val[2];
                if(key == "title"){
                    result["team_name"] = keyVal;

                }
                if(key == "href"){
                    result["team_link"] = keyVal;
                }


                //log.debug("key is:%s, val is:%s", key, keyVal);
                val = valReg.exec(tdContent);

            }
            var rank = rankReg.exec(tdContent);
            if(rank){
                result["rank"] = rank[1];
            }

        }
        return result;

    });
    var score = scoreReg.exec(trContent);
    if(!score){
        //log.debug(trContent);
    }
    var homeTeam = dataArr[0];
    var visitTeam = dataArr[1];
    var rate = parseRate(trContent);
    var result = {home_team:dataArr[0],visit_team:dataArr[1]};
    result.rate = rate;
    result.complete = false;
    var match_date = end_timeReg.exec(trContent);
    if(score){
        var homeScore = score[1];
        var visitScore = score[2];
        homeTeam.score = homeScore;
        visitTeam.score = visitScore;
        result.complete = true;
    }




    //log.debug(amt)
    if(match_date){
        match_date = match_date[1];
        result.match_date = new Date(Date.parse(match_date));
    }

    //log.debug(rate);

    return result;



}
var ParseRecord = Models.ParseRecord;

function doParse(item, callback){

    var url = item.url;
    var filePath = item.file_path;
    async.waterfall([

        function(cb){


            var q = {name:filePath,complete:true};
            ParseRecord.findOne(q, function(err, d){
               if(d){
                   item.parse_complete = true;
                   item.save(function(){

                       cb("parse complete");
                   });

               }
                else{
                   cb();
               }

            });

        },
        function(cb){

        fs.readFile(filePath, function(err, buffer){

            //log.debug(arguments);
            cb(err, buffer);


        });

    }, function(buffer, cb){
        buffer = iconv.decode(buffer,"GBK");
        cb(null,buffer.toString());


    }, function(content,cb){

        //log.debug(arguments);
        var reg = /<tr[\s]*zid=(([\s\S](?!<\/tr>))+[\s\S])<\/tr>/g;
        var result = reg.exec(content);
        //log.debug(result);
        var resultArr = [];
        var pageFound = 0;
        if(result){
            while(result){


                gameFound++;
                pageFound++;
                var regContent = result[0];
                var trReg = /<tr([^]+)>/;
                var valReg = /([^\s=]+)="([^"]+)"/g;
                var trContent = trReg.exec(regContent);

                trContent = trContent && trContent[0];
                if(trContent){
                    //log.debug(trContent);
                    var val = valReg.exec(trContent);
                    var teamResult = {};
                    while(val){
                        var key = val[1];
                        var keyVal = val[2];
                        teamResult[key] = keyVal;
                        //log.debug("key is:%s, val is:%s", key, keyVal);
                        val = valReg.exec(trContent);

                    }

                    var teamInfo = parseGameInfo(trContent);
                    teamResult.team_info = teamInfo;
                    //log.debug(teamInfo);
                    resultArr.push(teamResult);

                }
                result = reg.exec(content);
            }
            //log.debug("found game count : %s in file %s", pageFound, filePath);
        }else{
            log.debug("not found file path is %s", filePath);
        }
        cb(null, resultArr);


    }], function(err, resultArr){

        //log.debug(resultArr);

        if(resultArr){
            //callback(null, resultArr);
            var hasUnComplete = _.find(resultArr, function(item){
                return !item.team_info.complete;

            });

            async.each(resultArr, function(result, cb){
                var gameId = result.zid;
                var query =  {game_id:result.zid};
                if(result.lg){
                    result.lg = result.lg.replace(/\s/g,"");
                }

                var queryStart = Date.now();
                Game.findOne(query,function(err,doc){
                    log.debug(query);
                    var timeUse = Date.now() - queryStart;
                    log.debug("query time use: %s ms", timeUse);
                    if(doc){
                        log.debug(doc);
                        if(doc.data.team_info && doc.data.team_info.complete){
                            cb();
                            return;
                        }
                        doc.data = result;
                        doc.end_date = new Date(Date.parse(result.pendtime));
                        doc.match_date = result.team_info.match_date;
                        doc.data_url = url;
                        doc.save(function(err, doc){
                            //log.debug(result);
                            //log.debug("save doc,dos is %s", doc);
                            log.debug("update exists");
                            cb();
                        });
                        //cb();
                    }else{
                        log.debug("create new");
                        doc = {game_id:result.zid,data:result};
                        doc.end_date = new Date(Date.parse(result.pendtime));
                        doc.match_date = result.team_info.match_date;
                        doc.data_url = url;
                        Game.create(doc, function(err,doc){
                            cb();
                        });
                    }

                });
            }, function(err, result){
                log.debug("save to db complete");
                var url  = item.url;
                ParseRecord.findOne({url:url}, function(err, doc){
                    var data = doc || {name:filePath,url:url};
                    data.complete = true;
                    data.created_at = new Date();
                    data.match_count = resultArr.length;
                    data.file_path = filePath;
                    if(hasUnComplete){
                       data.complete = false;
                       var arr =  _.select(resultArr, function(item){
                            return !item.team_info.complete;

                        });

                        log.debug(arr);
                    }
                    if(data.complete){
                        data.completed_at = new Date();
                    }


                    if(doc){

                        doc.save(function(err, result){
                            callback(err, result, doc);
                        })
                    }else{

                        ParseRecord.create(data, function(err, result){
                            callback(err, result, data);
                        });
                    }


                });




            });


        }else{
            log.debug(arguments);
            var data = {name:filePath};
            data.complete = true;
            data.created_at = new Date();
            data.match_count = 0;
            ParseRecord.create(data, function(err, result){

                callback(err, result, data);
            });

        }

    });


}


function start(date){
    var now = Date.now();
    if(!(date.valueOf() < now)){
        log.debug("game found is :%s", gameFound);
        log.debug(pathArr.length);
        return;
    }
    var filePath =  util.getFilePath(date);

    if(filePath){
        doParse(filePath, function(err, result){
            startOne();
        });
    }else{
        startOne();
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



}], function(){





    var pStartDate = Date.now();
    function startDownload(complete){



        complete = complete || 0;
        var size = 1000;
        async.waterfall([function(cb){

            Models.RequestPlan.find({"complete":true,"parse_complete":{"$ne":true}}).sort({last_modified:1}).skip(complete).limit(size).exec(function(err, docs){

                cb(err, docs);
            });


        }], function(err, arr){

            log.debug(arguments);
            async.eachLimit(arr, 30, function(item, cb){


                doParse(item, function(err, result, record){

                    if(record){
                        item.parse_complete = record.complete;
                        item.complete = record.complete;
                        log.debug(record.complete);
                        item.save(function(){
                            cb(err, result);
                        });
                    }else{
                        log.error(err);
                        cb(err, result);
                    }


                });

            }, function(err, results){
                if(err){
                    log.error(err);
                    log.error("there is an error");
                    return;
                }
                if(arr.length < size){

                    if(complete == 0 && arr.length == 0){
                        log.debug("no plan");

                    }else{
                        log.debug("all request complete, %s files parsed", complete + arr.length);
                    }
                    var completeDate = Date.now();
                    var timeUse = completeDate - pStartDate;
                    log.debug("time use: %s ms", timeUse);
                    process.exit(0);
                }else{

                    startDownload(complete + size);
                }


            });


        });








    }

    startDownload();





});








