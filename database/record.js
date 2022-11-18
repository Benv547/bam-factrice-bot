var db = require('./pgpool.js');

module.exports = {

    insertRecord: async function (score, type) {
        const pool = db.getPool();
        return await pool.query('INSERT INTO "Record" ("score", "type") VALUES ($1, $2)', [score, type]);
    }
};