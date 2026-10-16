import Types "../types/common";
import ShopLib "../lib/shop";

mixin (businessInfo : Types.BusinessInfo) {
  /// Public read of the shop / business information.

  public query func getBusinessInfo() : async Types.BusinessInfo {
    ShopLib.getBusinessInfo(businessInfo);
  };
};
