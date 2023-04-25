const { Router } = require('express');

const userRoutes = Router();


const UserController = require('../controllers/UsersController');
const userController = new UserController();

const uploadConfig = require('../configs/upload');

const multer = require('multer');
const upload = multer(uploadConfig.MULTER);
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const UserAvatarController = require('../controllers/UserAvatarController');
const userAvatarController = new UserAvatarController();


userRoutes.post('/', userController.create);
userRoutes.put('/',ensureAuthenticated,  userController.update);
userRoutes.patch('/avatar', ensureAuthenticated, upload.single('avatar'), userAvatarController.update);
module.exports = userRoutes;