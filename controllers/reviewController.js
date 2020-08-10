const catchAsync = require('./../utils/catchAsync');
const reviewModel = require('./../models/reviewModel');
const Factory = require('./../controllers/handlerFactory');
exports.createReview = catchAsync(async (req, res, next) => {
  const { review, rating } = req.body;
  const user = req.body.user ? req.body.user : req.user.id;
  const tour = req.body.tour ? req.body.tour : req.params.tourId;
  const newReview = await reviewModel.create({
    review,
    rating,
    user,
    tour,
  });
  res.status(200).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

// get all reviews
exports.getReviews = Factory.getAll(reviewModel);

// delete Review
exports.deleteReview = Factory.deleteOne(reviewModel);

// update Review
exports.updateReview = Factory.updateOne(reviewModel);

// get review
exports.getSingleReview = Factory.getOne(reviewModel);
