require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const Router = require('./routes/index.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  secret: 'a4b5c6d7e8f90123456789abcdefghijklmnopqrstuvwxyzABCDEF',
  resave: false,
  saveUninitialized: true
}));

app.use('/', Router.jobPosterRoute, Router.workerRoute, Router.adminRoute, Router.paymentRoutes);

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  next(err);
});

module.exports = app;