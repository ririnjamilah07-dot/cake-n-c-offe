import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
import type { ExternalBlob } from "@caffeineai/object-storage";
export type { ExternalBlob } from "@caffeineai/object-storage";
export interface BusinessInfo {
    tagline: string;
    name: string;
    email: string;
    address: string;
    openingHours: Array<DayHours>;
    phone: string;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface DayHours {
    hours: string;
    days: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Order {
    id: OrderId;
    customerName: string;
    status: OrderStatus;
    total: bigint;
    createdAt: bigint;
    reference: OrderReference;
    email: string;
    address: string;
    notes: string;
    phone: string;
    items: Array<OrderLineItem>;
}
export type OrderId = bigint;
export interface OrderInput {
    customerName: string;
    email: string;
    address: string;
    notes: string;
    phone: string;
    items: Array<OrderLineItem>;
}
export interface OrderLineItem {
    weight: string;
    lineTotal: bigint;
    productId: ProductId;
    productName: string;
    quantity: bigint;
    unitPrice: bigint;
}
export type OrderReference = string;
export interface Product {
    id: ProductId;
    featured: boolean;
    inStock: boolean;
    name: string;
    origin: string;
    tastingNotes: Array<string>;
    slug: string;
    description: string;
    image: ExternalBlob;
    roastLevel: RoastLevel;
    weightOptions: Array<WeightOption>;
}
export type ProductId = bigint;
export interface ProductQuery {
    origin?: string;
    sort?: ProductSort;
    search?: string;
    roastLevel?: RoastLevel;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface WeightOption {
    weight: string;
    price: bigint;
}
export enum OrderStatus {
    new = "new",
    completed = "completed",
    confirmed = "confirmed"
}
export enum ProductSort {
    nameDesc = "nameDesc",
    nameAsc = "nameAsc",
    priceDesc = "priceDesc",
    priceAsc = "priceAsc"
}
export enum RoastLevel {
    mediumDark = "mediumDark",
    dark = "dark",
    light = "light",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(input: OrderInput): Promise<Order>;
    createProduct(product: Product): Promise<ProductId>;
    deleteOrder(id: OrderId): Promise<void>;
    deleteProduct(id: ProductId): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Static, human-readable documentation of the public backend API.
     * / Authored from the current source; reads no runtime state.
     */
    getApiDoc(): Promise<string>;
    /**
     * / Public read of the shop / business information.
     */
    getBusinessInfo(): Promise<BusinessInfo>;
    getCallerUserRole(): Promise<UserRole>;
    getProduct(id: ProductId): Promise<Product | null>;
    isCallerAdmin(): Promise<boolean>;
    listOrders(): Promise<Array<Order>>;
    /**
     * / Public catalog reads and admin product management.
     */
    listProducts(productQuery: ProductQuery): Promise<Array<Product>>;
    schema(): Promise<string>;
    setOrderStatus(id: OrderId, status: OrderStatus): Promise<void>;
    setProductStock(id: ProductId, inStock: boolean): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
