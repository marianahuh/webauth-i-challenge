const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const db = require('./database/db-config.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(express.json());
server.use(helmet());
server.use(cors());

server.get('/', (req, res) => {
  res.send('Hi There!');
});

server.post('/api/register', (req, res) => {
  let user = req.body;
  // hash password
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', validate, (req, res) => {
  let { username } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user) {
        res
          .status(200)
          .json({ message: `Welcome ${user.username}, you're logged in!` });
      } else {
        res.status(403).json({ message: 'You shall not pass!' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', validate, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

function validate(req, res, next) {
  const { username, password } = req.headers;

  if (username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          next();
        } else {
          res.status(403).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(err => {
        res.status(500).json({ message: 'Unexpected Error' });
      });
  } else {
    res.status(400).json({ message: 'No Credentials provided' });
  }
}

module.exports = server;
