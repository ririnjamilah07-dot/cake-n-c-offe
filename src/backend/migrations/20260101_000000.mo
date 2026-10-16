import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";

// Migration from the retired hair-salon domain to the coffee-bean storefront.
// The previous stable shape is inlined as OldActor; the new storefront state
// is inlined as NewActor. Only mo:core and mops package imports are allowed.
module {
  // ---- Old (hair salon) types ----
  type OldDayHours = {
    days : Text;
    hours : Text;
  };

  type OldBusinessInfo = {
    name : Text;
    tagline : Text;
    phone : Text;
    email : Text;
    address : Text;
    openingHours : [OldDayHours];
  };

  type OldService = {
    id : Nat;
    name : Text;
    description : Text;
    price : Text;
    duration : Text;
  };

  type OldTeamMember = {
    id : Nat;
    name : Text;
    role : Text;
    bio : Text;
    photo : Text;
  };

  type OldTestimonial = {
    id : Nat;
    author : Text;
    quote : Text;
  };

  type OldGalleryImage = {
    id : Nat;
    url : Text;
    caption : Text;
  };

  type OldBookingRequest = {
    id : Nat;
    name : Text;
    contact : Text;
    service : Text;
    preferredTime : Text;
    message : Text;
    createdAt : Time.Time;
    handled : Bool;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    businessInfo : OldBusinessInfo;
    services : [OldService];
    team : [OldTeamMember];
    testimonials : [OldTestimonial];
    gallery : [OldGalleryImage];
    bookingRequests : Map.Map<Nat, OldBookingRequest>;
    var nextRequestId : Nat;
  };

  // ---- New (coffee-bean storefront) types ----
  type DayHours = {
    days : Text;
    hours : Text;
  };

  type BusinessInfo = {
    name : Text;
    tagline : Text;
    phone : Text;
    email : Text;
    address : Text;
    openingHours : [DayHours];
  };

  type RoastLevel = {
    #light;
    #medium;
    #mediumDark;
    #dark;
  };

  type WeightOption = {
    weight : Text;
    price : Nat;
  };

  type Product = {
    id : Nat;
    name : Text;
    slug : Text;
    description : Text;
    tastingNotes : [Text];
    roastLevel : RoastLevel;
    origin : Text;
    weightOptions : [WeightOption];
    inStock : Bool;
    image : Blob;
    featured : Bool;
  };

  type OrderLineItem = {
    productId : Nat;
    productName : Text;
    weight : Text;
    quantity : Nat;
    unitPrice : Nat;
    lineTotal : Nat;
  };

  type OrderStatus = {
    #new;
    #confirmed;
    #completed;
  };

  type Order = {
    id : Nat;
    reference : Text;
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

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    businessInfo : BusinessInfo;
    products : Map.Map<Nat, Product>;
    productState : { var nextProductId : Nat };
    orders : Map.Map<Nat, Order>;
    orderState : { var nextOrderId : Nat };
  };

  // The frontend decodes every product image through the object-storage
  // client, which strips the "!caf!" deduplication sentinel and validates the
  // remainder as a "sha256:<64 hex>" hash. An empty blob decodes to an empty
  // hash and throws "Hash must not be empty", rejecting the whole product
  // query. Seed a well-formed hash reference so decoding always succeeds.
  func seedImage() : Blob {
    Text.encodeUtf8(
      "!caf!sha256:0000000000000000000000000000000000000000000000000000000000000000"
    );
  };

  func seedProducts() : Map.Map<Nat, Product> {
    let products = Map.empty<Nat, Product>();
    let catalog : [Product] = [
      {
        id = 0;
        name = "Gayo Arabica";
        slug = "gayo-arabica";
        description = "Kopi arabika single origin dari dataran tinggi Gayo, Aceh. Diproses secara wet-hulled dengan body tebal dan keasaman seimbang.";
        tastingNotes = ["Cokelat hitam", "Kayu manis", "Jeruk manis"];
        roastLevel = #medium;
        origin = "Aceh, Gayo";
        weightOptions = [
          { weight = "200 g"; price = 85000 },
          { weight = "500 g"; price = 195000 },
          { weight = "1 kg"; price = 370000 },
        ];
        inStock = true;
        image = seedImage();
        featured = true;
      },
      {
        id = 1;
        name = "Toraja Sapan";
        slug = "toraja-sapan";
        description = "Arabika Sulawesi dengan karakter rempah yang kuat dan aftertaste panjang. Cocok untuk seduhan manual brew.";
        tastingNotes = ["Rempah", "Cokelat susu", "Tembakau manis"];
        roastLevel = #mediumDark;
        origin = "Sulawesi, Toraja";
        weightOptions = [
          { weight = "200 g"; price = 90000 },
          { weight = "500 g"; price = 205000 },
          { weight = "1 kg"; price = 390000 },
        ];
        inStock = true;
        image = seedImage();
        featured = true;
      },
      {
        id = 2;
        name = "Kintamani Bali";
        slug = "kintamani-bali";
        description = "Arabika Bali yang ditanam berdampingan dengan pohon jeruk. Menghasilkan aroma buah yang cerah dan menyegarkan.";
        tastingNotes = ["Jeruk", "Apel hijau", "Madu"];
        roastLevel = #light;
        origin = "Bali, Kintamani";
        weightOptions = [
          { weight = "200 g"; price = 88000 },
          { weight = "500 g"; price = 200000 },
        ];
        inStock = true;
        image = seedImage();
        featured = false;
      },
      {
        id = 3;
        name = "Java Preanger";
        slug = "java-preanger";
        description = "Kopi arabika legendaris dari dataran tinggi Priangan, Jawa Barat. Profil rasa klasik dengan keasaman lembut.";
        tastingNotes = ["Kacang panggang", "Karamel", "Cokelat"];
        roastLevel = #medium;
        origin = "Jawa Barat, Preanger";
        weightOptions = [
          { weight = "200 g"; price = 82000 },
          { weight = "500 g"; price = 188000 },
          { weight = "1 kg"; price = 355000 },
        ];
        inStock = true;
        image = seedImage();
        featured = false;
      },
      {
        id = 4;
        name = "Sumatra Mandheling";
        slug = "sumatra-mandheling";
        description = "Kopi dengan body paling tebal dari Sumatra Utara. Rendah keasaman dengan sentuhan earthy yang khas.";
        tastingNotes = ["Tanah basah", "Cokelat pahit", "Herbal"];
        roastLevel = #dark;
        origin = "Sumatra, Mandheling";
        weightOptions = [
          { weight = "200 g"; price = 87000 },
          { weight = "500 g"; price = 198000 },
          { weight = "1 kg"; price = 375000 },
        ];
        inStock = true;
        image = seedImage();
        featured = true;
      },
      {
        id = 5;
        name = "Flores Bajawa";
        slug = "flores-bajawa";
        description = "Arabika Flores dengan aroma bunga dan buah tropis. Diproses fully washed untuk kejernihan rasa maksimal.";
        tastingNotes = ["Bunga", "Markisa", "Gula aren"];
        roastLevel = #light;
        origin = "Nusa Tenggara, Flores";
        weightOptions = [
          { weight = "200 g"; price = 92000 },
          { weight = "500 g"; price = 210000 },
        ];
        inStock = true;
        image = seedImage();
        featured = false;
      },
      {
        id = 6;
        name = "Papua Wamena";
        slug = "papua-wamena";
        description = "Arabika organik dari lembah Baliem, Papua. Profil rasa kompleks dengan keasaman tinggi dan aroma buah eksotis.";
        tastingNotes = ["Buah tropis", "Cokelat", "Bunga"];
        roastLevel = #medium;
        origin = "Papua, Wamena";
        weightOptions = [
          { weight = "200 g"; price = 95000 },
          { weight = "500 g"; price = 218000 },
          { weight = "1 kg"; price = 410000 },
        ];
        inStock = true;
        image = seedImage();
        featured = false;
      },
      {
        id = 7;
        name = "House Blend Nusantara";
        slug = "house-blend-nusantara";
        description = "Campuran arabika dan robusta pilihan untuk espresso harian. Seimbang, manis, dan konsisten.";
        tastingNotes = ["Cokelat", "Kacang", "Karamel"];
        roastLevel = #mediumDark;
        origin = "Blend Nusantara";
        weightOptions = [
          { weight = "200 g"; price = 70000 },
          { weight = "500 g"; price = 160000 },
          { weight = "1 kg"; price = 300000 },
        ];
        inStock = false;
        image = seedImage();
        featured = false;
      },
    ];
    for (product in catalog.values()) {
      products.add(product.id, product);
    };
    products;
  };

  public func migration(old : OldActor) : NewActor {
    ignore old;
    {
      accessControlState = AccessControl.initState();
      businessInfo = {
        name = "Cake N C offe";
        tagline = "Biji kopi pilihan dari seluruh Nusantara";
        phone = "+62 812 3456 7890";
        email = "halo@kopinusantara.id";
        address = "Jl. Kopi No. 12, Bandung, Jawa Barat 40115";
        openingHours = [
          { days = "Senin - Jumat"; hours = "08.00 - 20.00" },
          { days = "Sabtu"; hours = "09.00 - 18.00" },
          { days = "Minggu"; hours = "Tutup" },
        ];
      };
      products = seedProducts();
      productState = { var nextProductId = 8 };
      orders = Map.empty();
      orderState = { var nextOrderId = 0 };
    };
  };
};
