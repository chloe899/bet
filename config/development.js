var redisAuthPass = "03a674dcce9446f7e7d9c0007fcdccffe5a690454de4242cac3f4a134161a3e0";
module.exports = exports = {
    port: "8089",
    listen_host: "127.0.0.1",
    db: {
        mongo: "mongodb://localhost/lottery",
        mongoDbName: "enterprise",
        "redis": {host: "127.0.0.1", port: 6379, urlDB: {db: 5},pass:redisAuthPass, auth_pass:redisAuthPass}

    },
    apiPrefix: "/api/v1/json",
    urlPrefix: ""




};