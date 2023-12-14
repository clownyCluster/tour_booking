const express = require('express');
const router = express.Router();

const authController = require('../controller/authController');

const userController = require('../controller/userController');
// app.use('/api/v1/users', router);

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
// router.post('/', userController.createUser);
router.get('/', userController.getUser);
router.patch('/:id', userController.updateUser);

module.exports = router;
