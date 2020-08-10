const mongoose = require('mongoose');
const slugify = require('slugify');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have an name'],
      unique: [true, 'A tour name be unique'],
      trim: true,
      minlength: [10, 'Name must be greater than or equal to ten characters'],
      maxlength: [40, 'Name must be less than or equal to then characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty level'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Only easy, medium , difficult is required',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating should not be more than 5'],
      min: [1, 'Rating should not be  less than 1'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to the current doc - new document being created
          return val < this.price;
        },
        message: 'Discount price should be less than the acqual price',
      },
    },
    price: {
      type: Number,
      required: [true, 'Tour requires a price'],
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      required: [true, 'A tour must have description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: [Date],
    slug: {
      type: String,
      unique: true,
    },
    secrectTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// mongoose middleware
// DOCUMENT MIDDLEWARE - RUNS BEFORE THE CURRENT DOCUMENT IS .save() and .create() but not insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: '2dsphere' });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secrectTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
  });
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(`the query took ${Date.now() - this.start}`);
  next();
});

// AGGREGATION MIDDLE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secrectTour: { $ne: true } },
//   });
//   next();
// });

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'reviews',
  foreignField: 'tour',
  localField: '_id',
});

// create a tour model and export it
const tourModel = mongoose.model('tours', tourSchema);

module.exports = tourModel;
