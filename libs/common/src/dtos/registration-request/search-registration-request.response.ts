import { RegistrationRequestDto } from "./registration-request.dto";

export class SearchRegistrationRequestResponse {
    total: number;
    results: RegistrationRequestDto[];
}