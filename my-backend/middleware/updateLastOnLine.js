// middleware/updateLastOnline.js
// Обновляет User.lastOnline - данные, когда пользователь был последний раз онлайн

const User = require('../models/User.js');

const updateLastOnlineMiddleware = async (req, res, next) => {
    if (req.user && req.user.id) {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const user = await User.findByPk(req.user.id, { attributes: ['last_online_at'] });
            if (user && (!user.last_online_at || user.last_online_at < fiveMinutesAgo)) {
                await User.update(
                    { last_online_at: new Date() },
                    { where: { id: req.user.id } }
                );
            }
        } catch (error) {
            console.error('Ошибка обновления last_online_at для пользователя', req.user.id, ':', error);
        }
    }
    next(); // Важно: next() должна быть внутри функции, а не снаружи
};

module.exports = { updateLastOnlineMiddleware };
