var createError = require('http-errors');
var express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session= require("express-session");
const passport = require('passport');
const flash= require('connect-flash');
const favicon = require('serve-favicon');

var indexRouter = require('./routes/indexRouter');
const apiRoutes = require('./routes/apiRoutes');
const usersRouter = require('./models/Admin');

var app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    sameSite: 'strict'
  }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(flash());


// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb'}));
app.use(express.json({limit: '10mb'}));

// Mount api routes
app.use('/api/', apiRoutes);


// Mount index routes
app.use('/', indexRouter);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/')));

app.use('/', indexRouter);

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
