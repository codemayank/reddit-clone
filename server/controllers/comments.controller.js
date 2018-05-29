const router = require('express').Router();

const Reddit = require('../models/reddit.model');
const Comment = require('../models/comment.model');
const _ = require('lodash');
const authenticate = require('./middlewares/authenticate');

router.post('/:reddit_id', authenticate, (req, res) => {
  console.log(req.params.reddit_id);
  Reddit.findById(req.params.reddit_id)
    .then(reddit => {
      if (!reddit) {
        return res.status(404).send();
      }
      let newComment = new Comment({
        description: req.body.description,
        author: req.user._id
      });
      newComment.save().then(comment => {
        reddit.comments.push(comment._id);
        reddit.save().then(reddit => {
          return res.send({ reddit });
        });
      });
    })
    .catch(e => {
      console.log('logging in comment', e);
      return res.status(400).send();
    });
});

router.patch('/:comment_id', authenticate, (req, res) => {
  Comment.findOneAndUpdate(
    { _id: req.params.comment_id, author: req.user._id },
    { description: req.body.description },
    { new: true }
  )
    .then(comment => {
      if (!comment) {
        return res.status(404).send();
      }

      return res.send({ comment });
    })
    .catch(e => {
      console.log('logging in edit comment', e);
      return res.status(400).send();
    });
});

router.delete('/:reddit_id/:comment_id', authenticate, (req, res) => {
  Reddit.findById(req.params.reddit_id)
    .then(reddit => {
      if (!reddit) {
        return res.status(404).send('reddit not found');
      }
      let commentIndex = reddit.comments.indexOf(req.params.comment_id);

      if (commentIndex > -1) {
        Comment.findOneAndRemove({
          _id: req.params.comment_id,
          author: req.user._id
        }).then(comment => {
          if (!comment) {
            return res.status(404).send('comment does not exist');
          }
          reddit.comments.splice(commentIndex, 1);
          reddit.save().then(reddit => {
            return res.send({ reddit });
          });
        });
      } else {
        return res
          .status(404)
          .send('comment does not belong to this reddit or does not exists');
      }
    })
    .catch(e => {
      console.log('logging in delete comment', e);
      return res.status(400).send();
    });
});
router.patch('/:voteType/:comment_id', authenticate, (req, res) => {
  Comment.findById(req.params.comment_id)
    .then(comment => {
      if (!comment) {
        return res.status(404).send('comment not found');
      }
      let indexUv = comment.upVotes.indexOf(req.user._id);
      let indexDv = comment.downVotes.indexOf(req.user._id);
      if (req.params.voteType === 'upVote') {
        if (
          indexUv === -1 &&
          comment.author.toHexString() !== req.user._id.toHexString()
        ) {
          comment.upVotes.push(req.user._id);
          if (indexDv > -1) {
            comment.downVotes.splice(indexDv, 1);
          }
          return comment.save().then(comment => {
            return res.send({ comment });
          });
        } else {
          return res.status(401).send();
        }
      } else if (req.params.voteType === 'downVote') {
        if (indexDv === -1 && comment.author !== req.user._id) {
          comment.downVotes.push(req.user._id);
          if (indexUv > -1) {
            comment.upVotes.splice(indexUv, 1);
          }
          return comment.save().then(comment => {
            return res.send({ comment });
          });
        } else {
          return res.status(401).send();
        }
      }
    })
    .catch(e => {
      console.log('logging in comment upvote', e);
      return res.status(400).send();
    });
});

module.exports = router;
