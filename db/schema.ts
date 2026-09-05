import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull().default(""),
    phone: text("phone").notNull().default(""),
    location: text("location").notNull().default(""),
    collectionNotes: text("collection_notes").notNull().default(""),
    role: text("role").notNull().default("applicant"),
    tier: text("tier").notNull().default("none"),
    status: text("status").notNull().default("pending"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_accounts_email").on(table.email),
    index("idx_accounts_status_role").on(table.status, table.role),
  ],
);

export const wantedProfiles = sqliteTable(
  "wanted_profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => accounts.userId, { onDelete: "cascade" }),
    marques: text("marques").notNull().default(""),
    specificCar: text("specific_car").notNull().default(""),
    valueRange: text("value_range").notNull().default("500-1500"),
    era: text("era").notNull().default("postwar"),
    primaryInterest: text("primary_interest").notNull().default("important"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [uniqueIndex("idx_wanted_profiles_user_id").on(table.userId)],
);

export const cars = sqliteTable(
  "cars",
  {
    id: text("id").primaryKey(),
    createdBy: text("created_by").notNull(),
    createdByEmail: text("created_by_email").notNull(),
    year: text("year").notNull(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    sellerName: text("seller_name").notNull(),
    sellerPhone: text("seller_phone").notNull(),
    expectedPrice: text("expected_price").notNull(),
    sellerEmail: text("seller_email").notNull(),
    location: text("location").notNull(),
    vin: text("vin").notNull(),
    notes: text("notes").notNull(),
    receivedCategories: text("received_categories").notNull().default(""),
    visibility: text("visibility").notNull(),
    status: text("status").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("idx_cars_updated_at").on(table.updatedAt),
    index("idx_cars_status_updated_at").on(table.status, table.updatedAt),
  ],
);

export const carFiles = sqliteTable(
  "car_files",
  {
    id: text("id").primaryKey(),
    carId: text("car_id").notNull().references(() => cars.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    category: text("category").notNull(),
    uploadedBy: text("uploaded_by").notNull(),
    uploadedByEmail: text("uploaded_by_email").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("idx_car_files_car_id").on(table.carId),
    uniqueIndex("idx_car_files_storage_key").on(table.storageKey),
  ],
);

export const carTaskStates = sqliteTable(
  "car_task_states",
  {
    id: text("id").primaryKey(),
    carId: text("car_id").notNull().references(() => cars.id, { onDelete: "cascade" }),
    taskKey: text("task_key").notNull(),
    status: text("status").notNull(),
    dueAt: integer("due_at").notNull(),
    snoozeCount: integer("snooze_count").notNull().default(0),
    completedAt: integer("completed_at"),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_car_task_states_car_task").on(table.carId, table.taskKey),
    index("idx_car_task_states_status_due").on(table.status, table.dueAt),
  ],
);
