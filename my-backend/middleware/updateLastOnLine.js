// middleware/updateLastOnline.js
const User = require('../models/User'); // Убедитесь, что путь к модели User правильный

const updateLastOnlineMiddleware = async (req, res, next) => {
    // Этот middleware будет работать только если req.user уже был установлен authenticateToken
    if (req.user && req.user.id) {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const user = await User.findByPk(req.user.id, { attributes: ['last_online_at'] });        if (user && (!user.last_online_at || user.last_online_at < fiveMinutesAgo)) {
             await User.update(
                { last_online_at: new Date() },
                { where: { id: req.user.id } }
            );
        }
    } catch (error) {
        console.error('Ошибка обновления last_online_at для пользователя', req.user.id, ':', error);
    }
}
next();
};

module.exports = { updateLastOnlineMiddleware };
