const session = require('express-session');
const knexSessionStore = require('connect-session-knex')(session);
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');

const sessionOptions = {
  name: 'chocoCookie',
  secret: 'myfavoratecookieischocolatechip',
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false,
    httpOnly: true
  },
  resave: false,
  saveUninitialized: false,

  store: new knexSessionStore({
    knex: require('../database/db-config.js'),
    tableName: 'sessions',
    sidFieldName: 'sid',
    createTable: true,
    clearInterval: 1000 * 60 * 60
  })
};
const server = express();

server.use(express.json());
server.use(helmet());
server.use(cors());
server.use(session(sessionOptions));

server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  res.json('What is the magic work?');
});

module.exports = server;
