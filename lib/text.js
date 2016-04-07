
var iconvLite = require("iconv-lite");
var _ = require("underscore");
var log = require("./logger").getLogger();
var config = require("../config");
var that = {};




that.isText = function(res){
    var headerKeys = _.keys(res.headers);
    var contentType = "";
    var reg = /Content-Type/ig;
    var reg1 = /(text\/|application\/(x-)?javascript)/ig;
    var contentTypeKey = _.find(headerKeys,function(key){
        var result = reg.test(key);
        reg.lastIndex = 0;
        return result;

    });
    if(contentTypeKey){
        contentType = res.headers[contentTypeKey];
    }
    return contentType && reg1.test(contentType);
};




that.getEncoding = function(html,res){
    var encoding;
    var headerKeys = _.keys(res.headers);
    var contentType = "";
    var reg = /Content-Type/ig;
    var encodingReg = /<meta[^>]*charset="?([a-zA-Z0-9-]+)"?[^>]*\/?>/ig;
    var encodingReg1 = /charset="?([a-zA-Z0-9-]+)"?/ig;

    var contentTypeKey = _.find(headerKeys,function(key){
        var result = reg.test(key);
        reg.lastIndex = 0;
        return result;

    });
    if(contentTypeKey){
        contentType = res.headers[contentTypeKey];
    }
    if(contentType){
        var headerEncodingResult =    encodingReg1.exec(contentType);
        encoding = headerEncodingResult && headerEncodingResult[1];
    }
    if(!encoding){
        var result = encodingReg.exec(html);
        if(result && result[1]){
            encoding = result[1];
        }
    }

    return encoding && encoding.toLowerCase();

};



that.getTrueEncoding = function(buffer){

    var arr = ["gbk", "gb2312", "utf8"];

    var e;
    log.debug(buffer);
    log.debug("buffer length is %s", buffer.length);
    e = _.find(arr, function(c){
        var str = iconvLite.decode(buffer, c);

        log.debug(str);
        var cBuffer = iconvLite.encode(str, c);
        log.debug(cBuffer);
        var resultStr = iconvLite.decode(cBuffer, c);
        return cBuffer.length == buffer.length && resultStr.length == str.length;
    });
    return e;
};



that.isUTF8Encoding = function(buffer){

    var str = buffer.toString();
    var newBuffer = iconvLite.encode(str, "utf8");
    return newBuffer.length == buffer.length;
};











module.exports = that;