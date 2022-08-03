import * as express from 'express';

import * as points from './routes/points.route';

const app = express();
const port = process.env.PORT || 3000;

// enable JSON parsing
app.use(express.json());

// hook up routes
app.use('/points', points.router);

// universal error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || 'An Error Occurred!',
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});
