import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import {
  SearchServiceSupplierRequest,
  ServiceSupplierCreationDto,
} from '@mp/common/dtos';

import { CreateServiceSupplierCommand } from './command/create-service-supplier.command';
import { GetServiceSupplierByIdQuery } from './query/get-service-supplier-by-id.query';
import { SearchServiceSupplierQuery } from './query/search-service-supplier.query';

@Controller('service-supplier')
export class ServiceSupplierController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/:id')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.ServiceSupplier.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a service supplier by ID',
    description: 'Retrieve the service supplier with the provided ID.',
  })
  getServiceSupplierByIdAsync(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetServiceSupplierByIdQuery(id));
  }

  @Post('/')
  @RequiredPermissions(
    PermissionCodes.ServiceSupplier.CREATE,
    PermissionCodes.ServiceSupplier.UPDATE,
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create or update a service supplier',
    description: 'Create a new service supplier or update an existing one.',
  })
  @ApiBody({ type: ServiceSupplierCreationDto })
  async createOrUpdateServiceSupplierAsync(
    @Body() supplierCreationDto: ServiceSupplierCreationDto,
  ) {
    return this.commandBus.execute(
      new CreateServiceSupplierCommand(supplierCreationDto),
    );
  }

  @Post('search')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.ServiceSupplier.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search service suppliers with search text',
    description:
      'Search for service suppliers based on the provided search text.',
  })
  async searchServiceSupplierAsync(
    @Body() searchServiceSupplierRequest: SearchServiceSupplierRequest,
  ) {
    return this.queryBus.execute(
      new SearchServiceSupplierQuery(searchServiceSupplierRequest),
    );
  }
}
