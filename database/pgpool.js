const { dbuser, dbhost, dbbase, dbpassword, dbport } = require('../db.json');

var pg = require('pg');
var pool;
var config = {
    user: dbuser,
    host: dbhost,
    database: dbbase,
    password: dbpassword,
    port: dbport,
    max: 10,
    idleTimeoutMillis: 30000,
};

module.exports = {
    getPool: function () {
        if (pool) return pool; // if it is already there, grab it here
        pool = new pg.Pool(config);
        return pool;
    }
};