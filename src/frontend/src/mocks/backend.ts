import { ExternalBlob } from "@caffeineai/object-storage";
import type {
  backendInterface,
  BusinessInfo,
  Order,
  Product,
  ProductQuery,
  Result,
} from "../backend";
import { OrderStatus, ProductSort, RoastLevel, UserRole } from "../backend";

const placeholderImage = ExternalBlob.fromURL(
  "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#3b2a20"/><text x="50%" y="50%" fill="#e8a04a" font-family="sans-serif" font-size="28" text-anchor="middle" dominant-baseline="middle">Kopi</text></svg>',
    ),
);

const businessInfo: BusinessInfo = {
  name: "Kopi Nusantara",
  tagline: "Biji kopi pilihan dari seluruh Nusantara",
  phone: "+62 812 3456 7890",
  email: "halo@kopinusantara.id",
  address: "Jl. Kopi No. 12, Bandung, Jawa Barat 40115",
  openingHours: [
    { days: "Senin - Jumat", hours: "08.00 - 20.00" },
    { days: "Sabtu", hours: "09.00 - 18.00" },
    { days: "Minggu", hours: "Tutup" },
  ],
};

const products: Product[] = [
  {
    id: BigInt(0),
    name: "Gayo Arabica",
    slug: "gayo-arabica",
    description:
      "Kopi arabika single origin dari dataran tinggi Gayo, Aceh. Diproses secara wet-hulled dengan body tebal dan keasaman seimbang.",
    tastingNotes: ["Cokelat hitam", "Kayu manis", "Jeruk manis"],
    roastLevel: RoastLevel.medium,
    origin: "Aceh, Gayo",
    weightOptions: [
      { weight: "200 g", price: BigInt(85000) },
      { weight: "500 g", price: BigInt(195000) },
      { weight: "1 kg", price: BigInt(370000) },
    ],
    inStock: true,
    image: placeholderImage,
    featured: true,
  },
  {
    id: BigInt(1),
    name: "Toraja Sapan",
    slug: "toraja-sapan",
    description:
      "Arabika Sulawesi dengan karakter rempah yang kuat dan aftertaste panjang. Cocok untuk seduhan manual brew.",
    tastingNotes: ["Rempah", "Cokelat susu", "Tembakau manis"],
    roastLevel: RoastLevel.mediumDark,
    origin: "Sulawesi, Toraja",
    weightOptions: [
      { weight: "200 g", price: BigInt(90000) },
      { weight: "500 g", price: BigInt(205000) },
      { weight: "1 kg", price: BigInt(390000) },
    ],
    inStock: true,
    image: placeholderImage,
    featured: true,
  },
  {
    id: BigInt(2),
    name: "Kintamani Bali",
    slug: "kintamani-bali",
    description:
      "Arabika Bali yang ditanam berdampingan dengan pohon jeruk. Menghasilkan aroma buah yang cerah dan menyegarkan.",
    tastingNotes: ["Jeruk", "Apel hijau", "Madu"],
    roastLevel: RoastLevel.light,
    origin: "Bali, Kintamani",
    weightOptions: [
      { weight: "200 g", price: BigInt(88000) },
      { weight: "500 g", price: BigInt(200000) },
    ],
    inStock: true,
    image: placeholderImage,
    featured: false,
  },
  {
    id: BigInt(3),
    name: "Java Preanger",
    slug: "java-preanger",
    description:
      "Kopi arabika legendaris dari dataran tinggi Priangan, Jawa Barat. Profil rasa klasik dengan keasaman lembut.",
    tastingNotes: ["Kacang panggang", "Karamel", "Cokelat"],
    roastLevel: RoastLevel.medium,
    origin: "Jawa Barat, Preanger",
    weightOptions: [
      { weight: "200 g", price: BigInt(82000) },
      { weight: "500 g", price: BigInt(188000) },
      { weight: "1 kg", price: BigInt(355000) },
    ],
    inStock: true,
    image: placeholderImage,
    featured: false,
  },
  {
    id: BigInt(4),
    name: "Sumatra Mandheling",
    slug: "sumatra-mandheling",
    description:
      "Kopi dengan body paling tebal dari Sumatra Utara. Rendah keasaman dengan sentuhan earthy yang khas.",
    tastingNotes: ["Tanah basah", "Cokelat pahit", "Herbal"],
    roastLevel: RoastLevel.dark,
    origin: "Sumatra, Mandheling",
    weightOptions: [
      { weight: "200 g", price: BigInt(87000) },
      { weight: "500 g", price: BigInt(198000) },
      { weight: "1 kg", price: BigInt(375000) },
    ],
    inStock: true,
    image: placeholderImage,
    featured: true,
  },
  {
    id: BigInt(5),
    name: "Flores Bajawa",
    slug: "flores-bajawa",
    description:
      "Arabika Flores dengan aroma bunga dan buah tropis. Diproses fully washed untuk kejernihan rasa maksimal.",
    tastingNotes: ["Bunga", "Markisa", "Gula aren"],
    roastLevel: RoastLevel.light,
    origin: "Nusa Tenggara, Flores",
    weightOptions: [
      { weight: "200 g", price: BigInt(92000) },
      { weight: "500 g", price: BigInt(210000) },
    ],
    inStock: true,
    image: placeholderImage,
    featured: false,
  },
  {
    id: BigInt(6),
    name: "Papua Wamena",
    slug: "papua-wamena",
    description:
      "Arabika organik dari lembah Baliem, Papua. Profil rasa kompleks dengan keasaman tinggi dan aroma buah eksotis.",
    tastingNotes: ["Buah tropis", "Cokelat", "Bunga"],
    roastLevel: RoastLevel.medium,
    origin: "Papua, Wamena",
    weightOptions: [
      { weight: "200 g", price: BigInt(95000) },
      { weight: "500 g", price: BigInt(218000) },
      { weight: "1 kg", price: BigInt(410000) },
    ],
    inStock: true,
    image: placeholderImage,
    featured: false,
  },
  {
    id: BigInt(7),
    name: "House Blend Nusantara",
    slug: "house-blend-nusantara",
    description:
      "Campuran arabika dan robusta pilihan untuk espresso harian. Seimbang, manis, dan konsisten.",
    tastingNotes: ["Cokelat", "Kacang", "Karamel"],
    roastLevel: RoastLevel.mediumDark,
    origin: "Blend Nusantara",
    weightOptions: [
      { weight: "200 g", price: BigInt(70000) },
      { weight: "500 g", price: BigInt(160000) },
      { weight: "1 kg", price: BigInt(300000) },
    ],
    inStock: false,
    image: placeholderImage,
    featured: false,
  },
];

