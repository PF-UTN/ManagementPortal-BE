import { protos, RouteOptimizationClient } from '@googlemaps/routeoptimization';
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleMapsRoutingService {
  private readonly routeOptimizationclient: RouteOptimizationClient;
  private readonly baseGeocodeUrl =
    'https://maps.googleapis.com/maps/api/geocode/json';
  private readonly originCoordinates = {
    latitude: -33.54590454529883,
    longitude: -60.09326987690076,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const base64 =
      this.configService.get<string>('GOOGLE_CREDENTIALS_BASE64') ??
      process.env.GOOGLE_CREDENTIALS_BASE64;
    const json =
      this.configService.get<string>('GOOGLE_CREDENTIALS_JSON') ??
      process.env.GOOGLE_CREDENTIALS_JSON;

    // Si no hay credenciales, no pasar `credentials` para permitir ADC (Application Default Credentials)
    if (!base64 && !json) {
      this.routeOptimizationclient = new RouteOptimizationClient();
      return;
    }

    // Si hay credenciales, intentar parsearlas (acepta base64 o JSON crudo)
    try {
      const raw = (base64 ?? json)!.trim();
      const jsonString = raw.startsWith('{')
        ? raw
        : Buffer.from(raw, 'base64').toString('utf8');
      const credentials = JSON.parse(jsonString);
      this.routeOptimizationclient = new RouteOptimizationClient({
        credentials,
      });
    } catch (err) {
      throw new Error(
        'Invalid Google credentials (GOOGLE_CREDENTIALS_BASE64 o GOOGLE_CREDENTIALS_JSON): ' +
          (err as Error).message,
      );
    }
  }

  async geocodeAsync(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const url = `${this.baseGeocodeUrl}?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      const response = await firstValueFrom(this.httpService.get(url));

      if (response.data.status !== 'OK' || !response.data.results.length) {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }

      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } catch (err) {
      throw new InternalServerErrorException(
        `Error geocoding address: ${err.message}`,
      );
    }
  }

  async batchOptimizeToursAsync(params: {
    shipments: protos.google.maps.routeoptimization.v1.IShipment[];
    vehicles?: protos.google.maps.routeoptimization.v1.IVehicle[];
  }) {
    const request: protos.google.maps.routeoptimization.v1.IOptimizeToursRequest =
      {
        parent: `projects/${this.configService.get('GOOGLE_PROJECT_ID')}`,
        model: {
          shipments: params.shipments,
          vehicles: params.vehicles?.length
            ? params.vehicles
            : [
                {
                  id: 'vehicle_1',
                  startLocation: this.originCoordinates,
                  endLocation: this.originCoordinates,
                  startTime: { seconds: Math.floor(Date.now() / 1000) },
                  endTime: { seconds: Math.floor(Date.now() / 1000) + 86400 },
                },
              ],
          objectives: [
            {
              type: 'MINIMIZE_TIME',
            },
          ],
        } as protos.google.maps.routeoptimization.v1.IShipmentModel,
      };

    const response = await this.routeOptimizationclient.optimizeTours(request);

    const tourResponse = response[0];
    const estimatedMeters =
      tourResponse.metrics!.aggregatedRouteMetrics?.travelDistanceMeters;
    return {
      routeLink: this.buildGoogleMapsLinkFromResponse(
        tourResponse,
        params.shipments,
      ),
      estimatedKm: estimatedMeters! / 1000,
    };
  }

  private buildGoogleMapsLinkFromResponse(
    tourResponse: protos.google.maps.routeoptimization.v1.IOptimizeToursResponse,
    shipments: protos.google.maps.routeoptimization.v1.IShipment[],
  ) {
    const route = tourResponse.routes![0];
    const stops: string[] = [];

    route.visits!.forEach((visit) => {
      const shipment = shipments[visit.shipmentIndex!];
      let loc;

      if (visit.isPickup) {
        loc = shipment.pickups?.[visit.visitRequestIndex!]?.arrivalLocation;
      } else {
        loc = shipment.deliveries?.[visit.visitRequestIndex!]?.arrivalLocation;
      }

      if (loc) {
        stops.push(`${loc.latitude},${loc.longitude}`);
      }
    });

    if (stops.length === 0) return null;

    const origin =
      this.originCoordinates.latitude + ',' + this.originCoordinates.longitude;
    const destination = origin;
    const waypoints = stops.join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    return url;
  }
}
