type RegistryAccessCar = { status: string; visibility: string };

// Released cars may advertise a minimal teaser. Intake and unknown states fail closed.
export function canPreviewRegistryCar(car: RegistryAccessCar): boolean {
  return car.status === "released" && ["public", "members", "private"].includes(car.visibility);
}

// Preserve the existing one-to-one Private Match restriction for full details.
export function canViewRegistryCar(car: RegistryAccessCar, staff: boolean, member: boolean): boolean {
  return staff || (member && car.status === "released" && ["public", "members"].includes(car.visibility));
}

export function registryTeaser(car: { id: string; year: string; make: string; model: string; category: string }, heroImageUrl?: string) {
  return { id: car.id, year: car.year, make: car.make, model: car.model, category: car.category, heroImageUrl };
}
