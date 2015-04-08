module.exports = exports = {
    port: "6789",
    listen_host: "127.0.0.1",
    db: {
        mongo: "mongodb://localhost/enterprise",
        mongoDbName: "enterprise",
        "redis": {host: "127.0.0.1", port: 6379, urlDB: {db: 5}}

    },
    apiPrefix: "/api/v1/json",
    urlPrefix: ""

};