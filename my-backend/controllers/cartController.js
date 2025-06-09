const sequelize = require('../database');
const Cart = require('../models/Cart');
const Course = require('../models/Course');
const CartCourse = require('../models/CartCourse');

// Получает корзину по cartId
exports.getCart = async (req, res) => {
    try {
        const cartId = req.params.cartId; // Оставляем как есть
        if (isNaN(cartId)) {
            return res.status(400).json({ error: 'Неверный формат cartId' });
        }
        const cart = await Cart.findOne({
            where: { id: cartId },
            include: [
                {
                    model: CartCourse,
                    as: 'cartcourses', // Убедитесь, что используете правильный алиас
                    include: [
                        {
                            model: Course,
                            as: 'course', // Убедитесь, что используете правильный алиас
                        }
                    ]
                }
            ]
        });
        if (!cart) {
            return res.status(404).json({ error: 'Корзина не найдена' });
        }
        res.json(cart);
    } catch (error) {
        console.error("Ошибка при получении корзины:", error);
        res.status(500).json({ error: 'Ошибка сервера при получении корзины', details: error.message });
    }
};


// Получение корзины по userId
exports.getCartByUserId = async (req, res) => {
    const userId = req.params.userId; // Получаем userId из параметров

    try {
        if (!userId) {
            return res.status(400).json({ error: 'userId не указан' }); // Обработка отсутствия userId
        }

        const cart = await Cart.findOne({
            where: { userId: userId },
            include: [
                {
                    model: CartCourse,
                    as: 'cartcourses', // Убедитесь, что используете правильный алиас
                    include: [
                        {
                            model: Course,
                            as: 'course', // Убедитесь, что используете правильный алиас
                        }
                    ]
                }
            ]
        });

        if (!cart) {
            return res.status(404).json({ error: 'Корзина не найдена' });
        }

        res.json(cart); // Возвращаем всю информацию о корзине
    } catch (error) {
        console.error("Ошибка при получении корзины:", error);
        res.status(500).json({ error: 'Ошибка сервера при получении корзины', details: error.message }); // Добавлено описание ошибки
    }
};

// Добавляет товар в корзину
exports.addItemToCart = async (req, res) => {
    const transaction = await Cart.sequelize.transaction();
    try {
        const cartId = parseInt(req.params.cartId, 10);
        const { courseId, purchasedPrice, description } = req.body; // Добавлено описание
        if (isNaN(cartId) || isNaN(courseId) || isNaN(purchasedPrice)) {
            return res.status(400).json({ error: 'Неверный формат данных' });
        }
        const cart = await Cart.findByPk(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Корзина не найдена' });
        }
        const existingItem = await CartCourse.findOne({
            where: { cartId: cartId, courseId: courseId }
        });
        if (existingItem) {
            return res.status(409).json({ error: 'Товар уже добавлен в корзину' });
        }
        
        // Создаем запись о товаре в корзине с учетом новой информации
        await CartCourse.create({
            cartId: cartId,
            courseId: courseId,
            purchasedPrice: purchasedPrice,
            description: description // Сохраняем описание
        }, { transaction });

        await transaction.commit();
        
        const updatedCart = await Cart.findOne({
            where: { id: cartId },
            include: [
                {
                    model: CartCourse,
                    as: 'cartcourses', 
                    include: [
                        { model: Course, as: 'course' }
                    ]
                }
            ]
        });
        
        if (!updatedCart) {
            return res.status(404).json({ error: 'Корзина не найдена' });
        }
        
        res.json(updatedCart); // Возвращаем обновленную информацию о корзине
    } catch (error) {
        await transaction.rollback();
        console.error("Ошибка при добавлении товара:", error);
        res.status(500).json({ error: 'Ошибка сервера при добавлении товара', details: error.message });
    }
};

// Удаляет товар из корзины
exports.removeItemFromCart = async (req, res) => {
    const { cartId, courseId } = req.params; // Получаем cartId и courseId из параметров

    try {
        if (!cartId || !courseId) {
            return res.status(400).json({ error: 'cartId или courseId не указаны' });
        }

        // Находим запись в корзине по cartId и courseId
        const cartItem = await CartCourse.findOne({
            where: { cartId: cartId, courseId: courseId }
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Элемент корзины не найден' });
        }

        // Удаляем элемент из корзины
        await cartItem.destroy();

        res.json({ message: 'Элемент успешно удален из корзины' });
    } catch (error) {
        console.error("Ошибка при удалении элемента из корзины:", error);
        res.status(500).json({ error: 'Ошибка сервера при удалении элемента из корзины', details: error.message });
    }
};

// Обновляет цену товара в корзине
exports.updateItemPriceInCart = async (req, res) => {
    const { cartId, courseId } = req.params; // Получаем cartId и courseId из параметров
    const { newPrice } = req.body; // Получаем новую цену из тела запроса

    try {
        if (!cartId || !courseId || !newPrice) {
            return res.status(400).json({ error: 'cartId, courseId или newPrice не указаны' });
        }

        // Находим запись в корзине по cartId и courseId
        const cartItem = await CartCourse.findOne({
            where: { cartId: cartId, courseId: courseId }
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Элемент корзины не найден' });
        }

        // Обновляем цену
        cartItem.purchasedPrice = newPrice;
        await cartItem.save();

        // Получаем обновленную корзину
        const updatedCart = await Cart.findOne({
            where: { id: cartId },
            include: [
                {
                    model: CartCourse,
                    as: 'cartcourses', // Убедитесь, что используете правильный алиас
                    include: [
                        {
                            model: Course,
                            as: 'course', // Убедитесь, что используете правильный алиас
                        }
                    ]
                }
            ]
        });

        if (!updatedCart) {
            return res.status(404).json({ error: 'Корзина не найдена' });
        }

        res.json(updatedCart); // Возвращаем обновленную информацию о корзине
    } catch (error) {
        console.error("Ошибка при обновлении цены товара:", error);
        res.status(500).json({ error: 'Ошибка сервера при обновлении цены товара', details: error.message });
    }
};

module.exports = exports;
