const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const publicPath = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userController = require('./controllers/user.controller');
const redditController = require('./controllers/reddits.controller');
const commentController = require('./controllers/comments.controller');
app.use('/user', userController);
app.use('/reddit', redditController);
app.use('/reddit/comment', commentController);

mongoose.connect(process.env.MongoDbURI);
app.listen(port, () => {
  console.log(
    `listening to port ${port} db connection ${process.env.MongoDbURI}`
  );
});
