import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRequestController } from './registration-request.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SearchRegistrationRequestRequest } from '@mp/common/dtos';
import { SearchRegistrationRequestQuery } from './command/search-registration-request-query';

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
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
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
      const request: SearchRegistrationRequestRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: { status: ['Pending'] },
      };

      await controller.searchAsync(request);

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
});
