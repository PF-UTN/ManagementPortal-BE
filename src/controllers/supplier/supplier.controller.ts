import { Controller, Get, HttpCode } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';

import { GetAllSuppliersQuery } from './query/get-all-suppliers.query';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Supplier.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get suppliers data',
    description: 'Retrieve a list of suppliers with their details.',
  })
  getAllSuppliersAsync() {
    return this.queryBus.execute(
      new GetAllSuppliersQuery(),
    );
  }
}
