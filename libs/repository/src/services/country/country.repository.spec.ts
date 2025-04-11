import { Test, TestingModule } from '@nestjs/testing';
import { CountryRepository } from './country.repository';
import { PrismaService } from '../prisma.service';
import { Country } from '@prisma/client';

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

        repository = module.get<CountryRepository>(CountryRepository);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findAllAsync', () => {
        it('should return a list of countries', async () => {
            // Arrange
            const expectedCountries: Country[] = [
                { id: 1, name: 'Argentina' },
                { id: 2, name: 'Brazil' },
            ];

            jest.spyOn(prismaService.country, 'findMany').mockResolvedValue(expectedCountries);

            // Act
            const result = await repository.findAllAsync();

            // Assert
            expect(result).toEqual(expectedCountries);
        });

        it('should return an empty list if no countries are found', async () => {
            // Arrange
            jest.spyOn(prismaService.country, 'findMany').mockResolvedValue([]);

            // Act
            const result = await repository.findAllAsync();

            // Assert
            expect(result).toEqual([]);
        });

        it('should handle errors gracefully', async () => {
            // Arrange
            jest.spyOn(prismaService.country, 'findMany').mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(repository.findAllAsync()).rejects.toThrow('Database error');
        });
    });
});