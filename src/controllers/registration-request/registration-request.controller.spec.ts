import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRequestController } from './registration-request.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SearchRegistrationRequestRequest } from '@mp/common/dtos';
import { CommandBusMock, QueryBusMock } from '@mp/common/testing';
import { SearchRegistrationRequestQuery } from './command/search-registration-request-query';

describe('RegistrationRequestController', () => {
  let controller: RegistrationRequestController;
  let queryBusMock: QueryBusMock;
  let commandBusMock: CommandBusMock;

  beforeEach(async () => {
    queryBusMock = new QueryBusMock();
    commandBusMock = new CommandBusMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationRequestController],
      providers: [
        {
          provide: QueryBus,
          useValue: queryBusMock,
        },
        {
          provide: CommandBus,
          useValue: commandBusMock,
        },
      ],
    }).compile();

    controller = module.get<RegistrationRequestController>(
      RegistrationRequestController,
    );
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

      expect(queryBusMock.execute).toHaveBeenCalledWith(
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
      expect(commandBusMock.execute).toHaveBeenCalledWith(
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
        expect(commandBusMock.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            registrationRequestId,
            rejectRegistrationRequestDto,
          }),
        );
      });
    });
  });
});
