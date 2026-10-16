import Map "mo:core/Map";
import Nat "mo:core/Nat";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Types "types/common";
import ShopApi "mixins/shop-api";
import ProductsApi "mixins/products-api";
import OrdersApi "mixins/orders-api";
import OqlApi "mixins/oql-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();

  let businessInfo : Types.BusinessInfo;
  let products : Map.Map<Types.ProductId, Types.Product>;
  let productState : { var nextProductId : Nat };
  let orders : Map.Map<Types.OrderId, Types.Order>;
  let orderState : { var nextOrderId : Nat };

  include ShopApi(businessInfo);
  include ProductsApi(products, productState, accessControlState);
  include OrdersApi(orders, orderState, products, accessControlState);
  include OqlApi(products, orders);
  include ApiDocMixin();
};
