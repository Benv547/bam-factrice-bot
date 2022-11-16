const db = require('./pgpool.js');

module.exports = {
    createQuiz: async function (quiz_name) {
        const pool = db.getPool();
        return await pool.query('INSERT INTO "Quiz" ("quiz_name") VALUES ($1)', [quiz_name]);
    },
    deleteQuiz: async function (quiz_name) {
        const pool = db.getPool();
        return await pool.query('DELETE FROM "Quiz" WHERE "quiz_name" = $1', [quiz_name]);
    },
    deleteQuestion: async function (quiz_name, id) {
        const pool = db.getPool();
        return await pool.query('DELETE FROM "Question" WHERE "quiz_name" = $1 AND "id" = $2', [quiz_name, id]);
    },
    getQuizs: async function () {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "Quiz"');
        if (results.rows.length > 0) {
            return results.rows;
        }
        return null;
    },
    getQuestions: async function (quiz_name) {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "Question" WHERE "quiz_name" = $1', [quiz_name]);
        if (results.rows.length > 0) {
            return results.rows;
        }
        return null;
    },
    getQuestionsByQuizName: async function (quiz_name) {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "Question" WHERE "quiz_name" = $1', [quiz_name]);
        if (results.rows.length > 0) {
            return results.rows;
        }
        return null;
    },
    createQuestion: async function (quiz_name, question, image_url, answers, correct_answer, delay) {
        const pool = db.getPool();
        return await pool.query('INSERT INTO "Question" ("quiz_name", "question", "image_url", "answers", "correct_answer", "delay") VALUES ($1, $2, $3, $4, $5, $6)', [quiz_name, question, image_url, answers, correct_answer, delay]);
    },
    getQuiz: async function (quiz_name) {
        const pool = db.getPool();
        const results = await pool.query('SELECT * FROM "Quiz" WHERE "quiz_name" = $1', [quiz_name]);
        if (results.rows.length === 0) {
            return null;
        }
        return results.rows[0];
    }
};