import { Test, TestingModule } from '@nestjs/testing';
import { CountryRepository } from './country.repository';
import { PrismaService } from '../prisma.service';

describe('CountryRepository', () => {
    let repository: CountryRepository;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CountryRepository,
                {
                    provide: PrismaService,
                    useValue: {
                        country: {
                            findMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        repository = module.get<CountryRepository>(
            CountryRepository
        );
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findAllAsync', () => {
        it('should return a list of countries', async () => {
            // Arrange
            const mockCountries = [
                { id: 1, name: 'Argentina' },
                { id: 2, name: 'Brazil' },
            ];
            prismaService.country.findMany = jest
                .fn()
                .mockResolvedValue(mockCountries);


            // Act
            const result =
                await repository.findAllAsync();

            // Assert
            expect(result).toEqual(mockCountries);
        });

        it('should return an empty list if no countries are found', async () => {
            // Arrange
            prismaService.country.findMany = jest
                .fn()
                .mockResolvedValue([]);

            // Act
            const result =
                await repository.findAllAsync();

            // Assert
            expect(result).toEqual([]);
        });
    });
});