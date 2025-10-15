export class SearchShipmentReturnDataDto {
  id: number;
  date: Date;
  vehicle: {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
  };
  status: string;
  orders: { id: number; status: string }[];
  estimatedKm: number | null;
  effectiveKm: number | null;
  routeLink: string | null;
}
