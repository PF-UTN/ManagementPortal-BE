export class DownloadShipmentDto {
  ID: number;
  Fecha: Date;
  Vehiculo: string;
  Estado: string;
  Pedidos_Asociados: string;
  Kilometros_Estimados: number | null;
  Kilometros_Efectivos: number | null;
  Link_Ruta: string | null;
}
