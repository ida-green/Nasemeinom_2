
const express = require('express');
const router = express.Router();
const { getFavouriteByUserId, addItemToFavourite, removeItemFromFavourite } = require('../controllers/favouriteController.js');

// Получение избранного по userId
router.get('/user/:userId', getFavouriteByUserId); 

// Добавление товара в избранное
router.post('/:cartId/add', addItemToFavourite);

// Удаление элемента из избранного
router.delete('/:cartId/course/:courseId', removeItemFromFavourite);

{/*}
// Переключение цены в избранном при наличии опций по цене
//router.put('/:cartId/courses/:courseId/price', FavouriteController.updateItemPriceInFavourite);
*/}

module.exports = router;
