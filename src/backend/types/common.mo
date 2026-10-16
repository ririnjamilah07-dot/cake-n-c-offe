import Storage "mo:caffeineai-object-storage/Storage";

module {
  /// Shared, cross-cutting types for the coffee-bean storefront.

  /// Identifier for a coffee bean product.
  public type ProductId = Nat;

  /// Identifier for a placed order.
  public type OrderId = Nat;

  /// Human-facing order reference shown to the customer (e.g. "KB-000123").
  public type OrderReference = Text;

  /// A single opening-hours row for the shop footer.
  public type DayHours = {
    days : Text;
    hours : Text;
  };

  /// Shop / business information shown in the storefront footer.
  public type BusinessInfo = {
    name : Text;
    tagline : Text;
    phone : Text;
    email : Text;
    address : Text;
    openingHours : [DayHours];
  };

  /// Roast level of a coffee bean.
  public type RoastLevel = {
    #light;
    #medium;
    #mediumDark;
    #dark;
  };

  /// One purchasable weight option for a product, with its own price.
  public type WeightOption = {
    weight : Text; // e.g. "250 g", "1 kg"
    price : Nat; // price in whole rupiah
  };

  /// A coffee bean product as exposed through the public API.
  public type Product = {
    id : ProductId;
    name : Text;
    slug : Text;
    description : Text;
    tastingNotes : [Text];
    roastLevel : RoastLevel;
    origin : Text;
    weightOptions : [WeightOption];
    inStock : Bool;
    image : Storage.ExternalBlob;
    featured : Bool;
  };

  /// Sort order for product listings.
  public type ProductSort = {
    #priceAsc;
    #priceDesc;
    #nameAsc;
    #nameDesc;
  };

  /// Search / filter / sort parameters for the product listing.
  public type ProductQuery = {
    search : ?Text;
    roastLevel : ?RoastLevel;
    origin : ?Text;
    sort : ?ProductSort;
  };

  /// A single line item in a cart / order.
  public type OrderLineItem = {
    productId : ProductId;
    productName : Text;
    weight : Text;
    quantity : Nat;
    unitPrice : Nat;
    lineTotal : Nat;
  };

  /// Order lifecycle status.
  public type OrderStatus = {
    #new;
    #confirmed;
    #completed;
  };

  /// A placed order as exposed through the public API.
  public type Order = {
    id : OrderId;
    reference : OrderReference;
    customerName : Text;
    phone : Text;
    email : Text;
    address : Text;
    notes : Text;
    items : [OrderLineItem];
    total : Nat;
    status : OrderStatus;
    createdAt : Int;
  };

  /// Input for creating an order from a cart.
  public type OrderInput = {
    customerName : Text;
    phone : Text;
    email : Text;
    address : Text;
    notes : Text;
    items : [OrderLineItem];
  };
};
