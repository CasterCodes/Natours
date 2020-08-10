const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const tourModel = require('./../../models/tourModel');
const reviewModel = require('./../../models/reviewModel');
const userModel = require('./../../models/userModel');
dotenv.config({ path: `${__dirname}/../../config.env` });
const DB = process.env.DATEBASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('Connected to mongo');
  });

// const port = process.env.PORT || 5000;
// app.listen(port, () => console.log(`Server running on port ${port}`));

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// import data
const importData = async () => {
  try {
    await tourModel.create(tours);
    await reviewModel.create(reviews, { validateBeforeSave: false });
    await userModel.create(users, { validateBeforeSave: false });
    console.log('Data successfully loaded');
    process.exit(1);
  } catch (error) {
    console.log(error.message);
  }
};

// Delete data from the database
const deleteData = async () => {
  try {
    await tourModel.deleteMany({});
    await reviewModel.deleteMany({});
    await userModel.deleteMany({});
    console.log('Data successfully deleted');
    process.exit(1);
  } catch (error) {
    console.log(error.message);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
