import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import Storage "mo:caffeineai-object-storage/Storage";
import Types "../types/common";

mixin (
  products : Map.Map<Types.ProductId, Types.Product>,
  orders : Map.Map<Types.OrderId, Types.Order>,
) {
  /// OQL exposure of the coffee-bean catalog and incoming orders.
  ///
  /// Both entities are declared in manual mode because their rows carry
  /// collection and variant fields that have no built-in `_toRow` instance.

  func roastLevelText(roast : Types.RoastLevel) : Text {
    switch (roast) {
      case (#light) { "light" };
      case (#medium) { "medium" };
      case (#mediumDark) { "mediumDark" };
      case (#dark) { "dark" };
    };
  };

  func orderStatusText(status : Types.OrderStatus) : Text {
    switch (status) {
      case (#new) { "new" };
      case (#confirmed) { "confirmed" };
      case (#completed) { "completed" };
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

  include Expose({
    entities = [
      // Public catalog — world-readable, including logged-out visitors.
      products.toEntityManual("product", "Product", "id")
        .sample({
          id = 0;
          name = "";
          slug = "";
          description = "";
          tastingNotes = [] : [Text];
          roastLevel = #medium;
          origin = "";
          weightOptions = [] : [Types.WeightOption];
          inStock = true;
          image = "" : Storage.ExternalBlob;
          featured = false;
        })
        .payload("id", func p = p.id)
        .payload("name", func p = p.name)
        .payload("slug", func p = p.slug)
        .payload("description", func p = p.description)
        .payload("roastLevel", func p = roastLevelText(p.roastLevel))
        .payload("origin", func p = p.origin)
        .payload("inStock", func p = p.inStock)
        .payload("featured", func p = p.featured)
        .payload("lowestPrice", func p = lowestPrice(p))
        .payload("tastingNotes", func p = p.tastingNotes.values().join(", "))
        .payload("weightOptionCount", func p = p.weightOptions.size())
        .public_()
        .build(),
      // Incoming orders — private app data the Data Intelligence agent answers
      // over; no end user reads this table directly.
      orders.toEntityManual("order", "Order", "id")
        .sample({
          id = 0;
          reference = "";
          customerName = "";
          phone = "";
          email = "";
          address = "";
          notes = "";
          items = [];
          total = 0;
          status = #new;
          createdAt = 0;
        })
        .payload("id", func o = o.id)
        .payload("reference", func o = o.reference)
        .payload("customerName", func o = o.customerName)
        .payload("phone", func o = o.phone)
        .payload("email", func o = o.email)
        .payload("address", func o = o.address)
        .payload("notes", func o = o.notes)
        .payload("total", func o = o.total)
        .payload("status", func o = orderStatusText(o.status))
        .payload("createdAt", func o = o.createdAt)
        .payload("itemCount", func o = o.items.size())
        .controllerOnly()
        .build(),
    ];
  });
};
