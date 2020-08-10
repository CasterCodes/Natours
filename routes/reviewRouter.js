const express = require('express');
const route = express.Router({ mergeParams: true });
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

route.get('/', reviewController.getReviews);
route.post('/create-review', reviewController.createReview);
route
  .route('/:id')
  .patch(authController.protect, reviewController.updateReview)
  .get(authController.protect, reviewController.getSingleReview)
  .delete(authController.protect, reviewController.deleteReview);

module.exports = route;
