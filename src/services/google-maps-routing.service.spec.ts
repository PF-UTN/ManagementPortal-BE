import { protos } from '@googlemaps/routeoptimization';
import { HttpService } from '@nestjs/axios';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';

import { GoogleMapsRoutingService } from './google-maps-routing.service';

jest.mock('@googlemaps/routeoptimization', () => {
  const optimizeToursMock = jest.fn();
  return {
    protos: {},
    RouteOptimizationClient: jest.fn().mockImplementation(() => ({
      optimizeTours: optimizeToursMock,
    })),
  };
});

describe('GoogleMapsRoutingService', () => {
  let service: GoogleMapsRoutingService;
  let httpService: HttpService;

  beforeEach(async () => {
    const configServiceMock = {
      get: jest.fn((key: string) => {
        if (key === 'GOOGLE_CREDENTIALS_BASE64')
          return 'ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAibWFuYWdlbWVudHBvcnRhbC10ZXN0IiwKICAicHJpdmF0ZV9rZXlfaWQiOiAiMTIzNDU2Nzg5YWJjZGVmIiwKICAicHJpdmF0ZV9rZXkiOiAiLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5NSUlGZkFJQkFBS0NBUUVBM2pGZ2V5RHZGSU82dEd4UVJ6NXJzR3VoTG9SY3Z6L1Z4U0tId2NhOXZ0bVdzXG4yRmlMb3hNMFpUeTVVc1c0K2p4R3lyL2dNS2dxMnlXeXJMaU5PazF3VGdGZUV5Z2hkR1pzeGxWNHpsdEdHZW9XXG5pU1JrOExZV3U2bE1uNVNSK0FpQ2I1cFNZbUVvOTVDRHhYb1hJYjlHZlBWUmpqZXphdDF1K1pKZjRLRnQzXG41UGx2SzhJQ0FRRUFvTUtYdG1xQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBLVxuLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tIgp9';
        if (key === 'GOOGLE_PROJECT_ID') return 'test-project';
        return undefined;
      }),
    };

    const httpServiceMock = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleMapsRoutingService,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: HttpService, useValue: httpServiceMock },
      ],
    }).compile();

    service = module.get<GoogleMapsRoutingService>(GoogleMapsRoutingService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('geocodeAsync', () => {
    it('should return lat/lng for a valid address', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          results: [{ geometry: { location: { lat: 1, lng: 2 } } }],
        },
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      const result = await service.geocodeAsync('test address');
      expect(result).toEqual({ lat: 1, lng: 2 });
    });

    it('should throw InternalServerErrorException if geocoding fails', async () => {
      const mockResponse = {
        data: { status: 'ZERO_RESULTS', results: [] },
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      await expect(service.geocodeAsync('bad address')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException on http error', async () => {
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new Error('Network error');
      });

      await expect(service.geocodeAsync('any address')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('batchOptimizeToursAsync', () => {
    it('should call optimizeTours and return routeLink and estimatedKm', async () => {
      const shipments: protos.google.maps.routeoptimization.v1.IShipment[] = [
        { deliveries: [{ arrivalLocation: { latitude: 1, longitude: 2 } }] },
      ];

      const vehicles: protos.google.maps.routeoptimization.v1.IVehicle[] = [
        {
          startLocation: { latitude: 1, longitude: 2 },
          endLocation: { latitude: 1, longitude: 2 },
        },
      ];

      const mockOptimizeToursResponse: protos.google.maps.routeoptimization.v1.IOptimizeToursResponse[] =
        [
          {
            routes: [
              {
                visits: [
                  { shipmentIndex: 0, visitRequestIndex: 0, isPickup: false },
                ],
              },
            ],
            metrics: { aggregatedRouteMetrics: { travelDistanceMeters: 5000 } },
          },
        ];

      service['routeOptimizationclient'].optimizeTours = jest
        .fn()
        .mockResolvedValue(mockOptimizeToursResponse);

      const result = await service.batchOptimizeToursAsync({
        shipments,
        vehicles,
      });

      expect(
        service['routeOptimizationclient'].optimizeTours,
      ).toHaveBeenCalled();
      expect(result.routeLink).toContain('google.com/maps/dir');
      expect(result.estimatedKm).toBe(5);
    });

    it('should return null routeLink if no stops', async () => {
      const shipments: protos.google.maps.routeoptimization.v1.IShipment[] = [
        { deliveries: [] },
      ];

      const mockOptimizeToursResponse: protos.google.maps.routeoptimization.v1.IOptimizeToursResponse[] =
        [
          {
            routes: [{ visits: [] }],
            metrics: { aggregatedRouteMetrics: { travelDistanceMeters: 0 } },
          },
        ];

      service['routeOptimizationclient'].optimizeTours = jest
        .fn()
        .mockResolvedValue(mockOptimizeToursResponse);

      const result = await service.batchOptimizeToursAsync({ shipments });

      expect(
        service['routeOptimizationclient'].optimizeTours,
      ).toHaveBeenCalled();
      expect(result.routeLink).toBeNull();
      expect(result.estimatedKm).toBe(0);
    });
  });
});
