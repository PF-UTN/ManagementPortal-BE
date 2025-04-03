import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import {
  ApproveRegistrationRequestDto,
  RejectRegistrationRequestDto,
  SearchRegistrationRequestRequest,
} from '@mp/common/dtos';
import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { SearchRegistrationRequestQuery } from './command/search-registration-request-query';
import { ApproveRegistrationRequestCommand } from './command/approve-registration-request.command';
import { RejectRegistrationRequestCommand } from './command/reject-registration-request.command';

@Controller('registration-request')
export class RegistrationRequestController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('search')
  @RequiredPermissions(PermissionCodes.RegistrationRequest.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search registration requests for listing',
    description:
      'Search for registration requests based on the provided filters and search text.',
  })
  searchAsync(
    @Body() searchRegistrationRequestRequest: SearchRegistrationRequestRequest,
  ) {
    return this.queryBus.execute(
      new SearchRegistrationRequestQuery(searchRegistrationRequestRequest),
    );
  }

  @Post(':id/approve')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Approve a registration request',
    description: 'Approve a registration request with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the registration request to approve',
  })
  @ApiBody({ type: ApproveRegistrationRequestDto })
  approveRegistrationRequestAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveRegistrationRequestDto: ApproveRegistrationRequestDto,
  ) {
    return this.commandBus.execute(
      new ApproveRegistrationRequestCommand(id, approveRegistrationRequestDto),
    );
  }

  @Post(':id/reject')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Reject a registration request',
    description: 'Reject a registration request with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the registration request to reject',
  })
  @ApiBody({ type: RejectRegistrationRequestDto })
  rejectRegistrationRequestAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectRegistrationRequestDto: RejectRegistrationRequestDto,
  ) {
    return this.commandBus.execute(
      new RejectRegistrationRequestCommand(id, rejectRegistrationRequestDto),
    );
  }
}
