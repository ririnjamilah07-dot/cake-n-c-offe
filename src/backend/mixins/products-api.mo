import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/common";
import ProductsLib "../lib/products";

mixin (
  products : Map.Map<Types.ProductId, Types.Product>,
  productState : { var nextProductId : Nat },
  accessControlState : AccessControl.AccessControlState,
) {
  /// Public catalog reads and admin product management.

  public query func listProducts(productQuery : Types.ProductQuery) : async [Types.Product] {
    ProductsLib.listProducts(products, productQuery);
  };

  public query func getProduct(id : Types.ProductId) : async ?Types.Product {
    ProductsLib.getProduct(products, id);
  };

  public shared ({ caller }) func createProduct(product : Types.Product) : async Types.ProductId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    ProductsLib.createProduct(products, productState, product);
  };

  public shared ({ caller }) func updateProduct(product : Types.Product) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    ProductsLib.updateProduct(products, product);
  };

  public shared ({ caller }) func deleteProduct(id : Types.ProductId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    ProductsLib.deleteProduct(products, id);
  };

  public shared ({ caller }) func setProductStock(id : Types.ProductId, inStock : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can change product stock");
    };
    ProductsLib.setProductStock(products, id, inStock);
  };
};
