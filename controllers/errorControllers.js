const AppError = require('../utils/appError');

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path} : ${error.value}`;
  return new AppError(message, 404);
};

const handleDuplicateErrorDB = (error) => {
  const value = error.message.match(/((?=(\\?))\2.)/)[0];
  const message = `Duplicate key value ${value} : Please use another value`;
  return new AppError(message, 400);
};

const sendErrorDev = (error, req, res) => {
  // api
  if (req.originalUrl.startsWith('/api')) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error: error,
      name: error.name,
      stack: error.stack,
    });
  } else {
    // rendered website
    res.status(error.statusCode).render('error', {
      title: 'Somethig Went Wrong',
      message: error.message,
    });
  }
};

const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid Inputs  ${errors.join('. ')} `;
  return new AppError(message, 400);
};

const handleJwtError = (error) =>
  new AppError('Invalid token Please Login Again', 401);

const handleExpiredJwtToken = (error) =>
  new AppError('Your token has expired! Please login in again', 401);

const sendErrorProd = (error, req, res) => {
  // operational error - trusted
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

    // programming error or other error
  } else {
    // log the error
    console.log(error);
    // send the error to the client
    res.status(error.statusCode).json({
      status: 'error',
      message: 'something went wrong!',
    });
  }
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'Server error';
  if (process.env.NODE_ENV === 'production') {
    let err = { ...error };
    if (error.name === 'CastError') {
      err = handleCastErrorDB(err);
    }
    if (error.code === 11000) {
      error = handleDuplicateErrorDB(error);
    }

    if (error.name === 'validationError') {
      error = handleValidationError(error);
    }

    if (error.name == 'JsonWebTokenError') {
      error = handleJwtError(error);
    }

    if (error.name === 'TokenExpiredError') {
      error = handleExpiredJwtToken(error);
    }
    sendErrorProd(error, req, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  }
};
