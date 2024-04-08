const express = require('express');

const router = express.Router();

// const upload = multer({ storage });

const authController = require('../controller/authController');

const userController = require('../controller/userController');
// app.use('/api/v1/users', router);

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/forgotPassword', authController.forgotPassword);

// Protect middleware to protect the routes after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteUser);

// Restrict this to only other members apart from normal user.
router.use(authController.restrictTo('admin', 'lead-guide', 'guide'));

router.get('/', userController.getAllUsers).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
