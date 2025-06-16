// cartRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getCartByUserId, 
    addItemToCart, 
    removeItemFromCart, 
    updateItemPriceInCart } = require('../controllers/cartController.js');

// Получение корзины по userId
router.get('/user/:userId', getCartByUserId); // Изменено на более логичный путь

// Добавление товара в корзину
router.post('/:cartId/add', addItemToCart);

// Маршрут для удаления элемента из корзины
router.delete('/:cartId/course/:courseId', removeItemFromCart);

// Маршрут для переключения цены в корзине при наличии опций по цене
router.put('/:cartId/courses/:courseId/price', updateItemPriceInCart);

module.exports = router;


