const router = require('express').Router();

const Reddit = require('../models/reddit.model');
const authenticate = require('./middlewares/authenticate');
const _ = require('lodash');

router.post('/', authenticate, (req, res) => {
  let body = _.pick(req.body, ['description', 'author']);
  let newReddit = new Reddit(body);
  newReddit
    .save()
    .then(reddit => {
      res.send({ reddit });
    })
    .catch(e => {
      console.log('logging in reddit post', e);
      res.status(400).send();
    });
});

router.patch('/:id', authenticate, (req, res) => {
  let body = _.pick(req.body, ['description', 'author']);
  Reddit.findOneAndUpdate(
    { _id: req.params.id, author: req.user._id },
    { description: body.description },
    { new: true }
  )
    .populate()
    .then(reddit => {
      if (!reddit) {
        return res.status(401).send();
      }
      return res.send({ reddit });
    })
    .catch(e => {
      console.log('loggin in reddit patch', e);
      return res.status(400).send();
    });
});

router.delete('/:id', authenticate, (req, res) => {
  Reddit.findOneAndRemove({ _id: req.params.id, author: req.user._id })
    .then(reddit => {
      if (!reddit) {
        return res.status(401).send();
      }
      return res.send({ reddit });
    })
    .catch(e => {
      console.log('logging in reddit delete', e);
      return res.status(400).send();
    });
});

router.get('/all', (req, res) => {
  Reddit.find({})
    .populate('author')
    .then(reddits => {
      return res.send({ reddits });
    })
    .catch(e => {
      console.log('logging in get all reddits', e);
      return res.status(400).send();
    });
});

router.get('/:id', (req, res) => {
  Reddit.findById(req.params.id)
    .populate('author comments')
    .then(reddit => {
      if (!reddit) {
        return res.status(404).send();
      }
      return res.send({ reddit });
    })
    .catch(e => {
      console.log('loggining in get single reddit', e);
      return res.status(400).send();
    });
});

router.patch('/upvote/:id', authenticate, (req, res) => {
  Reddit.findById(req.params.id)
    .then(reddit => {
      if (!reddit) {
        return res.status(404).send();
      }
      let indexUv = reddit.upVotes.indexOf(req.user._id);
      let indexDv = reddit.downVotes.indexOf(req.user._id);
      if (
        indexUv === -1 &&
        reddit.author.toHexString() != req.user._id.toHexString()
      ) {
        reddit.upVotes.push(req.user._id);
        if (indexDv > -1) {
          reddit.downVotes.splice(indexDv, 1);
        }
        reddit.save().then(reddit => {
          return res.send({ reddit });
        });
      } else {
        return res.status(401).send('unauthorised');
      }
    })
    .catch(e => {
      console.log('logging in upvote reddit', e);
      return res.status(404).send();
    });
});
router.patch('/downvote/:id', authenticate, (req, res) => {
  Reddit.findById(req.params.id)
    .then(reddit => {
      if (!reddit) {
        return res.status(404).send();
      }
      let indexDv = reddit.downVotes.indexOf(req.user._id);
      let indexUv = reddit.upVotes.indexOf(req.user._id);
      if (
        indexDv === -1 &&
        reddit.author.toHexString() != req.user._id.toHexString()
      ) {
        reddit.downVotes.push(req.user._id);
        if (indexUv > -1) {
          reddit.upVotes.splice(indexUv, 1);
        }
        reddit.save().then(reddit => {
          return res.send({ reddit });
        });
      } else {
        return res.status(401).send('unauthorised');
      }
    })
    .catch(e => {
      console.log('logging in downvote reddit', e);
      return res.status(400).send();
    });
});

module.exports = router;
