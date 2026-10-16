import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/common";

module {
  /// Domain logic for order placement and admin order management.

  func padReference(id : Nat) : Text {
    let raw = id.toText();
    let padding = if (raw.size() >= 6) { "" } else {
      var zeros = "";
      var i = raw.size();
      while (i < 6) {
        zeros := zeros # "0";
        i += 1;
      };
      zeros;
    };
    "KB-" # padding # raw;
  };

  func priceForWeight(product : Types.Product, weight : Text) : ?Nat {
    switch (product.weightOptions.find(func option = option.weight == weight)) {
      case (?option) { ?option.price };
      case null { null };
    };
  };

  public func createOrder(
    orders : Map.Map<Types.OrderId, Types.Order>,
    state : { var nextOrderId : Nat },
    products : Map.Map<Types.ProductId, Types.Product>,
    input : Types.OrderInput,
  ) : Types.Order {
    if (input.customerName.size() == 0) {
      Runtime.trap("Customer name is required");
    };
    if (input.phone.size() == 0) {
      Runtime.trap("Phone number is required");
    };
    if (input.address.size() == 0) {
      Runtime.trap("Delivery address is required");
    };
    if (input.items.size() == 0) {
      Runtime.trap("Order must contain at least one item");
    };

    var total = 0;
    let items = input.items.map(func(item) {
      if (item.quantity == 0) {
        Runtime.trap("Item quantity must be at least one");
      };
      let product = products.get(item.productId)
        ?? Runtime.trap("Product not found: " # item.productId.toText());
      if (not product.inStock) {
        Runtime.trap("Product is out of stock: " # product.name);
      };
      let unitPrice = priceForWeight(product, item.weight)
        ?? Runtime.trap("Weight option not available: " # item.weight);
      let lineTotal = unitPrice * item.quantity;
      total += lineTotal;
      {
        productId = product.id;
        productName = product.name;
        weight = item.weight;
        quantity = item.quantity;
        unitPrice;
        lineTotal;
      };
    });

    let id = state.nextOrderId;
    state.nextOrderId := id + 1;

    let order : Types.Order = {
      id;
      reference = padReference(id);
      customerName = input.customerName;
      phone = input.phone;
      email = input.email;
      address = input.address;
      notes = input.notes;
      items;
      total;
      status = #new;
      createdAt = Time.now();
    };
    orders.add(id, order);
    order;
  };

  public func listOrders(
    orders : Map.Map<Types.OrderId, Types.Order>,
  ) : [Types.Order] {
    orders.values().toArray().sort(func(a, b) {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal };
    });
  };

  public func setOrderStatus(
    orders : Map.Map<Types.OrderId, Types.Order>,
    id : Types.OrderId,
    status : Types.OrderStatus,
  ) : () {
    switch (orders.get(id)) {
      case (?order) {
        orders.add(id, { order with status });
      };
      case null {};
    };
  };

  public func deleteOrder(
    orders : Map.Map<Types.OrderId, Types.Order>,
    id : Types.OrderId,
  ) : () {
    orders.remove(id);
  };
};
