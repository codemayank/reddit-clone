# Reddit Clone

This is just a demo backend of a REST API clone of reddit made using Node.js, MongoDb, Express.js.

## features

Features of this app include the following

1.  API endpoint to register a user using username and password.
2.  API endpoint to post / edit / delete reddits.\*\*
3.  API endpoint to post / edit/ delete comments on reddits.\*\*
4.  API endpoints to upvote and downvote on a reddit.\*\*
5.  API endpoint to get all the reddits posted.
6.  API endpoint to get a particular reddit.
7.  API endpoint to upvote and downvote on a comment.\*\*

8.  User authetication done using jwt.

\*\* user authentication required, tokens to be sent through header property 'x-auth' see server/controllers/middleware/authenticate.js to see how user is authenticated.

## TODO:

Create API to add replies to comments.

## Created By:

Mayank Yadav
