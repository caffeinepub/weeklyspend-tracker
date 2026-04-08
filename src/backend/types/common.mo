import List "mo:core/List";
import TxTypes "transactions";

module {
  public type Timestamp = Int; // nanoseconds

  // Per-user data record — holds all state for a single authenticated user.
  public type UserData = {
    transactions : List.List<TxTypes.Transaction>;
    weekHistory : List.List<TxTypes.WeekRecord>;
    weekTxHistory : List.List<(Nat, List.List<TxTypes.Transaction>)>;
    var nextTxId : Nat;
    var nextWeekId : Nat;
    var spendingLimit : ?Float;
    var currentWeekStart : Int;
  };
};
