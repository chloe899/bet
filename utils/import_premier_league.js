var fs = require("fs");
var util = require("../lib/common");
var async = require("async");
var iconv = require("iconv-lite");
var log = require("../lib/logger").getLogger();
var mongoose = require("mongoose");
var Game = require("../models/game.js");
var request = require("request");
var leagueUtil = require("../lib/premier-league");
var _ = require("underscore");
var Models = require("../models");




function parseGameInfo(regContent, otherContent){
    var leftReg = /<td[\s\S]*CLUB\.json"(([\s\S](?!<\/td>))+[\s\S])<\/td>/g;
    var content = leftReg.exec(regContent);
    var trReg = /<tr([^]+)>/;
    var valReg = /([^\s=]+)="([^"]+)"/g;
    var urlReg = /ajax="([^"]+)"/g;
    var trContent = trReg.exec(regContent);
    content = content && content[1];
    content = content || "";
    content = content.replace(/^>/,"");
    content = util.getTextFromHtml(content);
    var result = {};
    result.name = content;
    trContent = trContent && trContent[0];
    //log.debug(trContent);
    if(trContent){
        //log.debug(trContent);
        var val = valReg.exec(trContent);
        while(val){
            var key = val[1];
            var keyVal = val[2];
            if(key == "name"){
                result.shortname = keyVal;
                break;
            }
            //log.debug("key is:%s, val is:%s", key, keyVal);
            val = valReg.exec(trContent);

        }
    }
    var urls = [];
    while(true){
        var url = urlReg.exec(regContent);
        url = url && url[1];
        if(!url){
            break;
        }
        urls.push(url);
    }

    result.urls = urls;

    return result;



}


function parseInfo(content, callback){

    var reg = /<tr[\s]*class="club-row(([\s\S](?!<\/tr>))+[\s\S])<\/tr>/g;
    //<tr class="club-overview-row">
    var infoReg = /<tr[\s]*class="club-overview-row"(([\s\S](?!<\/tr>))+[\s\S])<\/tr>/g;
    var arr = [];
    while(true){
        var mainInfo = reg.exec(content);
        if(!mainInfo){
            break;
        }
        mainInfo = mainInfo && mainInfo[0];
        var otherInfo = infoReg.exec(content);
        otherInfo = otherInfo && otherInfo[0];
        //log.debug(otherInfo);
        //log.debug(mainInfo);
        var result = parseGameInfo(mainInfo, otherInfo);
        arr.push(result);


    }

    if(callback){

        callback(null, arr);
    }




}


function parse(){
    var path = "data/premier_league/clubs/";
    async.waterfall([function(cb){

        fs.readdir(path, function(err, files){

            cb(err, files);


        });

    }, function(files, cb){

        async.map(files, function(filename, cb){


            var fullname = path + filename;
            fs.readFile(fullname, function(err, buffer){

                parseInfo(buffer.toString(), function(err, results){
                    var season = filename.replace(".html", "");
                    cb(err, {season:season,clubs:results});
                });

            });






        }, function(err, results){



            cb(err, results);
        })




    }], function(err, results){

        //var arr = _.values(results);
        var urls = [];
        _.each(results, function(item){

           var season = item.season;
            var clubs = item.clubs;
            _.each(clubs, function(subItem){
                log.debug(subItem);
                var result = {};
                result.season = season;
                result.name = subItem.name;
                result.shortname = subItem.shortname;
                result.url = subItem.urls[0];
                urls.push(result);
            })


        });

        async.each(urls, function(club, cb){
            var query = {name:club.name};
            var Team = Models.Team;
            Models.Team.findOne(query, function(err, doc){
                if(doc){
                    log.debug("team name exists:%s", club.name);

                    cb();
                }else{
                    var data  = _.extend({}, club);
                    data.country = "England";
                    data.nick_name = data.shortname;
                    data.name_en = data.name;
                    data.created_at = new Date();
                    Team.create(club, function(err, docNew){
                        log.debug("create team name is:%s", data.name_en);
                        cb(err, docNew);
                    })
                }


            })



        }, function(err, result){

            log.debug(urls);
            getMatchDay(urls);
        });



    });


}

function requestMatch(url, callback){

    //url = "http://www.premierleague.com" + url;
    //log.debug(url);
    leagueUtil.request(url, function(err, body){
       if(callback){

           callback(err, body);
       }
    })



}


function getMatchDay(clubs){




    async.map(clubs, function(club, cb){
        var url = club.url;
        requestMatch(url, function(err, body){
            log.debug(body);
            cb(err, {match:body,club:club});


        });

    }, function(err, results){

        async.eachSeries(results, function(item, cb){
            importMatchDay(item, function(err, result){
                log.debug("import complete");
                cb(err, result);
            })
        }, function(err, result){
            log.debug("import all match day complete");

        });

        //log.debug(results.length);
    })

}

function getMatchResult(match, result){



}


function importMatchDay(info, callback){

      var match = info.match;
    var club = info.club;
    var matchResults = match.clubDetails.performance;
    var urlTemplate = match.clubDetails.ajaxUrlExample;
    var MatchDay = Models.MatchDay;
    async.each(matchResults, function(item, cb){
        var season = club.season;
        var date = new Date(item.on);
        var matchId = item.matchId;
        if(!item.cmsAlias){
            cb();
            return;
        }
        var vs = item.cmsAlias[2];
         season = item.cmsAlias[0];
        var teamName = vs.split("-vs-");
        var query = {match_id:matchId};
        var data = {};
        data.match_id = matchId;
        data.created_at = new Date();
        data.season = season;
        data.match_date= date;
        data.home_team = teamName[0];
        data.away_team = teamName[1];
        var url = urlTemplate.replace("MATCH_ID",matchId);
        url = url  + ".json";
        MatchDay.findOne(query, function(err, doc){
            if(!doc){
                data.match_result_url = url;
                MatchDay.create(data, function(err, docCreated){

                    cb(err, docCreated);

                });
            } else{
                MatchDay.update(query, {match_result_url:url}, function(err, result){
                    cb();
                });

            }

        });
        /*leagueUtil.request(url, function(err, matchResult){
            log.debug(matchResult);


        });
*/





    },function(err, results){

         callback(err, results);

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
    parse();
});
