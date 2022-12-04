export type Bottle = {
  id: string;
  created: Date;
  origin: GeoPoint;
  endpoint: GeoPoint;
  routes: Route[];
};

export type Route = {
  distance: number;
  route: Point[];
};

export type Point = [number, number];

type GeoPoint = {
  type: string;
  coordinates: Point;
};

export type GetBottlesResponse = {
  bottles: {
    id: string;
    created: number;
    origin: GeoPoint;
    endpoint: GeoPoint;
    routes: Route[];
  }[];
};
