const { Router } = require('express');

const userRoutes = Router();

const UserController = require('../controllers/UsersCotroller');
const userController = new UserController();

userRoutes.post('/', userController.create);
userRoutes.put('/:id', userController.update);


module.exports = userRoutes;