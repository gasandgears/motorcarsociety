// Private Match cars are introduced individually by staff, never through the Registry.
export function canViewRegistryCar(car: { status: string; visibility: string }, staff: boolean, member: boolean): boolean {
  return staff || (car.status === "released" && (car.visibility === "public" || (member && car.visibility === "members")));
}
