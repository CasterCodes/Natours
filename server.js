const app = require('./app');
process.on('uncaughtException', (error) => {
  console.log(error.name, error.message);
  console.log('uncaughtException');
  process.exit(1);
});

const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

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

const port = process.env.PORT || 5000;
const server = app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);

process.on('unhandledRejection', (error) => {
  console.log('unhandledRejection');
  console.log(error.name, error.message);
  server.close(() => process.exit(1));
});
