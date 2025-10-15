export class GetShipmentByIdDto {
  id: number;
  date: Date;
  estimatedKm: number | null;
  effectiveKm: number | null;
  finishedAt: Date | null;
  routeLink: string | null;
  vehicle?: {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    kmTraveled: number;
  };
  status: string;
  orders: { id: number; status: string }[];
}
