module.exports = exports = {
    port: "9100",
    listen_host: "127.0.0.1",
    db: {
        mongo: "mongodb://localhost:27017/nypd",
        mongoDbName: "nypd",
        "redis": {host: "127.0.0.1", port: 6379, urlDB: {db: 5}}

    },
    apiPrefix: "/api/v1/json",
    urlPrefix: "",



};