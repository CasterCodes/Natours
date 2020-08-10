const express = require('express');
const route = express.Router();
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRouter');

route.use('/:tourId/reviews', reviewRouter);

route
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
route
  .route('/top-5-cheap')
  .get(
    authController.protect,
    tourController.aliasTopTours,
    tourController.getAllTours
  );
route
  .route('/tour-stats')
  .get(
    authController.protect,
    authController.restrictTo('guide', 'lead-guide'),
    tourController.getTourStats
  );
route
  .route('/tour-monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.getMonthlyPlan
  );
route
  .route('/:id')
  .get(tourController.getSingleTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadToursPhoto,
    tourController.resizeTourImages,
    tourController.updateTour
  );
route
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
route.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

route.route('distances/');
module.exports = route;
