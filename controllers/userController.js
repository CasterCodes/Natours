const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const sharp = require('sharp');
const userModel = require('./../models/userModel');
const Factory = require('./../controllers/handlerFactory');
const mutler = require('multer');

// file uploads
const mutlerStorage = mutler.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/img/users/');
  },
  filename: (req, file, callback) => {
    const ext = file.mimetype.split('/')[1];
    callback(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(new AppError('Not an image please upload an image !', 400), false);
  }
};
const upload = mutler({ storage: mutlerStorage, fileFilter: multerFilter });
exports.uploadUserPhoto = upload.single('photo');
// const mutlerStorage = mutler.memoryStorage();
// exports.resizeUserPhoto = (req, res, next) => {
//   if (!req.file) return next();
//   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
//   sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/users/${req.file.filename}`);

//   next();
// };
const filteredObj = (body, ...allowedFields) => {
  const newObj = {};
  Object.keys(body).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = body[el];
  });

  return newObj;
};

// Me side
exports.updateMe = catchAsync(async (req, res, next) => {
  // check if the user is trying to update password
  if (req.body.password || req.body.confrimPassword) {
    return next(
      new AppError('This not route is not updating your password', 403)
    );
  }

  // filter unwanted fields
  const filteredBody = filteredObj(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;

  const user = await userModel.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: user,
    },
  });

  next();
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    messgae: 'Account Deleted',
  });

  next();
});

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

// Admin Side
// users route handler
exports.getAllUsers = Factory.getAll(userModel);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This  router is nod defined ! Please use sign up route',
  });
};

// DELETE USER
exports.deleteUser = Factory.deleteOne(userModel);

// UPDATE USER
exports.updateUser = Factory.updateOne(userModel);

// Get a single user
exports.getSingleUser = Factory.getOne(userModel);
