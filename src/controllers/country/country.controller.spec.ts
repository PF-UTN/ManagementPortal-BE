import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { CountryController } from './country.controller';
import { GetAllCountriesQuery } from './query/get-all-countries.query';

describe('CountryController', () => {
    let controller: CountryController;
    let queryBus: QueryBus;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CountryController],
            providers: [
                {
                    provide: QueryBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<CountryController>(CountryController);
        queryBus = module.get<QueryBus>(QueryBus);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAllCountriesAsync', () => {
        it('should call execute on the queryBus with GetAllCountriesQuery', async () => {
            // Act
            await controller.getAllCountriesAsync();

            // Assert
            expect(queryBus.execute).toHaveBeenCalledWith(new GetAllCountriesQuery());
        });

        it('should return the result from queryBus.execute', async () => {
            // Arrange
            const mockCountries = [
                { id: 1, name: 'Argentina' },
                { id: 2, name: 'Brazil' },
            ];
            (queryBus.execute as jest.Mock).mockResolvedValue(mockCountries);

            // Act
            const result = await controller.getAllCountriesAsync();

            // Assert
            expect(result).toEqual(mockCountries);
        });
    });
});