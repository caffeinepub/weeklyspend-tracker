module {
  public type Category = { #Food; #Recreational; #Utility };

  public type Transaction = {
    id : Nat;
    amount : Float;
    description : Text;
    category : Category;
    timestamp : Int;
  };

  public type WeekSummary = {
    weekId : Nat;
    startDate : Int;
    endDate : Int;
    foodTotal : Float;
    recTotal : Float;
    utilTotal : Float;
    grandTotal : Float;
  };

  public type WeekRecord = {
    weekId : Nat;
    startDate : Int;
    endDate : Int;
    foodTotal : Float;
    recTotal : Float;
    utilTotal : Float;
    grandTotal : Float;
  };
};
