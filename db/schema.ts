import { sql } from "drizzle-orm";
import { bigint, index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const accounts = pgTable(
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
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [
    uniqueIndex("idx_accounts_email").on(table.email),
    index("idx_accounts_status_role").on(table.status, table.role),
  ],
);

export const wantedProfiles = pgTable(
  "wanted_profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => accounts.userId, { onDelete: "cascade" }),
    marques: text("marques").notNull().default(""),
    specificCar: text("specific_car").notNull().default(""),
    valueRange: text("value_range").notNull().default("500-1500"),
    acquisitionLow: text("acquisition_low").notNull().default(""),
    acquisitionHigh: text("acquisition_high").notNull().default(""),
    era: text("era").notNull().default("postwar"),
    primaryInterest: text("primary_interest").notNull().default("important"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [uniqueIndex("idx_wanted_profiles_user_id").on(table.userId)],
);

export const wantedVehicles = pgTable(
  "wanted_vehicles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => accounts.userId, { onDelete: "cascade" }),
    year: text("year").notNull().default(""),
    make: text("make").notNull().default(""),
    model: text("model").notNull().default(""),
    variant: text("variant").notNull().default(""),
    acquisitionLow: text("acquisition_low").notNull().default(""),
    acquisitionHigh: text("acquisition_high").notNull().default(""),
    notes: text("notes").notNull().default(""),
    status: text("status").notNull().default("active"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [index("idx_wanted_vehicles_user").on(table.userId, table.status), index("idx_wanted_vehicles_make_model").on(table.make, table.model)],
);

export const mailingContacts = pgTable(
  "mailing_contacts",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull().default(""),
    phone: text("phone").notNull().default(""),
    source: text("source").notNull().default("client list"),
    permission: text("permission").notNull().default("needs_review"),
    inviteStatus: text("invite_status").notNull().default("not_sent"),
    unsubscribedAt: bigint("unsubscribed_at", { mode: "number" }),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [
    uniqueIndex("idx_mailing_contacts_email").on(table.email),
    index("idx_mailing_contacts_permission_status").on(table.permission, table.inviteStatus),
  ],
);

export const vehicleSubmissions = pgTable(
  "vehicle_submissions",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    year: text("year").notNull(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    location: text("location").notNull(),
    ownership: text("ownership").notNull(),
    story: text("story").notNull(),
    documentation: text("documentation").notNull().default(""),
    status: text("status").notNull().default("new"),
    consentedAt: bigint("consented_at", { mode: "number" }).notNull(),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [index("idx_vehicle_submissions_status_created").on(table.status, table.createdAt)],
);

export const cars = pgTable(
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
    exteriorColor: text("exterior_color").notNull().default(""),
    interiorColor: text("interior_color").notNull().default(""),
    mileage: text("mileage").notNull().default(""),
    bodyStyle: text("body_style").notNull().default(""),
    engine: text("engine").notNull().default(""),
    transmission: text("transmission").notNull().default(""),
    drivetrain: text("drivetrain").notNull().default(""),
    registryId: text("registry_id").notNull().default(""),
    category: text("category").notNull().default("Uncategorized"),
    shortDescription: text("short_description").notNull().default(""),
    overview: text("overview").notNull().default(""),
    highlights: text("highlights").notNull().default(""),
    conditionSummary: text("condition_summary").notNull().default(""),
    provenance: text("provenance").notNull().default(""),
    restorationSummary: text("restoration_summary").notNull().default(""),
    receivedCategories: text("received_categories").notNull().default(""),
    visibility: text("visibility").notNull(),
    status: text("status").notNull(),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [
    uniqueIndex("idx_cars_registry_id").on(table.registryId).where(sql`${table.registryId} <> ''`),
    index("idx_cars_category_status").on(table.category, table.status),
    index("idx_cars_updated_at").on(table.updatedAt),
    index("idx_cars_status_updated_at").on(table.status, table.updatedAt),
  ],
);

export const carFiles = pgTable(
  "car_files",
  {
    id: text("id").primaryKey(),
    carId: text("car_id").notNull().references(() => cars.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    category: text("category").notNull(),
    uploadedBy: text("uploaded_by").notNull(),
    uploadedByEmail: text("uploaded_by_email").notNull(),
    sortOrder: bigint("sort_order", { mode: "number" }).notNull().default(0),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
  },
  (table) => [
    index("idx_car_files_car_id").on(table.carId),
    uniqueIndex("idx_car_files_storage_key").on(table.storageKey),
  ],
);

export const carRequirements = pgTable(
  "car_requirements",
  {
    id: text("id").primaryKey(),
    carId: text("car_id").notNull().references(() => cars.id, { onDelete: "cascade" }),
    requirementKey: text("requirement_key").notNull(),
    entryText: text("entry_text").notNull().default(""),
    sourceFileId: text("source_file_id"),
    completionMethod: text("completion_method").notNull().default("manual"),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [uniqueIndex("idx_car_requirements_car_key").on(table.carId, table.requirementKey)],
);

export const carTaskStates = pgTable(
  "car_task_states",
  {
    id: text("id").primaryKey(),
    carId: text("car_id").notNull().references(() => cars.id, { onDelete: "cascade" }),
    taskKey: text("task_key").notNull(),
    status: text("status").notNull(),
    dueAt: bigint("due_at", { mode: "number" }).notNull(),
    snoozeCount: integer("snooze_count").notNull().default(0),
    completedAt: bigint("completed_at", { mode: "number" }),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [
    uniqueIndex("idx_car_task_states_car_task").on(table.carId, table.taskKey),
    index("idx_car_task_states_status_due").on(table.status, table.dueAt),
  ],
);

export const dossierRequests = pgTable(
  "dossier_requests",
  {
    id: text("id").primaryKey(),
    carId: text("car_id").notNull().references(() => cars.id, { onDelete: "cascade" }),
    requesterUserId: text("requester_user_id").notNull().references(() => accounts.userId, { onDelete: "cascade" }),
    requesterEmail: text("requester_email").notNull(),
    status: text("status").notNull().default("new"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [
    uniqueIndex("idx_dossier_requests_car_user").on(table.carId, table.requesterUserId),
    index("idx_dossier_requests_status_created").on(table.status, table.createdAt),
  ],
);
