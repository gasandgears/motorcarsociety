type RegistryAccessCar = { status: string; visibility: string };

// Released cars may advertise a minimal teaser. Intake and unknown states fail closed.
export function canPreviewRegistryCar(car: RegistryAccessCar): boolean {
  return car.status === "released" && ["public", "members", "private"].includes(car.visibility);
}

// Every approved member may view released listing details, including Private Match.
export function canViewRegistryCar(car: RegistryAccessCar, staff: boolean, member: boolean): boolean {
  return staff || (member && canPreviewRegistryCar(car));
}

export function registryTeaser(car: { id: string; year: string; make: string; model: string; category: string }, heroImageUrl?: string) {
  return { id: car.id, year: car.year, make: car.make, model: car.model, category: car.category, heroImageUrl };
}
