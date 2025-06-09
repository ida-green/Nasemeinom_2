
const express = require('express');
const router = express.Router();
const FavouriteController = require('../controllers/favouriteController');


// Получение избранного по userId
router.get('/user/:userId', FavouriteController.getFavouriteByUserId); // Изменено на более логичный путь

// Добавление товара в избранное
router.post('/:cartId/add', FavouriteController.addItemToFavourite);

// Удаление элемента из избранного
router.delete('/:cartId/course/:courseId', FavouriteController.removeItemFromFavourite);

{/*}
// Переключение цены в избранном при наличии опций по цене
router.put('/:cartId/courses/:courseId/price', FavouriteController.updateItemPriceInFavourite);
*/}
module.exports = router;
