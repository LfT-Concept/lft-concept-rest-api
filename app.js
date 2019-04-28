const express = require('express');

const feedRoutes = require('./routes/feed');

const app = express();

app.use('/feed', feedRoutes);

app.use('/', (req, res, next) => {
  res.status(200).send("<h1>Lft Concept REST API</h1>").end();
});

app.listen(process.env.PORT || 8080);