var crypto = require('crypto');
var _ = require('underscore');
var log = require("./logger").getLogger();

var that = {};


that.getFilePath = function(date){



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
    return filePath;


};

that.getUrlByFilePath = function(filePath){

  var arr = filePath.split("/");
   var date = arr[arr.length -1];
    return that.getDataUrl(date);




};


that.getDataUrl = function(date){

    if(typeof(date) == "string"){
        date = new Date(Date.parse(date));
    }
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
    var url = "http://trade.500.com/jczq/?date=" + fileName  +"&playtype=both"

    return url;
};






var hashSecret = "~!@!%^*&*(!MUUZII";

var my = {};

my.cryptStr = function (source) {
    var result = [];
    for (var i = 0; i < source.length; i++) {
        var c = source.charCodeAt(i);
        var n = (c >> 4) | ((c & 0xf) << 4);
        n = n ^ i;
        n = n & 0xff;
        result[i] = String.fromCharCode(n);
    }
    return result.join("");
};


my.decryptStr = function (source) {
    var result = [];
    for (var i = 0; i < source.length; i++) {
        var c = source.charCodeAt(i);
        c = c ^ i;
        //n = n & 0xff;
        var n = (c >> 4) | ((c & 0xf) << 4);
        result[i] = String.fromCharCode(n);
    }
    return result.join("");
};


that.badRequest = function (res, err) {

    if (typeof(err) == "object") {
        err.error = true;
        res.send(400, err);
    } else {
        res.send(400, {error: true, reason: err});
    }
};

that.getSha1Sum = function (computeStr) {
    computeStr = computeStr || "";
    computeStr = "" + computeStr;
    var shasum = crypto.createHash('sha1');
    shasum.update(computeStr);
    var result = shasum.digest('hex');
    return result;
};


/**
 *
 * @param items
 */
that.getComputeSum = function (items) {
    var param = [];
    if (_.isArray(items)) {
        param = param.concat(items);
    }
    for (var i = 1; i < arguments.length; i++) {
        var arg = arguments[i];
        arg = "" + arg;
        param[i] = arg;
    }
    param[param.length] = hashSecret;
    var str = param.join("|");
    var result = that.getSha1Sum(str);
    return result;

};


// 对字符窜简单的加密
that.encodeStr = function (source) {
    var result = [];
    source = "" + source;
    log.debug(source);
    var str = my.cryptStr(source);
    log.debug(str);
    var buffer = new Buffer(str);

    result = buffer.toString("base64");
    return result;
};

that.decodeStr = function (encodedSource) {
    var buffer = new Buffer(encodedSource, "base64");
    var result = buffer.toString();
    console.log(result);
    result = my.decryptStr(result);
    return result;
};







that.deepClone = function(object){

    var result = {};
    if(_.isArray(object)){
        result = [];
    }
    _.each(object,function(value,key){
        if(_.isObject(value) || _.isArray(value)){
            result[key] = that.deepClone(value);
        }else{
            result[key] = value;
        }
    });
    return result;


};

that.trim = function(str){
    str = str || "";
    var reg = /^\s+/;
    var regEnd = /\s+$/;
    str = str.replace(reg, "");
    str = str.replace(regEnd, "");
    return str;

};

that.isLogin = function(req,res,redirect){
    var hasUserSession = req.session.user;
    var user = req.session && req.session.user;
    var isLogin = hasUserSession &&  user;
    var result =  isLogin;
    log.debug(user);
    if(!result && redirect){
        if(req.xhr){
            res.send({error: true, reason: 'not logged in'}, 401);
        }else{
            res.redirect("/login.html?"  + encodeURIComponent(req.url));
        }
    }
    return    result;
};













module.exports = that;