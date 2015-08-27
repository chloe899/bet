var fs = require("fs");
var util = require("../lib/common");
var async = require("async");
var iconv = require("iconv-lite");
var log = require("../lib/logger").getLogger();
var mongoose = require("mongoose");
var Models = require("../models/");
var Game = Models.Game;
var _ = require("underscore");


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
                    log.debug(data);


                }

                itemContent = itemReg.exec(tableContent)
            }


        }], function(err, resultArr){

        //log.debug(resultArr);



    });


}


doParse();