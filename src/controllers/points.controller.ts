
import { Balance, HttpError, Transaction, TransactionRecord } from "../types";
import { Cache } from "../utils/cache.util";
import { Database } from "../utils/database.util";

export class PointsController {

  private db = Database.getInstance();
  private cache = Cache.getInstance();

  addTransaction(transaction: TransactionRecord): void {
    if (transaction.points == 0) {
      throw new HttpError(400, 'Points cannot be zero.');
    }

    if (this.cache.getTotalPoints() == null) {
      this.rebuildPointsCache();
    }
    if (this.cache.getTotalPoints() + transaction.points < 0) {
      throw new HttpError(400, 'User points cannot go negative.');
    }

    this.db.insert(transaction);
    this.cache.updateBalance(transaction);
  }

  spendPoints(points: number): Transaction[] {
    if (points <= 0) {
      throw new HttpError(400, 'Points must be positive.');
    }

    const balances: Balance = {};
    let runningTotal = 0;
    for (const transaction of this.db.getUsedPoints()) {
      runningTotal += transaction.points;
    }

    for (const transaction of this.db.getPoints()) {
      if (transaction.points + runningTotal <= 0) {
        // simply count, points are already used
        runningTotal += transaction.points;
      } else {
        let pointsToUse = transaction.points;
        if (runningTotal < 0) {
          // portion of points are already used
          pointsToUse = runningTotal + pointsToUse;
          runningTotal = 0;
        }
        if (runningTotal + pointsToUse > points) {
          // we have excess points, only use some
          pointsToUse = points - runningTotal;
        }

        runningTotal += pointsToUse;
        balances[transaction.payer] = (balances[transaction.payer] ?? 0) - pointsToUse;
      }

      if (runningTotal == points) {
          break;
      }
    }

    if (runningTotal < points) {
      throw new HttpError(400, 'Not enough points available.');
    }

    let result: Transaction[] = [];
    const now = new Date();
    for (const payer in balances) {
      result.push({
        payer,
        points: balances[payer],
      });
      this.addTransaction({
        payer,
        points: balances[payer],
        timestamp: now,
      });
    }

    return result;
  }

  getBalances(): Balance {
    return this.cache.getPoints() || this.rebuildPointsCache();
  }

  clearData(): void {
    this.db.clear();
    this.cache.clear();
  }

  private rebuildPointsCache(): Balance {
    const points: Balance = {};

    for (const transaction of this.db.getPoints()) {
      points[transaction.payer] = (points[transaction.payer] ?? 0) + transaction.points;
    }

    for (const transaction of this.db.getUsedPoints()) {
      points[transaction.payer] = (points[transaction.payer] ?? 0) + transaction.points;
    }

    this.cache.setBalance(points);

    return points;
  }
};
