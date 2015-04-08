var _ = require("underscore");
var env = process.env.NODE_ENV;
var configPath = "./development.js";
 switch(env){
     case "production":
         configPath = "./production.js";
         break;
     case "test":
         configPath = "./test.js";
         break;
     case "stage":
         configPath = "./stage.js";
         break;
 }

var config = require(configPath);
var _services = [];
var _products = [];
config.__defineGetter__("services", function(){
    return _services;
});

config.__defineSetter__("services", function(services){
     _services = services;
});

config.__defineGetter__("products", function(){
    return _products;
});

config.__defineSetter__("products", function(products){
    _products = products;
});

var tokenNumber = 0;
var tokens;
config.getAttToken = function(productId){

    var token = "";
    if(productId){
        var service = _.find(config.services, function (service, i) {
            return _.contains(service.ProductId, productId);
        });
        token = service && service.access_token || "";
    }else{
        tokens = tokens || _.select(config.services, function(s){ return s.access_token;});
        token  = tokens[tokenNumber].access_token;
        tokenNumber++;
        tokenNumber = tokenNumber < tokens.length ? tokenNumber : 0;
    }

    return token;
};









module.exports = exports = config;

