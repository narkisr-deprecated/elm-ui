module Systems.Model.KVM where


type alias KVM = 
  { 
    node : String
  }


emptyKVM : KVM 
emptyKVM = 
  KVM ""

