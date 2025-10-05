import { Controller, Get, Headers } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';

import { GetClientAddressByUserIdQuery } from './query/get-client-address-by-user-id.query';

@Controller('client')
export class ClientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @RequiredPermissions(PermissionCodes.Client.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Client Address from authenticated user',
    description: 'Retrieve the client address from an authenticated user.',
  })
  async getClientAddressByUserIdAsync(
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return await this.queryBus.execute(
      new GetClientAddressByUserIdQuery(authorizationHeader),
    );
  }
}
