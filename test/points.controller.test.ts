import { PointsController } from '../src/controllers/points.controller';
import { HttpError } from '../src/types';


describe('PointsController', () => {

  beforeEach(() => {
    const controller = new PointsController();
    controller.clearData();
  });

  test('Basic functionality', () => {
    const controller = new PointsController();

    // Add transactions
    controller.addTransaction({
      payer: "DANNON",
      points: 1_000,
      timestamp: new Date("2020-11-02T14:00:00Z"),
    });
    controller.addTransaction({
      payer: "UNILEVER",
      points: 200,
      timestamp: new Date("2020-10-31T11:00:00Z"),
    });
    controller.addTransaction({
      payer: "DANNON",
      points: -200,
      timestamp: new Date("2020-10-31T15:00:00Z"),
    });
    controller.addTransaction({
      payer: "MILLER COORS",
      points: 10_000,
      timestamp: new Date("2020-11-01T14:00:00Z"),
    });
    controller.addTransaction({
      payer: "DANNON",
      points: 300,
      timestamp: new Date("2020-10-31T10:00:00Z"),
    });

    // Check initial balances
    expect(controller.getBalances()).toEqual({
      "DANNON": 1_100,
      "UNILEVER": 200,
      "MILLER COORS": 10_000,
    });

    // Spend points
    expect(controller.spendPoints(5_000)).toEqual([
      { "payer": "DANNON", "points": -100 },
      { "payer": "UNILEVER", "points": -200 },
      { "payer": "MILLER COORS", "points": -4_700 },
    ]);

    // Check resulting balances
    expect(controller.getBalances()).toEqual({
      "DANNON": 1_000,
      "UNILEVER": 0,
      "MILLER COORS": 5_300,
    });
  });

  describe('addTransaction', () => {
    test('Prevents adding zero points', () => {
      const controller = new PointsController();

      expect(() => controller.addTransaction({
        payer: "DANNON",
        points: 0,
        timestamp: new Date("2020-11-02T14:00:00Z"),
      })).toThrow(new HttpError(400, 'Points cannot be zero.'));
    });

    test('Prevents points from going negative', () => {
      const controller = new PointsController();

      expect(() => controller.addTransaction({
        payer: "DANNON",
        points: -100,
        timestamp: new Date("2020-11-02T14:00:00Z"),
      })).toThrow(new HttpError(400, 'User points cannot go negative.'));
    });

    test('Transactions get added correctly', () => {
      const controller = new PointsController();

      controller.addTransaction({
        payer: "DANNON",
        points: 100,
        timestamp: new Date(),
      });

      expect(controller.getBalances()).toEqual({
        "DANNON": 100,
      });

      controller.addTransaction({
        payer: "DANNON",
        points: 1000,
        timestamp: new Date(),
      });

      expect(controller.getBalances()).toEqual({
        "DANNON": 1_100,
      });

      controller.addTransaction({
        payer: "DANNON",
        points: -600,
        timestamp: new Date(),
      });

      expect(controller.getBalances()).toEqual({
        "DANNON": 500,
      });
    });
  });

  describe('spendPoints', () => {
    test('Prevents spending negative or zero points', () => {
      const controller = new PointsController();

      expect(() => controller.spendPoints(0))
        .toThrow(new HttpError(400, 'Points must be positive.'));

      expect(() => controller.spendPoints(-100))
        .toThrow(new HttpError(400, 'Points must be positive.'));
    });

    test('Prevents over-spending points', () => {
      const controller = new PointsController();

      expect(() => controller.spendPoints(100))
        .toThrow(new HttpError(400, 'Not enough points available.'));

      controller.addTransaction({
        payer: "DANNON",
        points: 100,
        timestamp: new Date(),
      });

      expect(() => controller.spendPoints(200))
        .toThrow(new HttpError(400, 'Not enough points available.'));
    });
  });

  describe('getBalances', () => {
    test('Calculates balances correctly', () => {
      const controller = new PointsController();

      expect(controller.getBalances()).toEqual({});

      controller.addTransaction({
        payer: "DANNON",
        points: 100,
        timestamp: new Date(),
      });

      expect(controller.getBalances()).toEqual({
        "DANNON": 100,
      });

      controller.addTransaction({
        payer: "UNILEVER",
        points: 1_000,
        timestamp: new Date(),
      });

      expect(controller.getBalances()).toEqual({
        "DANNON": 100,
        "UNILEVER": 1_000,
      });

      controller.spendPoints(500);

      expect(controller.getBalances()).toEqual({
        "DANNON": 0,
        "UNILEVER": 600,
      });
    });
  });
});
