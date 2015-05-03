var userCtrl = require("./controllers/user");
var betCtrl = require("./controllers/bet");



var that = {};

that.init = function(app){


    app.get("/user/login.html", userCtrl.showLogin);
    app.post("/user/login", userCtrl.login);
    app.get("/user/signup.html",userCtrl.showSignup);
    app.post("/user/signup.html",userCtrl.signup);
    app.get("/user/index.html",userCtrl.showMe);
    app.post("/bet/add",betCtrl.addBet);
    app.get("/bet/list.html",betCtrl.showBetList);

};


module.exports = that;