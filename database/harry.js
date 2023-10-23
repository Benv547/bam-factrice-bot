var db = require('./pgpool.js');

module.exports = {
    createHarryUser: async function (id_user, points, house) {
        const pool = db.getPool();
        return await pool.query('INSERT INTO "Harry" ("id_user", "points", "house") VALUES ($1, $2, $3)', [id_user, points, house]);
    },

    getHarryUser: async function (id_user) {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "Harry" WHERE id_user = $1', [id_user]);
        if (results.rows.length > 0) {
            return results.rows[0];
        }
        return null;
    },

    incr_points: async function (id_user, qte) {
        const pool = db.getPool();
        return await pool.query('UPDATE "Harry" SET "points" = "points" + $1 WHERE "id_user" = $2', [qte, id_user]);
    },

    decr_points: async function (id_user, qte) {
        const pool = db.getPool();
        return await pool.query('UPDATE "Harry" SET "points" = "points" - $1 WHERE "id_user" = $2', [qte, id_user]);
    },

    getPointsByHouse: async function () {
        const pool = db.getPool();
        const results = await pool.query('SELECT house, SUM(points) AS points FROM "Harry" GROUP BY house ORDER BY house ASC');
        if (results.rows.length > 0) {
            return results.rows;
        }
        return null;
    }
}