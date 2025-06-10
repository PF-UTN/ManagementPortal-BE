import { Query } from "@nestjs/cqrs";

import { ProductDetailsDto } from "@mp/common/dtos";
export class GetProductByIdQuery extends Query<ProductDetailsDto> {
    constructor(public readonly id: number) {
        super();
    }
}