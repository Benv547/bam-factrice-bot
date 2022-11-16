const userDB = require("../database/user");

module.exports = {
    name: 'orAction',
    async increment(userId, qte) {
        const user = await userDB.getUser(userId);
        if (user) {
            await userDB.incr_money(userId, qte);
            return true;
        }
        return false;
    },
    async get(userId) {
        const user = await userDB.getUser(userId);
        if (user) {
            return user.money;
        }
        return null;
    },
    async reduce(userId, qte) {
        const user = await userDB.getUser(userId);
        if (user) {
            if (user.money >= qte) {
                await userDB.reduce_money(userId, qte);
                await userDB.incr_money_spent(userId, qte);
                return true;
            }
        }
        return false;
    }
};