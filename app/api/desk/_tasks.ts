export type DeskCar = {
  id: string;
  year: string;
  make: string;
  model: string;
  sellerName: string;
  sellerPhone: string;
  expectedPrice: string;
  sellerEmail: string;
  location: string;
  vin: string;
  receivedCategories: string;
  status: string;
  createdAt: number;
  updatedAt: number;
};

export type DeskTaskState = {
  taskKey: string;
  status: string;
  dueAt: number;
  snoozeCount: number;
};

const categories = ["photos", "title", "registration", "bill_of_sale", "ownership_history", "identity", "drivetrain", "restoration_history", "restoration_invoice", "condition", "photo_manifest", "provenance", "application"] as const;

const categoryLabels: Record<(typeof categories)[number], string> = {
  photos: "Collect the vehicle photography",
  title: "Collect ownership or title evidence",
  registration: "Collect current registration evidence",
  bill_of_sale: "Collect the bill of sale or transfer record",
  ownership_history: "Document the ownership history",
  identity: "Complete vehicle identity verification",
  drivetrain: "Complete engine and drivetrain verification",
  restoration_history: "Collect the restoration history",
  restoration_invoice: "Collect restoration invoices",
  condition: "Complete the condition inspection",
  photo_manifest: "Complete the photo documentation manifest",
  provenance: "Complete the provenance narrative",
  application: "Complete the Registry intake application",
};

export const validDeskTaskKeys = new Set([
  "seller_contact",
  "price",
  "seller_email",
  "location",
  "vin",
  ...categories,
  "handoff",
]);

export function buildDeskSummary(car: DeskCar, states: DeskTaskState[], now = Date.now()) {
  const received = new Set(car.receivedCategories.split(",").filter(Boolean));
  const completed = new Set(states.filter((state) => state.status === "completed").map((state) => state.taskKey));
  const stateByKey = new Map(states.map((state) => [state.taskKey, state]));
  const tasks = [
    ...(!car.sellerName || !car.sellerPhone ? [{ key: "seller_contact", label: "Confirm the seller’s name and phone number" }] : []),
    ...(!car.expectedPrice ? [{ key: "price", label: "Confirm the expected selling price" }] : []),
    ...(!car.sellerEmail ? [{ key: "seller_email", label: "Get the seller’s email address" }] : []),
    ...(!car.location ? [{ key: "location", label: "Confirm where the car is located" }] : []),
    ...(!car.vin ? [{ key: "vin", label: "Record the VIN or chassis number" }] : []),
    ...categories.filter((category) => !received.has(category)).map((category) => ({ key: category, label: categoryLabels[category] })),
    { key: "handoff", label: "Send the complete car file to Dean" },
  ].filter((task) => !completed.has(task.key));

  const checks = [
    Boolean(car.year && car.make && car.model),
    Boolean(car.sellerName && car.sellerPhone),
    Boolean(car.expectedPrice),
    Boolean(car.sellerEmail),
    Boolean(car.location),
    Boolean(car.vin),
    ...categories.map((category) => received.has(category)),
  ];
  const progress = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  if (car.status === "review") {
    return {
      actionKey: "dean_review",
      action: "Dean is reviewing the car file",
      assignedTo: "Dean",
      dueAt: car.updatedAt,
      snoozeCount: 0,
      status: "waiting",
      progress: Math.max(progress, 90),
      tone: "ready",
    };
  }

  if (car.status === "ready" || car.status === "released") {
    return {
      actionKey: "complete",
      action: car.status === "released" ? "Car released" : "Approved and ready for release",
      assignedTo: "Dean",
      dueAt: car.updatedAt,
      snoozeCount: 0,
      status: "completed",
      progress: 100,
      tone: "ready",
    };
  }

  const task = tasks[0];
  if (!task) {
    return {
      actionKey: "complete",
      action: "No open action",
      assignedTo: "Barnaby",
      dueAt: car.updatedAt,
      snoozeCount: 0,
      status: "completed",
      progress: 100,
      tone: "ready",
    };
  }

  const state = stateByKey.get(task.key);
  const dueAt = state?.dueAt || car.createdAt + 24 * 60 * 60 * 1000;
  return {
    actionKey: task.key,
    action: task.label,
    assignedTo: "Barnaby",
    dueAt,
    snoozeCount: state?.snoozeCount || 0,
    status: "open",
    progress,
    tone: dueAt <= now ? "urgent" : dueAt - now <= 24 * 60 * 60 * 1000 ? "warning" : "ready",
  };
}
