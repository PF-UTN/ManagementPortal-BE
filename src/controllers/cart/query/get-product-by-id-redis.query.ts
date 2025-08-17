import { Query } from "@nestjs/cqrs";

import { ProductDetailsDto } from "@mp/common/dtos";
export class GetProductByIdRedisQuery extends Query<ProductDetailsDto> {
    constructor(public readonly id: number) {
        super();
    }
}