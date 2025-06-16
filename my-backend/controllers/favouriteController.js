const Favourite = require('../models/Favourite.js');
const Course = require('../models/Course.js');
const FavouriteCourse = require('../models/FavouriteCourse.js');

// Получение избранного по userId
const getFavouriteByUserId = async (req, res) => {
    const userId = req.params.userId; // Получаем userId из параметров

    try {
        if (!userId) {
            return res.status(400).json({ error: 'userId не указан' });
        }

        const favourites = await Favourite.findOne({
            where: { userId: userId },
            include: [
                {
                    model: FavouriteCourse,
                    as: 'favouritecourses', // Убедитесь, что используете правильный алиас
                    include: [
                        {
                            model: Course,
                            as: 'course', // Убедитесь, что используете правильный алиас
                        }
                    ]
                }
            ]
        });

        if (!favourites) {
            return res.status(404).json({ error: 'Избранное не найдено' });
        }

        res.json(favourites); // Возвращаем всю информацию о избранном
    } catch (error) {
        console.error("Ошибка при получении избранного:", error);
        res.status(500).json({ error: 'Ошибка сервера при получении избранного', details: error.message });
    }
};

// Добавляет товар в избранное
const addItemToFavourite = async (req, res) => {
    const transaction = await Favourite.sequelize.transaction();
    try {
        const favouriteId = parseInt(req.params.favouriteId, 10);
        const { courseId } = req.body;

        // Валидация данных
        if (isNaN(favouriteId) || isNaN(courseId)) {
            return res.status(400).json({ error: 'Неверный формат данных' });
        }

        const favourites = await Favourite.findByPk(favouriteId);
        if (!favourites) {
            return res.status(404).json({ error: 'Избранное не найдено' });
        }

        // Проверка, существует ли уже элемент с таким courseId в избранном
        const existingItem = await FavouriteCourse.findOne({
            where: { favouriteId: favouriteId, courseId: courseId }
        });

        if (existingItem) {
            return res.status(409).json({ error: 'Товар уже добавлен в избранное' });
        }

        // Создание нового элемента в избранном
        await FavouriteCourse.create({
            favouriteId: favouriteId,
            courseId: courseId,
        }, { transaction });

        await transaction.commit();

        // Получаем обновленное избранное
        const updatedFavourites = await Favourite.findOne({
            where: { id: favouriteId },
            include: [
                {
                    model: FavouriteCourse,
                    as: 'favouriteCourses', // Убедитесь, что используете правильный алиас
                    include: [
                        {
                            model: Course,
                            as: 'course', // Убедитесь, что используете правильный алиас
                        }
                    ]
                }
            ]
        });

        if (!updatedFavourites) {
            return res.status(404).json({ error: 'Избранное не найдено' });
        }

        res.json(updatedFavourites); // Возвращаем обновленную информацию о избранном
    } catch (error) {
        await transaction.rollback();
        console.error("Ошибка при добавлении товара в избранное:", error);
        res.status(500).json({ error: 'Ошибка сервера при добавлении товара в избранное', details: error.message });
    }
};

// Удаляет товар из избранного
const removeItemFromFavourite = async (req, res) => {
    const { favouriteId, courseId } = req.params; // Получаем favouriteId и courseId из параметров

    try {
        if (!favouriteId || !courseId) {
            return res.status(400).json({ error: 'favouriteId или courseId не указаны' });
        }

        // Находим запись в избранном по favouriteId и courseId
        const favouriteItem = await FavouriteCourse.findOne({
            where: { favouriteId: favouriteId, courseId: courseId }
        });

        if (!favouriteItem) {
            return res.status(404).json({ error: 'Товар не найден в избранном' });
        }

        // Удаляем элемент из избранного
        await favouriteItem.destroy();

        res.json({ message: 'Товар успешно удален из избранного' });
    } catch (error) {
        console.error("Ошибка при удалении товара из избранного:", error);
        res.status(500).json({ error: 'Ошибка сервера при удалении товара из избранного', details: error.message });
    }
};

module.exports = { getFavouriteByUserId, addItemToFavourite, removeItemFromFavourite };