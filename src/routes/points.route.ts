import * as express from 'express';

import { PointsController } from '../controllers/points.controller';
import { TransactionRecord } from '../types';

export const router = express.Router();

const controller = new PointsController();

router.post('/transaction', (req, res) => {
  const transaction: TransactionRecord = {
    payer: req.body.payer,
    points: req.body.points,
    timestamp: new Date(req.body.timestamp),
  };
  controller.addTransaction(transaction);
  res.status(201).send();
});

router.post('/spend', (req, res) => {
  const result = controller.spendPoints(req.body.points);
  res.json(result);
});

router.get('/balances', (req, res) => {
  const balances = controller.getBalances();
  res.json(balances);
});

router.delete('/clear', (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).send();
  } else {
    controller.clearData();
    res.send();
  }
});
