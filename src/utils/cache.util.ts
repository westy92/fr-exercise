import { Balance, TransactionRecord } from "../types";

// TODO replace with a cache like Redis, etc.
export class Cache {
  private static instance: Cache;

  private constructor() { }

  public static getInstance(): Cache {
    if (!Cache.instance) {
        Cache.instance = new Cache();
    }

    return Cache.instance;
  }

  private points: Balance = null;
  private totalPoints: number = null;

  setBalance(balance: Balance): void {
    this.points = balance;
    this.totalPoints = Object.values(balance).reduce((acc, cur) => acc += cur, 0);
  }

  updateBalance(transaction: TransactionRecord): void {
    this.totalPoints += transaction.points;
    this.points[transaction.payer] = (this.points[transaction.payer] ?? 0) + transaction.points;
  }

  getTotalPoints(): number {
    return this.totalPoints;
  }

  getPoints(): Balance {
    return this.points;
  }

  clear(): void {
    this.points = null;
    this.totalPoints = null;
  }
}
