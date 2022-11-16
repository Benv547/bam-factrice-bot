var db = require('./pgpool.js');

module.exports = {
    createUser: async function (id_user, money, xp) {
        const pool = db.getPool();
        return await pool.query('INSERT INTO "User" ("id_user", "money", "xp") VALUES ($1, $2, $3)', [id_user, money, xp]);
    },
    getUser: async function (id_user) {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "User" WHERE id_user = $1', [id_user]);
        if (results.rows.length > 0) {
            return results.rows[0];
        }
        return null;
    },
    incr_money: async function (id_user, qte) {
        const pool = db.getPool();
        return await pool.query('UPDATE "User" SET "money" = "money" + $1 WHERE "id_user" = $2', [qte, id_user]);
    },
    decr_money: async function (id_user, qte) {
        const pool = db.getPool();
        return await pool.query('UPDATE "User" SET "money" = "money" - $1 WHERE "id_user" = $2', [qte, id_user]);
    },
    incr_money_spent: async function (id_user, qte) {
        const pool = db.getPool();
        return await pool.query('UPDATE "User" SET "money_spent" = "money_spent" + $1 WHERE "id_user" = $2', [qte, id_user]);
    },
    reduce_money: async function (id_user, qte) {
        const pool = db.getPool();
        return await pool.query('UPDATE "User" SET "money" = "money" - $1 WHERE "id_user" = $2', [qte, id_user]);
    }
}