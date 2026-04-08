import Types "../types/transactions";
import Common "../types/common";
import List "mo:core/List";

module {
  public type Transaction = Types.Transaction;
  public type Category = Types.Category;
  public type WeekSummary = Types.WeekSummary;
  public type WeekRecord = Types.WeekRecord;
  public type Timestamp = Common.Timestamp;

  let NS_PER_DAY : Int = 86_400_000_000_000;
  let NS_PER_WEEK : Int = 604_800_000_000_000;

  // Returns a new Transaction with the given id
  public func newTransaction(
    nextId : Nat,
    amount : Float,
    description : Text,
    category : Category,
    timestamp : Common.Timestamp,
  ) : Transaction {
    { id = nextId; amount; description; category; timestamp };
  };

  // Compute Monday 00:00:00 UTC (nanoseconds) for the week containing nowNs.
  // ISO weekday: Thu=4, Mon=1. Epoch (1970-01-01) was a Thursday (day 4).
  // daysSinceEpoch mod 7 → 0=Thu,1=Fri,2=Sat,3=Sun,4=Mon,5=Tue,6=Wed
  public func weekStart(nowNs : Common.Timestamp) : Common.Timestamp {
    let daysSinceEpoch : Int = nowNs / NS_PER_DAY;
    // offset from Monday: (daysSinceEpoch - 4) mod 7, ensuring non-negative
    let offset : Int = ((daysSinceEpoch - 4) % 7 + 7) % 7;
    (daysSinceEpoch - offset) * NS_PER_DAY;
  };

  // Compute Sunday 23:59:59.999999999 UTC (nanoseconds) for the week containing nowNs.
  public func weekEnd(nowNs : Common.Timestamp) : Common.Timestamp {
    weekStart(nowNs) + NS_PER_WEEK - 1;
  };

  // Filter transactions whose timestamp falls within today's calendar day (UTC).
  public func filterToday(
    transactions : List.List<Transaction>,
    nowNs : Common.Timestamp,
  ) : [Transaction] {
    let todayStart : Int = (nowNs / NS_PER_DAY) * NS_PER_DAY;
    let todayEnd : Int = todayStart + NS_PER_DAY - 1;
    transactions.filter(func(tx) {
      tx.timestamp >= todayStart and tx.timestamp <= todayEnd
    }).toArray();
  };

  // Filter transactions whose timestamp falls within the current Mon-Sun week.
  public func filterCurrentWeek(
    transactions : List.List<Transaction>,
    nowNs : Common.Timestamp,
  ) : [Transaction] {
    let wStart = weekStart(nowNs);
    let wEnd = weekEnd(nowNs);
    transactions.filter(func(tx) {
      tx.timestamp >= wStart and tx.timestamp <= wEnd
    }).toArray();
  };

  // Check if a transaction belongs to the current week.
  public func isCurrentWeek(tx : Transaction, nowNs : Common.Timestamp) : Bool {
    let wStart = weekStart(nowNs);
    let wEnd = weekEnd(nowNs);
    tx.timestamp >= wStart and tx.timestamp <= wEnd;
  };

  // Sum category totals from a transaction slice.
  func sumTotals(txns : [Transaction]) : (Float, Float, Float) {
    var food : Float = 0.0;
    var rec : Float = 0.0;
    var util : Float = 0.0;
    for (tx in txns.values()) {
      switch (tx.category) {
        case (#Food) { food += tx.amount };
        case (#Recreational) { rec += tx.amount };
        case (#Utility) { util += tx.amount };
      };
    };
    (food, rec, util);
  };

  // Build a WeekSummary from a slice of transactions and week metadata.
  public func buildWeekSummary(
    weekId : Nat,
    startDate : Common.Timestamp,
    endDate : Common.Timestamp,
    txns : [Transaction],
  ) : WeekSummary {
    let (food, rec, util) = sumTotals(txns);
    {
      weekId;
      startDate;
      endDate;
      foodTotal = food;
      recTotal = rec;
      utilTotal = util;
      grandTotal = food + rec + util;
    };
  };

  // Build a WeekRecord from a slice of transactions and week metadata.
  public func buildWeekRecord(
    weekId : Nat,
    startDate : Common.Timestamp,
    endDate : Common.Timestamp,
    txns : [Transaction],
  ) : WeekRecord {
    let (food, rec, util) = sumTotals(txns);
    {
      weekId;
      startDate;
      endDate;
      foodTotal = food;
      recTotal = rec;
      utilTotal = util;
      grandTotal = food + rec + util;
    };
  };
};
