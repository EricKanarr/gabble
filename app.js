console.log("howdy howdy");
const express = require('express');
const parseurl = require('parseurl');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const path = require('path');
const mustacheExpress = require('mustache-express');
// const routes = require('./routes');
const models = require("./models");

const app = express();

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./home'));
app.use(expressValidator());
// app.use(routes);

// const user = models.user.build({
//   name: 'erickanarr',
//   password: 'erickanarr'
// })
// user.save();


//take to homepage
app.get('/home', function(req, res){
  res.render('home');
});

// take to messages page
app.get('/messages', function(req, res){
  res.render('messages');
});

// take to signup page
app.get('/signup', function(req, res){
  res.render('signup');
});

// log-in at home page
app.get('/home', function(req, res){
  if (req.session && req.session.authenticated) {
    var user = models.user.findOne({
      where: {
        username: req.session.username,
        password: req.session.password
      }
    }).then(function(user){
      if(user){
        req.session.username = req.body.username;
        req.session.userid = user.dataValues.id;
        let username = req.session.username;
        let userid = req.session.userid;
        res.render('messages', {user: user});
      }
    })
  }else {
    res.redirect('/home')
  }
})

app.post('/home', function(req, res){
  let username = req.body.username;
  let password = req.body.password;
  models.user.findOne({
    where: {
      username: username,
      password: password
    }
  }).then(user => {
    // add error handling, if pw not correct error thrown
    if (user.password == password){
      req.session.username = username;
      req.session.authenticated = true;
      console.log(req.session);
      res.redirect('/messages');
    }else{
      res.redirect('/signup');
    }
  })
})

// create new gab user with signup
// nest this in a app.post
app.post('/signup', function(req, res){
// Task.create({ title: 'foo', description: 'bar', deadline: new Date() }).then(task => {
  // you can now access the newly created task via the variable task
// })



























app.listen(3000, function(){
  console.log("it all worked")
});
