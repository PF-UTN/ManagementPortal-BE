//NOSONAR
export abstract class PartiallyInitializable<T> {
  constructor(properties: T) {
    Object.assign(this, properties);
  }
}
