const path = require('path');
const express = require('express');
const app = express();
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');
const morgan = require('morgan');

const cookieParser = require('cookie-parser');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// express-rate-limit- to limit the number of request from a single ip adress
const rateLimit = require('express-rate-limit');

// helmet a package to set http headers
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp');

const compression = require('compression');

app.use(express.json({ extended: false, limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many request from this ip address! Please try again after one hour',
});

app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// data sanitization against NoSQl injections
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent http parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use(compression());
// routes
app.use('/', require('./routes/overviewRouter'));
app.use('/api/v1/users', require('./routes/usersRouter'));
app.use('/api/v1/tours', require('./routes/toursRouter'));
app.use('/api/v1/reviews', require('./routes/reviewRouter'));

// 404 route
app.all('*', (req, res, next) => {
  next(new AppError(`the url ${req.originalUrl} was not found`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
