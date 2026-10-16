import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/common";
import OrdersLib "../lib/orders";
import EmailClient "mo:caffeineai-email/emailClient";

mixin (
  orders : Map.Map<Types.OrderId, Types.Order>,
  orderState : { var nextOrderId : Nat },
  products : Map.Map<Types.ProductId, Types.Product>,
  accessControlState : AccessControl.AccessControlState,
) {
  /// Public order placement and admin order management.

  func formatRupiah(amount : Nat) : Text {
    "Rp " # amount.toText();
  };

  func buildOrderEmail(order : Types.Order) : Text {
    let lines = order.items.map(func(item) {
      "<li>" # item.productName # " (" # item.weight # ") x" # item.quantity.toText()
        # " — " # formatRupiah(item.lineTotal) # "</li>";
    });
    "<h2>Terima kasih, " # order.customerName # "!</h2>"
      # "<p>Pesanan Anda telah kami terima.</p>"
      # "<p><strong>Nomor pesanan:</strong> " # order.reference # "</p>"
      # "<ul>" # lines.values().join("") # "</ul>"
      # "<p><strong>Total:</strong> " # formatRupiah(order.total) # "</p>"
      # "<p><strong>Alamat pengiriman:</strong> " # order.address # "</p>"
      # "<p>Kami akan menghubungi Anda di " # order.phone # " untuk konfirmasi.</p>";
  };

  public shared func createOrder(input : Types.OrderInput) : async Types.Order {
    let order = OrdersLib.createOrder(orders, orderState, products, input);
    // Email is optional at checkout: only send the confirmation when the
    // customer supplied an address.
    if (order.email.size() > 0) {
      let result = await EmailClient.sendServiceEmail(
        "no-reply",
        [order.email],
        "Konfirmasi Pesanan " # order.reference,
        buildOrderEmail(order),
      );
      switch (result) {
        case (#ok) {};
        case (#err(_)) {};
      };
    };
    order;
  };

  public shared query ({ caller }) func listOrders() : async [Types.Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    OrdersLib.listOrders(orders);
  };

  public shared ({ caller }) func setOrderStatus(id : Types.OrderId, status : Types.OrderStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can change order status");
    };
    OrdersLib.setOrderStatus(orders, id, status);
  };

  public shared ({ caller }) func deleteOrder(id : Types.OrderId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete orders");
    };
    OrdersLib.deleteOrder(orders, id);
  };
};
