export enum DeliveryMethodId {
  PickUpAtStore = 1,
  HomeDelivery = 2,
}

export const DeliveryMethodNameToIdMap: Record<string, number> = {
  PickUpAtStore: DeliveryMethodId.PickUpAtStore,
  HomeDelivery: DeliveryMethodId.HomeDelivery,
};
