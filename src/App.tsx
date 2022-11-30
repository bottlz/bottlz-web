import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import Map, { Layer, Source } from "react-map-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { Bottle } from "./types";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const BASE_URL = "https://bottlz.azurewebsites.net";

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
      .then((json) => setBottles(json.bottles));
  }, []);

  const routeCollection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: bottles.map((bottle) => ({
      type: "Feature",
      properties: { color: "#F7455D" },
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
      </Map>
    </Box>
  );
}

export default App;
