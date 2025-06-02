import {
  users,
  products,
  categories,
  orders,
  orderItems,
  cartItems,
  reviews,
  wishlist,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItem,
  type InsertCartItem,
  type Review,
  type InsertReview,
  type Wishlist,
  type InsertWishlist,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, data: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<User>;

  // Product operations
  getProducts(filters?: {
    category?: string;
    fabric?: string;
    color?: string;
    region?: string;
    occasion?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: Product[]; total: number }>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]>;
  getOrder(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  updateOrderPaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Order>;

  // Wishlist operations
  getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(item: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;

  // Review operations
  getProductReviews(productId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateProductRating(productId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, data: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Product operations
  async getProducts(filters?: {
    category?: string;
    fabric?: string;
    color?: string;
    region?: string;
    occasion?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: Product[]; total: number }> {
    const conditions = [];

    if (filters?.category) {
      conditions.push(eq(products.categoryId, parseInt(filters.category)));
    }
    if (filters?.fabric) {
      conditions.push(eq(products.fabric, filters.fabric));
    }
    if (filters?.color) {
      conditions.push(eq(products.color, filters.color));
    }
    if (filters?.region) {
      conditions.push(eq(products.region, filters.region));
    }
    if (filters?.occasion) {
      conditions.push(eq(products.occasion, filters.occasion));
    }
    if (filters?.minPrice) {
      conditions.push(sql`${products.price} >= ${filters.minPrice}`);
    }
    if (filters?.maxPrice) {
      conditions.push(sql`${products.price} <= ${filters.maxPrice}`);
    }
    if (filters?.search) {
      conditions.push(
        or(
          like(products.name, `%${filters.search}%`),
          like(products.description, `%${filters.search}%`),
          like(products.fabric, `%${filters.search}%`),
          like(products.color, `%${filters.search}%`)
        )
      );
    }
    if (filters?.featured !== undefined) {
      conditions.push(eq(products.featured, filters.featured));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(products)
      .where(whereClause);

    // Get products
    let query = db.select().from(products).where(whereClause);

    // Sorting
    if (filters?.sortBy) {
      const sortColumn = products[filters.sortBy as keyof typeof products];
      if (sortColumn) {
        query = query.orderBy(
          filters.sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn)
        );
      }
    } else {
      query = query.orderBy(desc(products.createdAt));
    }

    // Pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const productList = await query;

    return {
      products: productList,
      total: totalCount,
    };
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .then(rows => 
        rows.map(row => ({
          ...row.cart_items,
          product: row.products!,
        }))
      );
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, item.userId),
          eq(cartItems.productId, item.productId)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ 
          quantity: existingItem.quantity + item.quantity,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Create new item
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]> {
    const whereClause = userId ? eq(orders.userId, userId) : undefined;
    
    const orderList = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      orderList.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id))
          .then(rows =>
            rows.map(row => ({
              ...row.order_items,
              product: row.products!,
            }))
          );

        return {
          ...order,
          orderItems: items,
        };
      })
    );

    return ordersWithItems;
  }

  async getOrder(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    
    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id))
      .then(rows =>
        rows.map(row => ({
          ...row.order_items,
          product: row.products!,
        }))
      );

    return {
      ...order,
      orderItems: items,
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    return await db.insert(orderItems).values(items).returning();
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async updateOrderPaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        paymentStatus, 
        paymentIntentId,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Wishlist operations
  async getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]> {
    return await db
      .select()
      .from(wishlist)
      .leftJoin(products, eq(wishlist.productId, products.id))
      .where(eq(wishlist.userId, userId))
      .orderBy(desc(wishlist.createdAt))
      .then(rows =>
        rows.map(row => ({
          ...row.wishlist,
          product: row.products!,
        }))
      );
  }

  async addToWishlist(item: InsertWishlist): Promise<Wishlist> {
    const [newItem] = await db.insert(wishlist).values(item).returning();
    return newItem;
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    await db
      .delete(wishlist)
      .where(
        and(
          eq(wishlist.userId, userId),
          eq(wishlist.productId, productId)
        )
      );
  }

  // Review operations
  async getProductReviews(productId: number): Promise<(Review & { user: User })[]> {
    return await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt))
      .then(rows =>
        rows.map(row => ({
          ...row.reviews,
          user: row.users!,
        }))
      );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update product rating
    await this.updateProductRating(review.productId);
    
    return newReview;
  }

  async updateProductRating(productId: number): Promise<void> {
    const result = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        reviewCount: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    const { avgRating, reviewCount } = result[0];

    await db
      .update(products)
      .set({
        rating: avgRating ? avgRating.toFixed(2) : "0",
        reviewCount: reviewCount,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));
  }
}

export const storage = new DatabaseStorage();