function lowestPrice(product: Product): bigint {
  if (product.weightOptions.length === 0) return BigInt(0);
  return product.weightOptions.reduce(
    (min, option) => (option.price < min ? option.price : min),
    product.weightOptions[0].price,
  );
}

function filterProducts(query: ProductQuery): Product[] {
  let result = [...products];
  if (query.search && query.search.length > 0) {
    const needle = query.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.origin.toLowerCase().includes(needle),
    );
  }
  if (query.roastLevel) {
    result = result.filter((p) => p.roastLevel === query.roastLevel);
  }
  if (query.origin && query.origin.length > 0) {
    const needle = query.origin.toLowerCase();
    result = result.filter((p) => p.origin.toLowerCase() === needle);
  }
  const sort = query.sort ?? ProductSort.nameAsc;
  result.sort((a, b) => {
    switch (sort) {
      case ProductSort.priceAsc:
        return lowestPrice(a) < lowestPrice(b) ? -1 : lowestPrice(a) > lowestPrice(b) ? 1 : 0;
      case ProductSort.priceDesc:
        return lowestPrice(a) > lowestPrice(b) ? -1 : lowestPrice(a) < lowestPrice(b) ? 1 : 0;
      case ProductSort.nameDesc:
        return a.name.toLowerCase() > b.name.toLowerCase() ? -1 : a.name.toLowerCase() < b.name.toLowerCase() ? 1 : 0;
      case ProductSort.nameAsc:
      default:
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0;
    }
  });
  return result;
}

const orders: Order[] = [];

export const mockBackend: backendInterface = {
  assignCallerUserRole: async () => undefined,
  createOrder: async (input) => {
    const items = input.items.map((item) => ({ ...item }));
    const total = items.reduce((sum, item) => sum + item.lineTotal, BigInt(0));
    const order: Order = {
      id: BigInt(orders.length),
      reference: `KB-${String(orders.length + 1).padStart(6, "0")}`,
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      address: input.address,
      notes: input.notes,
      items,
      total,
      status: OrderStatus.new,
      createdAt: BigInt(Date.now()),
    };
    orders.push(order);
    return order;
  },
  createProduct: async (product) => {
    const id = BigInt(products.length);
    products.push({ ...product, id });
    return id;
  },
  deleteOrder: async () => undefined,
  deleteProduct: async (id) => {
    const index = products.findIndex((p) => p.id === id);
    if (index >= 0) products.splice(index, 1);
  },
  execute: async (): Promise<Result> => ({ hasMore: false, rows: [] }),
  getApiDoc: async () => "Mock API documentation",
  getBusinessInfo: async () => businessInfo,
  getCallerUserRole: async (): Promise<UserRole> => UserRole.guest,
  getProduct: async (id) => products.find((p) => p.id === id) ?? null,
  isCallerAdmin: async () => false,
  listOrders: async () => [...orders],
  listProducts: async (productQuery) => filterProducts(productQuery),
  schema: async () => "{}",
  setOrderStatus: async (id, status) => {
    const order = orders.find((o) => o.id === id);
    if (order) order.status = status;
  },
  setProductStock: async (id, inStock) => {
    const product = products.find((p) => p.id === id);
    if (product) product.inStock = inStock;
  },
  updateProduct: async (product) => {
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) products[index] = product;
  },
  __accessControlState: async () => ({}),
  __businessInfo: async () => businessInfo,
  __orderState: async () => ({}),
  __orders: async () => [...orders],
  __productState: async () => ({}),
  __products: async () => [...products],
  _immutableObjectStorageBlobsAreLive: async (hashes) =>
    hashes.map(() => true),
  _immutableObjectStorageBlobsToDelete: async () => [],
  _immutableObjectStorageConfirmBlobDeletion: async () => undefined,
  _immutableObjectStorageCreateCertificate: async () => ({
    method: "create_certificate",
    blob_hash: "",
  }),
  _immutableObjectStorageRefillCashier: async () => ({
    success: true,
    topped_up_amount: BigInt(0),
  }),
  _immutableObjectStorageUpdateGatewayPrincipals: async () => undefined,
  _initialize_access_control: async () => undefined,
  _internet_identity_sign_in_finish: async () => ({
    __kind__: "ok",
    ok: null,
  }),
  _internet_identity_sign_in_start: async () => new Uint8Array(),
};
