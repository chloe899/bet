var userCtrl = require("./controllers/user");



var that = {};

that.init = function(app){


    app.get("/user/login.html", userCtrl.showLogin);
    app.post("/user/login", userCtrl.login);
    app.get("/user/signup.html",userCtrl.showSignup);
    app.post("/user/signup.html",userCtrl.signup);

};


module.exports = that;