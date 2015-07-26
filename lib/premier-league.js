var request = require("request");



var headers = {Cookie:"plcv=1;pllocale=en_GB;akamaiVal=georegion=47"}

//var headers = {Cookie:"plcv=1; _ga=GA1.2.755726251.1437748060; pllocale=en_GB; akamaiVal=georegion=47,country_code=CN,region_code=BJ,city=BEIJING,lat=39.90,long=116.41,timezone=GMT+8,continent=AS,throughput=vhigh,bw=5000,network=chinaunicom,asnum=4808,location_id=0; BIGipServerPOOL-46.38.180.104-80=1645482156.20480.0000;"}

//var cookie = "pllocale=en_GB; plcv=1; akamaiVal=georegion=47,country_code=CN,region_code=BJ,city=BEIJING,lat=39.90,long=116.41,timezone=GMT+8,continent=AS,throughput=vhigh,bw=5000,network=chinaunicom,asnum=4808,location_id=0; BIGipServerPOOL-46.38.180.104-80=1679036588.20480.0000;";
//headers["Cookie"] = cookie;
headers["User-Agent"] = "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36";
headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
headers["Accept-Language"] = "zh-CN,zh;q=0.8,en;q=0.6";
headers["Cache-Control"] = "max-age=0";
headers["Content-type"]  = "application/json";

var that = {};
that.request = function(url, callback){

    url = "http://www.premierleague.com" + url;
    request({pool:{maxSockets: 200},headers:headers,json:true,url:url,method:"GET"}, function(err, res, body){


            callback(err, body);

    });
};


module.exports = that;