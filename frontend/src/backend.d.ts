import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    farmerId: Principal;
    harvestLocation: string;
    name: string;
    pricePerUnit: bigint;
    quantity: bigint;
    category: string;
    harvestDate: string;
}
export interface FarmerProfile {
    contactInfo: string;
    farmLocation: string;
    name: string;
}
export interface Order {
    id: bigint;
    farmerId: Principal;
    orderStatus: OrderStatus;
    orderDate: bigint;
    productId: bigint;
    quantity: bigint;
    customerId: Principal;
    totalPrice: bigint;
}
export interface UserProfile {
    userType: Variant_customer_farmer;
    contactInfo?: string;
    farmLocation?: string;
    name: string;
}
export interface MarketplaceProduct {
    harvestLocation: string;
    productId: bigint;
    productName: string;
    pricePerUnit: bigint;
    quantity: bigint;
    category: string;
    harvestDate: string;
    farmerName: string;
}
export enum OrderStatus {
    pending = "pending",
    completed = "completed",
    accepted = "accepted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_customer_farmer {
    customer = "customer",
    farmer = "farmer"
}
export interface backendInterface {
    addProduct(product: {
        harvestLocation: string;
        name: string;
        pricePerUnit: bigint;
        quantity: bigint;
        category: string;
        harvestDate: string;
    }): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFarmerOrders(farmerId: Principal): Promise<Array<Order>>;
    getFarmerProducts(farmerId: Principal): Promise<Array<Product>>;
    getMarketplaceProducts(): Promise<Array<MarketplaceProduct>>;
    getOrder(orderId: bigint): Promise<Order>;
    getProduct(productId: bigint): Promise<Product>;
    getUserOrders(userId: Principal): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(productId: bigint, quantity: bigint): Promise<void>;
    registerFarmer(profile: FarmerProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
}
