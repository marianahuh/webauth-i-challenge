const router = require('express').Router();
const bcrypt = require('bcryptjs');

const Users = require('../users/users-model.js');

router.post('/register', (req, res) => {
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

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
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

router.delete('/logout', (req, res) => {
  if (req.session) {
    console.log(req.session);
    req.session.destroy(err => {
      if (err) {
        res.status(400).send('unable to logout...');
      } else {
        res.send('You have logged out successfully');
      }
    });
  } else {
    res.end();
  }
});

module.exports = router;
