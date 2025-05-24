import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { SearchProductRequest } from '@mp/common/dtos';

import { SearchProductQuery } from './command/search-product-query';

@Controller('product')
export class ProductController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}
  
  @Post('search')
  @RequiredPermissions(PermissionCodes.RegistrationRequest.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search products for listing',
    description:
      'Search for products based on the provided filters and search text.',
  })
  searchAsync(
    @Body() searchProductRequestDto: SearchProductRequest,
  ) {
    return this.queryBus.execute(
      new SearchProductQuery(searchProductRequestDto),
    );
  }
}
