import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import Map, { Layer, Marker, Source } from "react-map-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { Bottle, GetBottlesResponse, Point, Route } from "./types";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const BASE_URL = "https://bottlz.azurewebsites.net";
const BOTTLE_SPEED = 1.0;
const COLORS = [
  "#FF0000",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#0000FF",
  "#FF00FF",
];

function App() {
  const [viewState, setViewState] = useState({
    longitude: -100,
    latitude: 40,
    zoom: 3.5,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) =>
      setViewState({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
        zoom: 14,
      })
    );
  }, []);

  const [bottles, setBottles] = useState<Bottle[]>([]);
  useEffect(() => {
    fetch(`${BASE_URL}/bottles/getAll`)
      .then((res) => res.json())
      .then((json: GetBottlesResponse) =>
        setBottles(
          json.bottles.map((bottle) => ({
            ...bottle,
            created: new Date(bottle.created),
          }))
        )
      );
  }, []);

  /** The current interpolated location of a bottle */
  const currentLocation = (bottle: Bottle, date: Date): Point => {
    if (bottle.routes.length === 0) {
      return bottle.origin.coordinates;
    }

    const coveredDistance =
      (date.getTime() - bottle.created.getTime()) * BOTTLE_SPEED;
    let accumulatedDistance = 0;
    let currentRouteIndex = bottle.routes.length - 1;
    for (let i = 0; i < bottle.routes.length; i++) {
      if (accumulatedDistance + bottle.routes[i].distance > coveredDistance) {
        currentRouteIndex = i;
        break;
      }
      accumulatedDistance += bottle.routes[i].distance;
    }

    const currentRouteTraveledDistance = coveredDistance - accumulatedDistance;
    const currentRouteFraction =
      currentRouteTraveledDistance / bottle.routes[currentRouteIndex].distance;
    return routePosition(
      bottle.routes[currentRouteIndex],
      currentRouteFraction
    );
  };

  /** The interpolated position that is fraction through a route */
  const routePosition = (route: Route, fraction: number): Point => {
    if (fraction > 1) {
      return route.route[route.route.length - 1];
    } else if (fraction < 0) {
      return route.route[0];
    }

    const edgeLengths: number[] = [];
    for (let i = 1; i < route.route.length; i++) {
      const dLat = route.route[i][1] - route.route[i - 1][1];
      const dLon = route.route[i][0] - route.route[i - 1][0];
      const length = Math.sqrt(dLat * dLat + dLon * dLon);
      edgeLengths.push(length);
    }

    const totalLength = edgeLengths.reduce((a, b) => a + b);
    const coveredLength = fraction * totalLength;

    let accumulatedLength = 0;
    let currentEdgeIndex = 0;
    for (let i = 0; i < edgeLengths.length; i++) {
      if (accumulatedLength + edgeLengths[i] > coveredLength) {
        currentEdgeIndex = i;
        break;
      }
      accumulatedLength += edgeLengths[i];
    }

    const currentEdgeTraveledLength = coveredLength - accumulatedLength;
    const currentEdgeFraction =
      currentEdgeTraveledLength / edgeLengths[currentEdgeIndex];

    const currentPoint = route.route[currentEdgeIndex];
    const nextPoint = route.route[currentEdgeIndex + 1];

    const interpolatedLatitude =
      currentPoint[1] + (nextPoint[1] - currentPoint[1]) * currentEdgeFraction;
    const interpolatedLongitude =
      currentPoint[0] + (nextPoint[0] - currentPoint[0]) * currentEdgeFraction;
    return [interpolatedLongitude, interpolatedLatitude];
  };

  const routeCollection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: bottles.map((bottle, index) => ({
      type: "Feature",
      properties: { color: COLORS[index % COLORS.length] },
      geometry: {
        type: "LineString",
        coordinates: bottle.routes.flatMap((route) => route.route),
      },
    })),
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: window.innerHeight,
      }}
    >
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <Source id="routes" type="geojson" data={routeCollection}>
          <Layer
            id="routes"
            type="line"
            paint={{ "line-width": 3, "line-color": ["get", "color"] }}
          />
        </Source>
        {bottles.map((bottle) => {
          const location = bottle.origin.coordinates;
          return (
            <Marker longitude={location[0]} latitude={location[1]}></Marker>
          );
        })}
      </Map>
    </Box>
  );
}

export default App;
