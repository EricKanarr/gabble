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

var pg = require('pg');

pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  client
    .query('SELECT table_schema,table_name FROM information_schema.tables;')
    .on('row', function(row) {
      console.log(JSON.stringify(row));
    });
});

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
// console.log(session);

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
app.get('/', function(req, res){
  // console.log(req.session);
  res.redirect('/home');
});

// take to messages page
// app.get('/messages', function(req, res){
//   res.render('messages');
// });

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
        password: req.session.password,
      }
    }).then(function(user){
      // console.log(username);
      if(user){
        req.session.username = req.body.username;
        // console.log(username);
        req.session.userid = user.dataValues.id;
        let username = req.session.username;
        // console.log(username);
        let userid = req.session.userid;
        res.render('messages', {user: username});
        // console.log(username);
      }
    })
  }else {
    res.redirect('/signup')
  }
})

app.post('/home', function(req, res){
  let username = req.body.username;
  // console.log(username);
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
      // console.log(req.session);
      res.redirect('/messages');
    }else{
      res.redirect('/signup');
    }
  })
})

// create new gab user with signup
app.post('/signup', function(req, res) {
  req.session.authenticated = true;
  req.session.username = req.body.name;
  req.session.username = req.body.password;

  const user = models.user.build({
    username: req.body.name,
    password: req.body.password
  })

  user.save();
  res.redirect('/home');
})

// add gab to messages table
// figure out associations
// app.post('/messages', function(req, res){
//   const messages = models.messages.build({
//     messageText: req.body.newgab
//   })
//   messages.save().then(function(messages){
//     console.log(messages);
//     res.redirect('/messages')
//   })
// })
// display messages
app.get('/messages', function(req, res){
  console.log("user gets to /messages and req.body.username: " + req.session.activeUser);

  models.messages.findAll().then(function(messages){
    res.render('messages', {messages: messages, gabname: req.session.activeUser})
  })
})

// add gab to messages table
// figure out associations
app.post('/messages', function(req, res){
  req.session.activeUser = req.body.username
  console.log("user posts to /messages and req.body.username: " + req.body.username);
  const messages = models.messages.build({
    messageText: req.body.newgab
  })
  messages.save().then(function(messages){
    console.log(messages);
    res.redirect('/messages')
  })
})

// app.post('/messages', function(req, res){
//   const messages = models.messages.build({
//     messageText: req.body.newgab
//   })
//   post.save().then(function(post){
//   })
// })


























app.listen(process.env.PORT || 3000, function(){
  console.log("it all worked")
});
