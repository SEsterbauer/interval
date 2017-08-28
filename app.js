const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');

const app = express();

app.use('/public', express.static(path.join(__dirname, '/public')));

// logging
app.use((req, res, next) => {
  console.log(`REQUEST: ${req.method} ${req.url}`);
  next();
});

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// exception handler
// keep the 4 params for express error handling
app.use((error, req, res, next) => { // eslint-disable-line
  console.error(error, req.method, req.url, req.headers);
  res.status(500);
  res.send(error.message || error);
});

routes.init(app);

app.listen(3000, () => {
  console.log('App listening on port 3000!')
});
