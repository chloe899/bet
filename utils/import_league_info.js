var fs = require("fs");
var util = require("../lib/common");
var async = require("async");
var iconv = require("iconv-lite");
var log = require("../lib/logger").getLogger();
var mongoose = require("mongoose");
var Models = require("../models/");
var Game = Models.Game;
var _ = require("underscore");




var that = {};


that.addPlan = function(info, callback){


    var url = info.url;
    var fileNameReg = /^[\d\/]+/;
    var data = {};
    data.url = url;
    data.created_at = new Date();
    data.type = "500_league";
    var fileName = fileNameReg.exec(info.unique_name)[0];
    fileName = fileName.replace("/","_");
    var file_path = "data/league/" + info.internal_name + "/" + fileName + ".html";
    data.file_path = file_path;
    async.waterfall([function(cb){

        var path = "data/league/" + info.internal_name + "/";
        fs.exists(path, function(e){

            log.debug(arguments);
            if(!e){
                fs.mkdir(path,"0755", function(err){
                    log.debug(arguments);
                    cb(null, 1);
                })
            }else{
                log.debug(3333);
                cb(null, 1);

            }
        })




    }, function(r, cb){
        cb()

    }], function(){





        Models.RequestPlan.findOne({url:url}, function(err, doc){

            if(!doc){


                Models.RequestPlan.create(data, function(err, result){
                    log.debug(arguments);
                    callback(err, result);
                })

            }else{
                doc.file_path = file_path;
                doc.complete = false;
                doc.save(function(){
                    callback(err, doc);
                });

            }

        })

    });





};

function doParse(item, callback){


    var filePath = "data/league/500_league.html";
    async.waterfall([

        function(cb){


            fs.readFile(filePath, function(err, buffer){

                //log.debug(arguments);
                cb(err, buffer);


            });

        }, function(buffer, cb){
            buffer = iconv.decode(buffer,"GBK");
            cb(null,buffer.toString());


        }, function(content,cb){

            //lsHotRace
            //log.debug(arguments);
            //var reg = /<tr[\s]*zid=(([\s\S](?!<\/tr>))+[\s\S])<\/tr>/g;

            //<table id="lsHotRace"
            var reg = /<table[\s]*id="lsHotRace(([\s\S](?!<\/table>))+[\s\S])<\/table>/g;
            var tableContent = reg.exec(content);
            tableContent = tableContent && tableContent[0];
            //log.debug(tableContent);

            var itemReg = /<td[\s]*(([\s\S](?!<\/td>))+[\s\S])<\/td>/g;
            var itemContent = itemReg.exec(tableContent);
            var arr = [];
            while(itemContent){
                var tdContent = itemContent[0];
                //var linkReg = /<a[\s]*(([\s\S](?!href))+[\s\S])href="(\/zuqiu-(\d+)\/)"/;
                var linkReg = /href="(\/zuqiu-(\d+)\/)"/;
                var nameTwoReg = /<h2\s*class="itm_name1">(.*)<\/h2>/;
                var nameOneReg = /<p\s*class="itm_name2">(.*)<\/p>/;
                var uniqueNameReg = /alt="(.*)"/;
                //<h2 class="itm_name1">中超</h2><p class="itm_name2">Chinese Super League</p>
                //log.debug(itemContent[0]);
                if(linkReg.test(tdContent)){
                    var link = linkReg.exec(tdContent);
                    var url = "http://liansai.500.com" + link[1];
                    var id = link[2];
                    var nameOne = nameOneReg.exec(tdContent)[1];
                    var nameTwo = nameTwoReg.exec(tdContent)[1];
                    var uniqueName = uniqueNameReg.exec(tdContent)[1];

                    var data = {};
                    data.url = url;
                    data.id = id;
                    data.unique_name = uniqueName;
                    data.name = nameTwo;
                    data.internal_name = nameOne;

                    arr.push(data);


                }

                itemContent = itemReg.exec(tableContent)
            }
            cb(null, arr)


        }], function(err, resultArr){

        //log.debug(resultArr);
        async.eachSeries(resultArr, function(item, cb){

            that.addPlan(item, function(err, result){

                log.debug(999999);
                log.debug(arguments);
                cb();
            });

        }, function(){

            log.debug("complete");
        });

        //log.debug(resultArr);



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

    doParse();




});

