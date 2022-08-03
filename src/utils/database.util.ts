import { TransactionRecord } from "../types";

// TODO replace with a database like PostgreSQL, etc.
export class Database {
  private static instance: Database;

  private constructor() { }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  private points: TransactionRecord[] = [];
  private usedPoints: TransactionRecord[] = [];

  // Order by timestamp, earliest first
  private transactionComparer = (a: TransactionRecord, b: TransactionRecord) => a.timestamp.getTime() - b.timestamp.getTime();

  /**
   * INSERT INTO transaction_record (payer, points, timestamp)
   * VALUES (...)
   */
  insert(transaction: TransactionRecord): void {
    if (transaction.points > 0) {
      this.points.push(transaction);
      this.points.sort(this.transactionComparer);
    } else {
      this.usedPoints.push(transaction);
      this.usedPoints.sort(this.transactionComparer);
    }
  }

  /**
   * SELECT *
   * FROM transaction_record
   * WHERE points < 0
   * ORDER BY timestamp;
   */
  getUsedPoints(): TransactionRecord[] {
    return this.usedPoints;
  }

  /**
   * SELECT *
   * FROM transaction_record
   * WHERE points > 0
   * ORDER BY timestamp;
   */
  getPoints(): TransactionRecord[] {
    return this.points;
  }

  /**
   * DELETE FROM transaction_record;
   */
  clear(): void {
    this.points = [];
    this.usedPoints = [];
  }
}
