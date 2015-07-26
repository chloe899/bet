var fs = require("fs");
var util = require("../lib/common");
var async = require("async");
var iconv = require("iconv-lite");
var log = require("../lib/logger").getLogger();
var mongoose = require("mongoose");
var Game = require("../models/game.js");
var _ = require("underscore");




function parseGameInfo(regContent, otherContent){
    var leftReg = /<td[\s\S]*CLUB\.json"(([\s\S](?!<\/td>))+[\s\S])<\/td>/g;
    var content = leftReg.exec(regContent);
    var trReg = /<tr([^]+)>/;
    var valReg = /([^\s=]+)="([^"]+)"/g;
    var trContent = trReg.exec(regContent);
    content = content && content[1];
    content = content || "";
    content = content.replace(/^>/,"");
    content = util.getTextFromHtml(content);
    var result = {};
    result.name = content;
    trContent = trContent && trContent[0];
    log.debug(trContent);
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
    log.debug(result);
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
                    cb(err, {season:filename,clubs:results});
                });

            });






        }, function(err, results){



            cb(err, results);
        })




    }], function(err, results){



        log.debug(arguments);

    });




}
parse();