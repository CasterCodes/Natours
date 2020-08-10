const express = require('express');
const route = express.Router();
const usersController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// User
route.post('/signup', authController.signUp);
route.post('/login', authController.login);
route.get('/logout', authController.logout);
route.post('/forgotPassword', authController.forgotPassword);
route.patch('/resetPassword/:token', authController.resetPassword);
route.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
route.patch(
  '/updateMe',
  authController.protect,
  usersController.uploadUserPhoto,
  usersController.updateMe
);
route.delete('/deleteMe', authController.protect, usersController.deleteMe);
route.get(
  '/getMe',
  authController.protect,
  usersController.getMe,
  usersController.getSingleUser
);

// Admin
route
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    usersController.getAllUsers
  )
  .post(usersController.createUser);
route
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    usersController.getSingleUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    usersController.deleteUser
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    usersController.updateUser
  );
module.exports = route;
