import { StreamableFile } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchRegistrationRequestRequest } from '@mp/common/dtos';
import { DateHelper, ExcelExportHelper } from '@mp/common/helpers';

import { DownloadRegistrationRequestQuery } from './query/download-registration-request-query';
import { SearchRegistrationRequestQuery } from './query/search-registration-request-query';
import { RegistrationRequestController } from './registration-request.controller';

describe('RegistrationRequestController', () => {
  let controller: RegistrationRequestController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationRequestController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep(QueryBus),
        },
        {
          provide: CommandBus,
          useValue: mockDeep(CommandBus),
        },
      ],
    }).compile();

    controller = module.get<RegistrationRequestController>(
      RegistrationRequestController,
    );
    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      // Arrange
      const request: SearchRegistrationRequestRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: { status: ['Pending'] },
      };
      // Act
      await controller.searchAsync(request);
      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchRegistrationRequestQuery(request),
      );
    });
  });

  describe('approveRegistrationRequestAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const registrationRequestId = 1;
      const approveRegistrationRequestDto = { note: 'Test note' };
      // Act
      await controller.approveRegistrationRequestAsync(
        registrationRequestId,
        approveRegistrationRequestDto,
      );
      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationRequestId,
          approveRegistrationRequestDto,
        }),
      );
    });

    describe('rejectRegistrationRequestAsync', () => {
      it('should call execute on the commandBus with correct parameters', async () => {
        // Arrange
        const registrationRequestId = 1;
        const rejectRegistrationRequestDto = { note: 'Test note' };
        // Act
        await controller.rejectRegistrationRequestAsync(
          registrationRequestId,
          rejectRegistrationRequestDto,
        );
        // Assert
        expect(commandBus.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            registrationRequestId,
            rejectRegistrationRequestDto,
          }),
        );
      });
    });
  });

  describe('getRegistrationRequestByIdAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      // Arrange
      const registrationRequestId = 1;
      // Act
      await controller.getRegistrationRequestByIdAsync(registrationRequestId);
      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          id: registrationRequestId,
        }),
      );
    });
  });

  describe('downloadAsync', () => {
    const downloadRegistrationRequestRequest = { filters: {}, searchText: '' };
    const registrationRequests = [{ ID: 1, Nombre: 'Test' }];
    const buffer = Buffer.from('test');
    const expectedFilename = `${DateHelper.formatYYYYMMDD(new Date())} - Listado Solicitudes de Registro`;

    beforeEach(() => {
      jest.spyOn(queryBus, 'execute').mockResolvedValue(registrationRequests);
      jest
        .spyOn(ExcelExportHelper, 'exportToExcelBuffer')
        .mockReturnValue(buffer);
    });

    it('should call execute on the queryBus with correct parameters', async () => {
      // Act
      await controller.downloadAsync(downloadRegistrationRequestRequest);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(
        new DownloadRegistrationRequestQuery(
          downloadRegistrationRequestRequest,
        ),
      );
    });

    it('should call exportToExcelBuffer with registrationRequests', async () => {
      // Act
      await controller.downloadAsync(downloadRegistrationRequestRequest);

      // Assert
      expect(ExcelExportHelper.exportToExcelBuffer).toHaveBeenCalledWith(
        registrationRequests,
      );
    });

    it('should return a StreamableFile', async () => {
      // Act
      const result = await controller.downloadAsync(
        downloadRegistrationRequestRequest,
      );

      // Assert
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should set the correct filename in the disposition', async () => {
      // Act
      const result = await controller.downloadAsync(
        downloadRegistrationRequestRequest,
      );

      // Assert
      expect(result.options.disposition).toBe(
        `attachment; filename="${expectedFilename}"`,
      );
    });

    it('should set the correct content type', async () => {
      // Act
      const result = await controller.downloadAsync(
        downloadRegistrationRequestRequest,
      );

      // Assert
      expect(result.options.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should set the correct length', async () => {
      // Act
      const result = await controller.downloadAsync(
        downloadRegistrationRequestRequest,
      );

      // Assert
      expect(result.options.length).toBe(buffer.length);
    });
  });
});
