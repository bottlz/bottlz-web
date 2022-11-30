export type Bottle = {
  id: string;
  created: number;
  origin: GeoPoint;
  endpoint: GeoPoint;
  routes: Route[];
};

export type Route = {
  distance: number;
  route: number[][];
};

type GeoPoint = {
  type: string;
  coordinates: number[];
};