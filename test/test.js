var request = require("request");
var log = require("../lib/logger").getLogger();
var fs = require("fs");
var async = require("async");
/*
Host: www.premierleague.com
Connection: keep-alive
Cache-Control: max-age=0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*!/!*;q=0.8
 User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36
 Accept-Encoding: gzip, deflate, sdch*/

//var headers = {Cookie:"plcv=1; _ga=GA1.2.755726251.1437748060; pllocale=en_GB; akamaiVal=georegion=47,country_code=CN,region_code=BJ,city=BEIJING,lat=39.90,long=116.41,timezone=GMT+8,continent=AS,throughput=vhigh,bw=5000,network=chinaunicom,asnum=4808,location_id=0; BIGipServerPOOL-46.38.180.104-80=1645482156.20480.0000;"}
var headers = {Cookie:"plcv=1; _ga=GA1.2.755726251.1437748060; pllocale=en_GB;"}
headers["User-Agent"] = "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36";
headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
headers["Accept-Language"] = "zh-CN,zh;q=0.8,en;q=0.6";
headers["Cache-Control"] = "max-age=0";

var now = new Date();
var nowYear = now.getFullYear();
var nowMonth = now.getMonth();
var currentYear = 1992;
var times = nowYear - currentYear;
if(nowMonth >= 7){
    times++;
}
async.times(
    times,
    function (n, cb) {

        var season = currentYear  + "-" + (currentYear + 1);
        currentYear++;
        getClub(season, function(err, result){
           cb(err);
        });
    },
    function (err) {
        log.debug("complete");
    }
);
function getClub(season, callback){
    var url = "http://www.premierleague.com/en-gb/matchday/league-table.html?season=" + season;
    request({pool:{maxSockets: 200},headers:headers,url:url,method:"GET",encoding:null}, function(err, res, body){

          log.debug("complete season : %s", season);
        //log.debug(body.toString());
        var path = "data/premier_league/clubs/" + season + ".html" ;
        fs.writeFile(path, body, function(err, result){

            callback(err, result, path);

        })

    });


}









