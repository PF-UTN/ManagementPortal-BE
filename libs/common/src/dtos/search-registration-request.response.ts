import { RegistrationRequestDto } from "./registration-request/registration-request.dto";

export class SearchRegistrationRequestResponse {
    total: number;
    results: RegistrationRequestDto[];
}