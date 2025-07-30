import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  Get,
  StreamableFile,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import {
  ApproveRegistrationRequestDto,
  DownloadRegistrationRequestRequest,
  RejectRegistrationRequestDto,
  SearchRegistrationRequestRequest,
} from '@mp/common/dtos';
import { DateHelper, ExcelExportHelper } from '@mp/common/helpers';

import { ApproveRegistrationRequestCommand } from './command/approve-registration-request.command';
import { RejectRegistrationRequestCommand } from './command/reject-registration-request.command';
import { DownloadRegistrationRequestQuery } from './query/download-registration-request-query';
import { GetRegistrationRequestByIdQuery } from './query/get-registration-request-by-id.query';
import { SearchRegistrationRequestQuery } from './query/search-registration-request-query';

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

  @Post('download')
  @RequiredPermissions(PermissionCodes.RegistrationRequest.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download listed registration requests',
    description:
      'Download an XLSX for registration requests based on the provided filters and search text.',
  })
  async downloadAsync(
    @Body()
    downloadRegistrationRequestRequest: DownloadRegistrationRequestRequest,
  ): Promise<StreamableFile> {
    const registrationRequests = await this.queryBus.execute(
      new DownloadRegistrationRequestQuery(downloadRegistrationRequestRequest),
    );

    const buffer = ExcelExportHelper.exportToExcelBuffer(registrationRequests);

    const filename = `${DateHelper.formatYYYYMMDD(new Date())} - Listado Solicitudes de Registro`;

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      length: buffer.length,
      disposition: `attachment; filename="${filename}"`,
    });
  }

  @Post(':id/approve')
  @HttpCode(204)
  @RequiredPermissions(PermissionCodes.RegistrationRequest.UPDATE)
  @ApiBearerAuth()
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
  @RequiredPermissions(PermissionCodes.RegistrationRequest.UPDATE)
  @ApiBearerAuth()
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

  @Get(':id')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.RegistrationRequest.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a registration request by ID',
    description: 'Retrieve a registration request with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the registration request to retrieve',
  })
  getRegistrationRequestByIdAsync(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetRegistrationRequestByIdQuery(id));
  }
}
