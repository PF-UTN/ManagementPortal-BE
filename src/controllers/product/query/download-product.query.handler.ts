import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DownloadProductItemDto } from '@mp/common/dtos';

import { DownloadProductQuery } from './download-product.query';
import { ProductService } from '../../../domain/service/product/product.service';

@QueryHandler(DownloadProductQuery)
export class DownloadProductQueryHandler
  implements IQueryHandler<DownloadProductQuery>
{
  constructor(private readonly productDomainService: ProductService) {}

  async execute(
    query: DownloadProductQuery,
  ): Promise<DownloadProductItemDto[]> {
    const data = await this.productDomainService.downloadWithFiltersAsync(
      query.searchText,
      query.filters,
      query.orderBy,
    );

    return data.map(
      (product): DownloadProductItemDto => ({
        ID: product.id,
        Nombre: product.name,
        Categoria: product.category?.name,
        Precio: product.price.toNumber(),
        Cantidad_Disponible: product.stock?.quantityAvailable ?? 0,
        Cantidad_Pedida: product.stock?.quantityOrdered ?? 0,
        Cantidad_Reservada: product.stock?.quantityReserved ?? 0,
        Estado: product.enabled ? 'Activo' : 'Inactivo',
      }),
    );
  }
}
