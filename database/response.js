const db = require('./pgpool.js');

module.exports = {
    createResponse: async function (id_schedule, id_user, response) {
        const pool = db.getPool();
        return await pool.query('INSERT INTO "Response" ("id_schedule", "id_user", "response") VALUES ($1, $2, $3)', [id_schedule, id_user, response]);
    },
    deleteAllResponses: async function (id_schedule) {
        const pool = db.getPool();
        return await pool.query('DELETE FROM "Response" WHERE "id_schedule" = $1', [id_schedule]);
    },
    getAllResponses: async function (id_schedule) {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "Response" WHERE "id_schedule" = $1', [id_schedule]);
        if (results.rows.length === 0) {
            return null;
        }
        return results.rows;
    },
    getUserResponse: async function (id_schedule, id_user) {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "Response" WHERE "id_schedule" = $1 AND "id_user" = $2', [id_schedule, id_user]);
        if (results.rows.length === 0) {
            return null;
        }
        return results.rows[0];
    }
};