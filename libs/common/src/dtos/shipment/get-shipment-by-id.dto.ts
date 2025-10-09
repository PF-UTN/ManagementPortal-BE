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
  };
  status: string;
  orders: number[];
}
