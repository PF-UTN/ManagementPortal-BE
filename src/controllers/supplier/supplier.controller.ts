import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import {
  SupplierCreationDto,
  SupplierDocumentSearchDto,
} from '@mp/common/dtos';

import { CreateSupplierCommand } from './command/create-supplier.command';
import { SupplierByDocumentQuery } from './query/supplier-by-document.query';
import { SuppliersQuery } from './query/suppliers.query';

@Controller('supplier')
export class SupplierController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Supplier.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get suppliers data',
    description: 'Retrieve a list of suppliers with their details.',
  })
  getAllSuppliersAsync() {
    return this.queryBus.execute(new SuppliersQuery());
  }

  @Post('/')
  @RequiredPermissions(
    PermissionCodes.Supplier.CREATE,
    PermissionCodes.Supplier.UPDATE,
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create or update a supplier',
    description: 'Create a new supplier or update an existing one.',
  })
  @ApiBody({ type: SupplierCreationDto })
  async createOrUpdateSupplierAsync(
    @Body() supplierCreationDto: SupplierCreationDto,
  ) {
    return this.commandBus.execute(
      new CreateSupplierCommand(supplierCreationDto),
    );
  }

  @Get('/search')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Supplier.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search supplier by document',
    description: 'Find a supplier using their document type and number.',
  })
  async getSupplierByDocumentAsync(
    @Query() supplierDocumentSearchDto: SupplierDocumentSearchDto,
  ) {
    return this.queryBus.execute(
      new SupplierByDocumentQuery(supplierDocumentSearchDto),
    );
  }
}
