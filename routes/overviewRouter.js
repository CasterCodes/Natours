const express = require('express');
const route = express.Router();
const viewController = require('./../controllers/viewsController');
const authController = require('../controllers/authController');

// Routes
route.get('/', authController.isLoggedIn, viewController.getOverview);
route.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
route.get(
  '/user/login',
  authController.isLoggedIn,
  viewController.getLoginForm
);
route.get('/user/account', authController.protect, viewController.getAccount);

module.exports = route;
