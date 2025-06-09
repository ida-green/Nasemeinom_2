// cartRoutes.js
const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');

// Получение корзины по userId
router.get('/user/:userId', CartController.getCartByUserId); // Изменено на более логичный путь

// Добавление товара в корзину
router.post('/:cartId/add', CartController.addItemToCart);

// Маршрут для удаления элемента из корзины
router.delete('/:cartId/course/:courseId', CartController.removeItemFromCart);

// Маршрут для переключения цены в корзине при наличии опций по цене
router.put('/:cartId/courses/:courseId/price', CartController.updateItemPriceInCart);

module.exports = router;


