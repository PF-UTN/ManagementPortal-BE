export class DownloadPurchaseOrderDto {
  ID: number;

  Estado: string;
  Proveedor: string;

  Fecha_Creacion: Date;
  Fecha_Entrega_Estimada: Date;
  Fecha_Entrega_Efectiva?: Date | null;

  Observacion?: string | null;
  Monto_Total: number;

  Productos: string;
}
