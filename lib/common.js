

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


module.exports = that;