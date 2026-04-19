const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('./models/db');
const Admin = require('./models/index').admins;
const cors = require('cors');
const session = require('express-session')
require('dotenv').config();
const Router = require('./routes/index.js');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookie: {maxAge: 30 * 24 * 60 * 60 * 1000},           //   maxAge: 30 * 24 * 60 * 60 * 1000;
  secret: 'a4b5c6d7e8f90123456789abcdefghijklmnopqrstuvwxyzABCDEF',
  resave: false,
  saveUninitialized: true
}))

app.use('/', Router.jobPosterRoute,Router.workerRoute, Router.adminRoute,Router.paymentRoutes);
// apiRoutes(app);
// app.use('/worker', Router.workerRoute);
// app.use('/jobPoster', Router.jobPosterRoute);
// app.use('/admin', Router.adminRoutes);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  next(err);
  // render the error page
  // res.status(err.status || 500).json(err);
  // res.render('error');
});

 

setTimeout(async () => {
  try {
    const existingAdmins = await Admin.findAll();
    if (existingAdmins.length === 0) {
      await Admin.create({ email: 'admin@rakett.com',password:'admin' });
      console.log('Admin data populated successfully.');
    } else {
      // console.log('Admin data already exists.');
    }
  } catch (error) {
    console.error('Error:', error);
  } 
}, 2000);


module.exports = app;
