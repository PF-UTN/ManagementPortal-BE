export class UpdateCartProductQuantityCommand {
  constructor(
    public readonly userId: string,
    public readonly productId: number,
    public readonly quantity: number,
  ) {}
}
