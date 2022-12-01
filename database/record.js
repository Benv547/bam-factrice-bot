var db = require('./pgpool.js');

module.exports = {

    insertRecord: async function (score, type) {
        const pool = db.getPool();
        return await pool.query('INSERT INTO "Record" ("score", "type") VALUES ($1, $2)', [score, type]);
    },

    insertRecordWithDate: async function (score, type, date) {
        const pool = db.getPool();
        return await pool.query('INSERT INTO "Record" ("score", "type", "date") VALUES ($1, $2, $3)', [score, type, date]);
    }
};