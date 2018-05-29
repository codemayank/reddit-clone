const router = require('express').Router();
const User = require('../models/user.model');
const _ = require('lodash');
const authenticate = require('./middlewares/authenticate');

router.post('/register', (req, res) => {
  let body = _.pick(req.body, ['username', 'password']);
  let newUser = new User(body);
  newUser
    .save()
    .then(() => {
      return newUser.generateAuthToken();
    })
    .then(token => {
      res.header('x-auth', token).send(newUser);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.post('/login', (req, res) => {
  User.findByCredentials(req.body.username, req.body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header('x-auth', token).send({ user });
      });
    })
    .catch(e => {
      console.log('logging in user login', e);
      res.status(400).send(e);
    });
});

router.delete('/logout', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});
module.exports = router;
