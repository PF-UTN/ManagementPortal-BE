export class DownloadProductItemDto {
  ID: number;
  Nombre: string;
  Categoria?: string;
  Precio: number;
  Cantidad_Disponible: number;
  Cantidad_Reservada: number;
  Cantidad_Pedida: number;
  Estado: string;
}
