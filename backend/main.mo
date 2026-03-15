import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    userType : { #farmer; #customer };
    contactInfo : ?Text;
    farmLocation : ?Text;
  };

  type FarmerProfile = {
    name : Text;
    contactInfo : Text;
    farmLocation : Text;
  };

  type Product = {
    id : Nat;
    farmerId : Principal;
    name : Text;
    category : Text;
    quantity : Nat;
    pricePerUnit : Nat;
    harvestDate : Text;
    harvestLocation : Text;
  };

  type OrderStatus = {
    #pending;
    #accepted;
    #completed;
  };

  module OrderStatus {
    public func compare(status1 : OrderStatus, status2 : OrderStatus) : Order.Order {
      switch (status1, status2) {
        case (#pending, #pending) { #equal };
        case (#pending, _) { #less };
        case (#accepted, #pending) { #greater };
        case (#accepted, #accepted) { #equal };
        case (#accepted, #completed) { #less };
        case (#completed, #completed) { #equal };
        case (#completed, _) { #greater };
      };
    };
  };

  type Order = {
    id : Nat;
    customerId : Principal;
    farmerId : Principal;
    productId : Nat;
    quantity : Nat;
    totalPrice : Nat;
    orderStatus : OrderStatus;
    orderDate : Int;
  };

  type MarketplaceProduct = {
    productId : Nat;
    farmerName : Text;
    productName : Text;
    category : Text;
    quantity : Nat;
    pricePerUnit : Nat;
    harvestDate : Text;
    harvestLocation : Text;
  };

  // Storage
  var nextProductId = 1;
  var nextOrderId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let farmers = Map.empty<Principal, FarmerProfile>();
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Farmer Management
  public shared ({ caller }) func registerFarmer(profile : FarmerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register as farmers");
    };
    farmers.add(caller, profile);

    // Also update user profile
    let userProfile : UserProfile = {
      name = profile.name;
      userType = #farmer;
      contactInfo = ?profile.contactInfo;
      farmLocation = ?profile.farmLocation;
    };
    userProfiles.add(caller, userProfile);
  };

  // Product Management
  public shared ({ caller }) func addProduct(product : {
    name : Text;
    category : Text;
    quantity : Nat;
    pricePerUnit : Nat;
    harvestDate : Text;
    harvestLocation : Text;
  }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add products");
    };

    // Verify caller is a registered farmer
    switch (farmers.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Only registered farmers can add products") };
      case (?_) {};
    };

    let newProduct : Product = {
      id = nextProductId;
      farmerId = caller;
      name = product.name;
      category = product.category;
      quantity = product.quantity;
      pricePerUnit = product.pricePerUnit;
      harvestDate = product.harvestDate;
      harvestLocation = product.harvestLocation;
    };
    products.add(nextProductId, newProduct);
    nextProductId += 1;
  };

  public query func getMarketplaceProducts() : async [MarketplaceProduct] {
    // Public access - no authentication required for browsing marketplace
    // Convert persistent products map to stable data structure first
    let productsArray = products.values().toArray();
    productsArray.map(
      func(product) {
        let farmerName = switch (farmers.get(product.farmerId)) {
          case (?f) { f.name };
          case (null) { "Unknown Farmer" };
        };
        {
          productId = product.id;
          farmerName;
          productName = product.name;
          category = product.category;
          quantity = product.quantity;
          pricePerUnit = product.pricePerUnit;
          harvestDate = product.harvestDate;
          harvestLocation = product.harvestLocation;
        };
      }
    );
  };

  // Order Management
  public shared ({ caller }) func placeOrder(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    // Prevent farmers from ordering their own products
    if (caller == product.farmerId) {
      Runtime.trap("Farmers cannot order their own products");
    };

    let totalPrice = product.pricePerUnit * quantity;

    let newOrder : Order = {
      id = nextOrderId;
      customerId = caller;
      farmerId = product.farmerId;
      productId;
      quantity;
      totalPrice;
      orderStatus = #pending;
      orderDate = Time.now();
    };
    orders.add(nextOrderId, newOrder);
    nextOrderId += 1;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update order status");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    // Only the farmer who owns the product can update order status
    if (caller != order.farmerId) {
      Runtime.trap("Unauthorized: Only the farmer can update order status");
    };

    let updatedOrder = {
      order with orderStatus = status;
    };
    orders.add(orderId, updatedOrder);
  };

  // Queries with proper authorization
  public query ({ caller }) func getFarmerProducts(farmerId : Principal) : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view farmer products");
    };

    // Only the farmer themselves or admins can view their products
    if (caller != farmerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own products");
    };

    products.values().toArray().filter(
      func(p) {
        p.farmerId == farmerId;
      }
    );
  };

  public query ({ caller }) func getUserOrders(userId : Principal) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    // Only the customer themselves or admins can view their orders
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    orders.values().toArray().filter(
      func(o) {
        o.customerId == userId;
      }
    );
  };

  public query ({ caller }) func getFarmerOrders(farmerId : Principal) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    // Only the farmer themselves or admins can view their orders
    if (caller != farmerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    orders.values().toArray().filter(
      func(o) {
        o.farmerId == farmerId;
      }
    );
  };

  public query ({ caller }) func getProduct(productId : Nat) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view product details");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view order details");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };

    // Only the customer, farmer involved, or admins can view the order
    if (caller != order.customerId and caller != order.farmerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view orders you are involved in");
    };

    order;
  };
};
