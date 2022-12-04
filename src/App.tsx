import { Box, SvgIcon, SvgIconProps } from "@mui/material";
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

function BottleIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg
        width="24px"
        height="24px"
        version="1.1"
        viewBox="0 0 752 752"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m434.84 153.31c-5.1211-0.27344-9.8555 2.9219-11.473 8.1016l-12.582 46.617c-5.1797 2.2188-9.25 6.6602-11.098 12.211l-5.9219 21.457c-1.1094 4.8086-0.73828 9.6211 1.8516 14.062 0.37109 0.73828 1.1055 1.4766 1.4727 2.2188l-24.785 93.977c-31.078-2.2188-60.305 18.133-68.816 49.211l-48.098 179.81c-7.0273-1.8516-13.32-5.9219-17.762-11.102-2.2188-2.5898-5.1758-4.0664-8.5039-4.0664-3.332 0-6.293 1.4766-8.5117 4.0664-6.6602 8.1406-17.02 12.582-28.117 12.582-11.102 0-21.461-4.4414-28.121-12.582-4.0664-4.8086-11.102-5.1836-15.543-1.1133-4.8086 4.0703-5.1758 11.105-1.1055 15.543 11.102 12.949 27.375 20.352 45.137 20.352 13.688 0 26.27-4.4453 36.629-12.215 10.359 8.1406 22.941 12.215 36.629 12.215 13.691 0 26.266-4.4453 36.625-12.215 10.359 8.1406 22.941 12.215 36.629 12.215 13.32 0 26.273-4.4453 36.262-12.215 10.359 8.1406 23.309 12.949 37 12.949h0.73438c13.691 0 27.008-4.8086 37.367-12.949 0 0 0.375 0 0.375 0.37109 0.37109 0.36719 0.73828 0.375 1.1094 0.74219 1.1094 0.74219 2.5898 1.8477 3.6992 2.5859 0.36719 0.37109 1.1094 0.74609 1.4805 1.1133 1.1094 0.74219 2.5898 1.4805 3.6992 1.8516 0.37109 0.37109 1.1133 0.36719 1.4805 0.73828 1.8516 0.73828 3.332 1.4766 5.1836 2.2188 0.36719 0 0.73438-0.003906 0.73438 0.36719 1.4805 0.37109 2.9648 0.74219 4.8125 1.1133 0.74219 0 1.1133 0.36719 1.8516 0.36719 1.4805 0.37109 2.5898 0.375 4.0703 0.74609 0.73828 0 1.1094-0.003906 1.8477 0.36719 1.8516 0.37109 4.0703 0.36719 5.918 0.36719 13.691 0 26.27-4.4414 36.629-12.211 9.9922 7.7695 22.199 12.211 35.152 12.211h0.36719c5.918 0 11.098-4.8086 11.098-10.73-0.73828-7.0273-5.5469-12.203-11.836-12.203-10.73-0.37109-20.352-4.8125-27.012-12.582-2.2188-2.5898-5.1836-4.0664-8.5117-4.0664-3.3281 0-6.2852 1.4766-8.5039 4.0664-6.6602 8.1406-17.02 12.582-28.117 12.582-11.102 0-21.465-4.4414-28.125-12.582-0.37109-0.73828-1.1133-1.1133-1.8516-1.4805l-0.36719-0.37109c-0.37109-0.36719-1.1133-0.74219-1.4844-0.74219l31.449-117.28c4.4414-17.02 2.2266-35.148-6.6523-50.688-6.6602-11.469-16.648-20.723-28.121-26.641l25.156-94.348c5.1797-2.2188 9.25-6.6562 11.102-12.207l5.918-21.461c1.1094-4.8086 0.73828-9.6211-1.8516-14.062-0.37109-0.73828-1.1055-1.4766-1.4727-2.2188l11.836-45.879c1.4805-5.918-1.8477-11.836-7.7695-13.688l-56.977-15.168c-0.74219-0.18359-1.4805-0.29297-2.2148-0.33203zm7.0273 24.383 25.152 6.6562-8.5039 32.191-25.164-6.6641zm-21.465 51.797 49.949 13.32-3.6992 14.43-25.164-6.6641-24.785-6.6562zm-2.5859 37.734 4.8047 1.4844 19.98 5.5469-24.047 89.168-25.164-6.6562zm-52.121 106.94c4.3672-0.17969 8.832 0.28906 13.273 1.4688l49.949 13.316c10.359 13.32 14.793 31.078 9.9844 48.836l-38.109 143.93c-5.9219-2.2188-11.836-5.918-16.273-11.098l-0.74609-0.73828c-2.2188-2.5898-5.1758-4.0664-8.5039-4.0664-3.332 0-6.293 1.4766-8.5156 4.0664-6.6562 8.1406-17.016 12.582-28.117 12.582-11.098 0-21.457-4.4414-28.117-12.582-2.2188-2.5898-5.1797-4.0664-8.5117-4.0664-3.3281 0-6.293 1.4766-8.5117 4.0664-4.0703 4.8086-9.25 8.1367-15.168 10.355l46.246-173.15c5.1133-19.238 22.195-32.133 41.121-32.918zm-11.145 32.211c-5.125-0.27344-9.8555 2.9258-11.477 8.1055l-15.168 56.605c-1.4805 5.918 1.8477 11.844 7.7695 13.691 1.1094 0.37109 1.8516 0.37109 2.9609 0.37109 4.8125 0 9.2539-3.3281 10.734-8.1367l15.168-56.613c1.4766-5.918-1.8516-12.207-7.7695-13.684-0.74219-0.1875-1.4883-0.30078-2.2188-0.33984zm241.59 159.43c-6.2891 0-11.098 4.8086-11.098 11.098s4.8086 11.098 11.098 11.098c6.293 0 11.102-4.8086 11.102-11.098s-4.8086-11.098-11.102-11.098z" />
      </svg>
    </SvgIcon>
  );
}

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

  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    const timer = setTimeout(() => setCurrentDate(new Date()), 100);
    return () => clearTimeout(timer);
  });

  /** Returns true if the bottle has no route for it to be on at date */
  const isOutOfRoutes = (bottle: Bottle, date: Date): boolean => {
    const coveredDistance =
      ((date.getTime() - bottle.created.getTime()) / 1000) * BOTTLE_SPEED;
    const totalRouteDistance = bottle.routes
      .map((route) => route.distance)
      .reduce((a, b) => a + b);
    return coveredDistance >= totalRouteDistance;
  };

  /** The current interpolated location of a bottle */
  const currentLocation = (bottle: Bottle, date: Date): Point => {
    if (bottle.routes.length === 0) {
      return bottle.origin.coordinates;
    } else if (isOutOfRoutes(bottle, date)) {
      return bottle.endpoint.coordinates;
    }

    const coveredDistance =
      ((date.getTime() - bottle.created.getTime()) / 1000) * BOTTLE_SPEED;
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
          const location = currentLocation(bottle, currentDate);
          return (
            <Marker
              key={bottle.id}
              longitude={location[0]}
              latitude={location[1]}
            >
              <BottleIcon
                sx={{
                  fontSize: 30,
                  backgroundColor: "white",
                  borderRadius: 15,
                  boxShadow: "0 0 4px gray",
                }}
              />
            </Marker>
          );
        })}
      </Map>
    </Box>
  );
}

export default App;
