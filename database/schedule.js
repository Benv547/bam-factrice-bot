const db = require('./pgpool.js');

module.exports = {
    createSchedule: async function (id, type, start, end) {
        const pool = db.getPool();
        return await pool.query('INSERT INTO "Schedule" ("id", "type", "start", "end") VALUES ($1, $2, $3, $4)', [id, type, start, end]);
    },
    createScheduleWithValue: async function (id, type, start, end, value) {
        const pool = db.getPool();
        return await pool.query('INSERT INTO "Schedule" ("id", "type", "start", "end", "value") VALUES ($1, $2, $3, $4, $5)', [id, type, start, end, value]);
    },
    getNowSchedulesActive: async function () {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "Schedule" WHERE "start" <= NOW() AT TIME ZONE \'Europe/Paris\' AND "active" = true');
        if (results.rows.length === 0) {
            return null;
        }
        return results.rows;
    },
    getNowSchedulesNotActive: async function () {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "Schedule" WHERE "start" <= NOW() AT TIME ZONE \'Europe/Paris\' AND "active" = false');
        if (results.rows.length === 0) {
            return null;
        }
        return results.rows;
    },
    getFutureSchedules: async function () {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "Schedule" WHERE "start" > NOW() AT TIME ZONE \'Europe/Paris\'');
        if (results.rows.length === 0) {
            return null;
        }
        return results.rows;
    },
    deletePastSchedules: async function () {
        const pool = db.getPool();
        return await pool.query('DELETE FROM "Schedule" WHERE "end" < NOW() AT TIME ZONE \'Europe/Paris\'');
    },
    deleteSchedule: async function (id) {
        const pool = db.getPool();
        return await pool.query('DELETE FROM "Schedule" WHERE "id" = $1', [id]);
    },
    setActive: async function (id) {
        const pool = db.getPool();
        return await pool.query('UPDATE "Schedule" SET "active" = true WHERE "id" = $1', [id]);
    },
    setInactive: async function (id) {
        const pool = db.getPool();
        return await pool.query('UPDATE "Schedule" SET "active" = false WHERE "id" = $1', [id]);
    },
    get: async function (id) {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "Schedule" WHERE "id" = $1', [id]);
        if (results.rows.length === 0) {
            return null;
        }
        return results.rows[0];
    },
    setValue: async function (id, value) {
        const pool = db.getPool();
        return await pool.query('UPDATE "Schedule" SET "value" = $1 WHERE "id" = $2', [value, id]);
    }
};