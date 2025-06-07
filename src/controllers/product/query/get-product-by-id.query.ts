import { Query } from "@nestjs/cqrs";

export class GetProductByIdQuery extends Query<void> {
    constructor(public readonly id: number) {
        super();
    }
}