const Storage = require('./classes/Storage');
const Validator = require('./classes/Validator');
const Interval = require('./classes/Interval');

module.exports.init = (app) => {
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
  });

  app.get('/storage', (req, res) => {
    if (!Validator.isNumeric(req.query.sessionId)) {
      res.status(400);
      res.send('sessionId must be numeric');
    }
    const storage = new Storage('records', req.query.sessionId, () => {
      console.log('sending:', storage.store);
      res.status(200);
      res.send(JSON.stringify(storage.store));
    });
  });

  app.post('/data', (req, res) => {
    console.log('req.body', req.body);
    if (!Validator.isNumeric(req.body.sessionId)) {
      res.status(400);
      res.send('sessionId must be numeric');
    }
    const sessionId = req.body.sessionId;
    delete req.body.sessionId;
    const keys = Object.keys(req.body).filter(key => {
      if (!Validator.isAlphabetic(key)) {
        res.status(400);
        res.send('keys must be alphabetic');
        return false;
      }
      return true;
    });
    if (!keys.length) return;
    const storage = new Storage('records', sessionId, () => {
      storage.add(keys.reduce((value, key, index) => {
        value[key] = Object.values(req.body)[index];
        return value;
      }, {}), () => {
        console.log('updated storage. New stock:', storage.store);
        res.status(200);
        res.end();
      });
    });
  });

  app.get('/interval', (req, res) => {
    console.log('req.query', req.query);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    const interval = new Interval(req.query.period);
    interval.registerFunction(req.query.tickSecond, () => {
      console.log('triggered registered function');
      res.write(`event: tick\n`);
      res.write(`id: ${getId(6)}\n`);
      res.write(`data: ${JSON.stringify({
        type: 'tick',
        timestamp: Date.now(),
      })}\n\n`);
    });
    interval.start();
  });

  function getId(length) {
    return Array(length).fill('').map(() => Math.floor(Math.random() * (10))).join('');
  }
};
