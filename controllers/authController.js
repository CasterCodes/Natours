const { promisify } = require('util');
const userModel = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const Email = require('./../utils/email');
const crypto = require('crypto');

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  const url = `${req.protocol}://${req.get('host')}/user/account`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  console.log(await new Email(newUser, url).sendWelcome());
  const token = await jwt.sign(
    { id: newUser._id },
    process.env.JWT_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_TOKEN_EXPIRESIN,
    }
  );
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });
  newUser.password = undefined;
  res.status(200).json({
    status: 'success',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if emai and password exist
  if (!email || !password) {
    return next(new AppError('Please enter email or Password', 400));
  }
  //  check if user exists
  const user = await userModel.findOne({ email: email }).select('+password');

  if (!user) return next(new AppError('No user with that credintials', 401));

  const correct = await user.correctPassword(password, user.password);

  if (!correct) return next(new AppError('Incorrect Password', 401));
  // if everything is okey generate a token and send it to the client

  const token = await jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRESIN,
  });
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access')
    );
  }
  // refication of the token
  const decoded = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);

  // if user with that token still exits
  const currentUser = await userModel.findById(decoded.id);
  if (!currentUser)
    return next(new AppError('User with that token does not exists', 401));

  // check if the user change the password aftet the token was issued
  if (currentUser.changedPassword(decoded.iat)) {
    return next(
      new AppError(
        'The user recently changed password ! Please login again',
        401
      )
    );
  }
  // send to to the
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await jwt.verify(
        req.cookies.jwt,
        process.env.JWT_TOKEN_SECRET
      );
      const currentUser = await userModel.findById(decoded.id);
      if (!currentUser) return next();

      // check if the user change the password aftet the token was issued
      if (currentUser.changedPassword(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }

  next();
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on the provided email
  const user = await userModel.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('There is not user with that email', 404));

  // generate a random reset token

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // send it by email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  try {
    // to do
    await new Email(user, resetUrl).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to the email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    return next(
      new AppError('There was an error sending the email. Try Again Later', 500)
    );
  }

  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user base on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // set the new password if the token has not expired
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // update the changedpasswordAt property for the user

  // login the  user send the jwt token client
  const token = await jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRESIN,
  });

  res.status(200).json({
    status: 'success',
    token,
  });

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this actions', 403)
      );
    }

    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection
  const user = await await userModel.findById(req.user.id).select('+password');

  //  check if the posted password is correct
  const correctPassword = await user.correctPassword(
    req.body.currentPassword,
    user.password
  );
  if (!correctPassword)
    return next(new AppError('Your currentPassword is wrong', 401));

  //  update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();
  // login the user in
  const token = await jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRESIN,
  });
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    token,
  });

  next();
});
