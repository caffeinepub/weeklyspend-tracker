import Map "mo:core/Map";
import Principal "mo:core/Principal";
import CommonTypes "types/common";
import TxApi "mixins/transactions-api";



actor {
  let userData = Map.empty<Principal, CommonTypes.UserData>();

  include TxApi(userData);
};
