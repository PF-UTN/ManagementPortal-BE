class WebhookDataDto {
  id: string;
}

export class MercadoPagoWebhookRequest {
  id: string;
  live_mode: boolean;

  type: string;

  date_created: string;

  user_id: string;

  api_version: string;

  action: string;

  data: WebhookDataDto;
}
