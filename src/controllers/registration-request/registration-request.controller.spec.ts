import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRequestController } from './registration-request.controller';
import { QueryBus } from '@nestjs/cqrs';
import { SearchRegistrationRequestRequest } from '@mp/common/dtos';
import { SearchRegistrationRequestQuery } from './command/search-registration-request-query';

describe('RegistrationRequestController', () => {
  let controller: RegistrationRequestController;
  let queryBus: QueryBus;

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
      ],
    }).compile();

    controller = module.get<RegistrationRequestController>(RegistrationRequestController);
    queryBus = module.get<QueryBus>(QueryBus);
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
  
      expect(queryBus.execute).toHaveBeenCalledWith(new SearchRegistrationRequestQuery(request));
    });
  });
});
