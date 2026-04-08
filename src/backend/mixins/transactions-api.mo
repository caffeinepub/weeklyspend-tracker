import Types "../types/transactions";
import CommonTypes "../types/common";
import TxLib "../lib/transactions";
import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

mixin (
  userData : Map.Map<Principal, CommonTypes.UserData>,
) {

  // Returns the UserData for the caller, creating a fresh record if needed.
  func getOrCreateUser(caller : Principal) : CommonTypes.UserData {
    switch (userData.get(caller)) {
      case (?data) { data };
      case null {
        let data : CommonTypes.UserData = {
          transactions = List.empty<TxLib.Transaction>();
          weekHistory = List.empty<TxLib.WeekRecord>();
          weekTxHistory = List.empty<(Nat, List.List<TxLib.Transaction>)>();
          var nextTxId = 0;
          var nextWeekId = 0;
          var spendingLimit = null;
          var currentWeekStart = 0;
        };
        userData.add(caller, data);
        data;
      };
    };
  };

  public shared ({ caller }) func addTransaction(
    amount : Float,
    description : Text,
    category : Types.Category,
  ) : async TxLib.Transaction {
    assert not caller.isAnonymous();
    let u = getOrCreateUser(caller);
    let now = Time.now();
    if (u.currentWeekStart == 0) {
      u.currentWeekStart := TxLib.weekStart(now);
    };
    let tx = TxLib.newTransaction(u.nextTxId, amount, description, category, now);
    u.nextTxId += 1;
    u.transactions.add(tx);
    tx;
  };

  public shared query ({ caller }) func getTodayTransactions() : async [TxLib.Transaction] {
    assert not caller.isAnonymous();
    switch (userData.get(caller)) {
      case (?u) { TxLib.filterToday(u.transactions, Time.now()) };
      case null { [] };
    };
  };

  public shared query ({ caller }) func getCurrentWeekTransactions() : async [TxLib.Transaction] {
    assert not caller.isAnonymous();
    switch (userData.get(caller)) {
      case (?u) { TxLib.filterCurrentWeek(u.transactions, Time.now()) };
      case null { [] };
    };
  };

  public shared query ({ caller }) func getCurrentWeekSummary() : async TxLib.WeekSummary {
    assert not caller.isAnonymous();
    let now = Time.now();
    let wStart = TxLib.weekStart(now);
    let wEnd = TxLib.weekEnd(now);
    switch (userData.get(caller)) {
      case (?u) {
        let txns = TxLib.filterCurrentWeek(u.transactions, now);
        TxLib.buildWeekSummary(u.nextWeekId, wStart, wEnd, txns);
      };
      case null {
        TxLib.buildWeekSummary(0, wStart, wEnd, []);
      };
    };
  };

  // Returns true if a weekly reset was performed.
  public shared ({ caller }) func checkAndResetWeek() : async Bool {
    assert not caller.isAnonymous();
    let u = getOrCreateUser(caller);
    let now = Time.now();
    let thisWeekStart = TxLib.weekStart(now);

    if (u.currentWeekStart == 0) {
      u.currentWeekStart := thisWeekStart;
      return false;
    };

    if (thisWeekStart > u.currentWeekStart and not u.transactions.isEmpty()) {
      let oldStart = u.currentWeekStart;
      let oldEnd = TxLib.weekEnd(oldStart);
      let weekId = u.nextWeekId;
      u.nextWeekId += 1;

      let txArray = u.transactions.toArray();
      let record = TxLib.buildWeekRecord(weekId, oldStart, oldEnd, txArray);
      u.weekHistory.add(record);

      let snapshot = List.fromArray<TxLib.Transaction>(txArray);
      u.weekTxHistory.add((weekId, snapshot));

      u.transactions.clear();
      u.currentWeekStart := thisWeekStart;
      return true;
    };

    if (thisWeekStart > u.currentWeekStart) {
      u.currentWeekStart := thisWeekStart;
    };

    false;
  };

  public shared query ({ caller }) func getWeekHistory() : async [TxLib.WeekRecord] {
    assert not caller.isAnonymous();
    switch (userData.get(caller)) {
      case (?u) { u.weekHistory.reverse().toArray() };
      case null { [] };
    };
  };

  public shared query ({ caller }) func getWeekTransactions(weekId : Nat) : async [TxLib.Transaction] {
    assert not caller.isAnonymous();
    switch (userData.get(caller)) {
      case (?u) {
        switch (u.weekTxHistory.find(func((id, _txs)) { id == weekId })) {
          case (?(_, txs)) { txs.toArray() };
          case null { [] };
        };
      };
      case null { [] };
    };
  };

  public shared ({ caller }) func updateTransaction(
    id : Nat,
    amount : Float,
    description : Text,
    category : Types.Category,
  ) : async ?TxLib.Transaction {
    assert not caller.isAnonymous();
    switch (userData.get(caller)) {
      case (?u) {
        var result : ?TxLib.Transaction = null;
        u.transactions.mapInPlace(func(tx) {
          if (tx.id == id) {
            let updated = { tx with amount; description; category };
            result := ?updated;
            updated;
          } else { tx };
        });
        result;
      };
      case null { null };
    };
  };

  public shared ({ caller }) func deleteTransaction(id : Nat) : async Bool {
    assert not caller.isAnonymous();
    switch (userData.get(caller)) {
      case (?u) {
        let sizeBefore = u.transactions.size();
        u.transactions.retain(func(tx) { tx.id != id });
        u.transactions.size() < sizeBefore;
      };
      case null { false };
    };
  };

  public shared query ({ caller }) func getSpendingLimit() : async ?Float {
    assert not caller.isAnonymous();
    switch (userData.get(caller)) {
      case (?u) { u.spendingLimit };
      case null { null };
    };
  };

  public shared ({ caller }) func setSpendingLimit(limit : Float) : async () {
    assert not caller.isAnonymous();
    let u = getOrCreateUser(caller);
    u.spendingLimit := ?limit;
  };

  public shared query ({ caller }) func getExportData() : async [(TxLib.Timestamp, Float, Types.Category, Text)] {
    assert not caller.isAnonymous();
    switch (userData.get(caller)) {
      case (?u) {
        var all : List.List<(TxLib.Timestamp, Float, Types.Category, Text)> = List.empty();
        for ((_, txs) in u.weekTxHistory.values()) {
          for (tx in txs.values()) {
            all.add((tx.timestamp, tx.amount, tx.category, tx.description));
          };
        };
        for (tx in u.transactions.values()) {
          all.add((tx.timestamp, tx.amount, tx.category, tx.description));
        };
        let arr = all.toArray();
        arr.sort(func(a : (TxLib.Timestamp, Float, Types.Category, Text), b : (TxLib.Timestamp, Float, Types.Category, Text)) : Order.Order {
          Int.compare(a.0, b.0)
        });
      };
      case null { [] };
    };
  };
};
