import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Types "../types/common";

module {
  /// Domain logic for the coffee-bean catalog.

  func matchesSearch(product : Types.Product, term : Text) : Bool {
    let needle = term.toLower();
    product.name.toLower().contains(#text needle)
      or product.origin.toLower().contains(#text needle);
  };

  func matchesRoast(product : Types.Product, roast : Types.RoastLevel) : Bool {
    switch (product.roastLevel, roast) {
      case (#light, #light) { true };
      case (#medium, #medium) { true };
      case (#mediumDark, #mediumDark) { true };
      case (#dark, #dark) { true };
      case (_) { false };
    };
  };

  func lowestPrice(product : Types.Product) : Nat {
    switch (product.weightOptions.size()) {
      case (0) { 0 };
      case (_) {
        product.weightOptions.foldLeft(
          product.weightOptions[0].price,
          func(acc, option) = Nat.min(acc, option.price),
        );
      };
    };
  };

  func compareProducts(a : Types.Product, b : Types.Product, sort : Types.ProductSort) : Bool {
    // Returns true when `a` should come before `b`.
    switch (sort) {
      case (#priceAsc) { lowestPrice(a) < lowestPrice(b) };
      case (#priceDesc) { lowestPrice(a) > lowestPrice(b) };
      case (#nameAsc) { a.name.toLower() < b.name.toLower() };
      case (#nameDesc) { a.name.toLower() > b.name.toLower() };
    };
  };

  public func listProducts(
    products : Map.Map<Types.ProductId, Types.Product>,
    productQuery : Types.ProductQuery,
  ) : [Types.Product] {
    var result = products.values().toArray();

    switch (productQuery.search) {
      case (?term) {
        if (term.size() > 0) {
          result := result.filter(func product = matchesSearch(product, term));
        };
      };
      case null {};
    };

    switch (productQuery.roastLevel) {
      case (?roast) {
        result := result.filter(func product = matchesRoast(product, roast));
      };
      case null {};
    };

    switch (productQuery.origin) {
      case (?origin) {
        if (origin.size() > 0) {
          let needle = origin.toLower();
          result := result.filter(func product = product.origin.toLower() == needle);
        };
      };
      case null {};
    };

    let sort = productQuery.sort ?? #nameAsc;
    result.sort(func(a, b) {
      if (compareProducts(a, b, sort)) { #less }
      else if (compareProducts(b, a, sort)) { #greater }
      else { #equal };
    });
  };

  public func getProduct(
    products : Map.Map<Types.ProductId, Types.Product>,
    id : Types.ProductId,
  ) : ?Types.Product {
    products.get(id);
  };

  public func createProduct(
    products : Map.Map<Types.ProductId, Types.Product>,
    state : { var nextProductId : Nat },
    product : Types.Product,
  ) : Types.ProductId {
    let id = state.nextProductId;
    state.nextProductId := id + 1;
    products.add(id, { product with id });
    id;
  };

  public func updateProduct(
    products : Map.Map<Types.ProductId, Types.Product>,
    product : Types.Product,
  ) : () {
    if (products.get(product.id) != null) {
      products.add(product.id, product);
    };
  };

  public func deleteProduct(
    products : Map.Map<Types.ProductId, Types.Product>,
    id : Types.ProductId,
  ) : () {
    products.remove(id);
  };

  public func setProductStock(
    products : Map.Map<Types.ProductId, Types.Product>,
    id : Types.ProductId,
    inStock : Bool,
  ) : () {
    switch (products.get(id)) {
      case (?product) {
        products.add(id, { product with inStock });
      };
      case null {};
    };
  };
};
