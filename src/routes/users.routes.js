const { Router } = require('express');

const userRoutes = Router();

const UserController = require('../controllers/UsersCotroller');
const userController = new UserController();

userController.post('/', userController.create);


module.exports = userRoutes;