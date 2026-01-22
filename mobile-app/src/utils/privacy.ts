interface Coordinates {
  latitude: number;
  longitude: number;
}

const GRID_SIZE = 0.001;

export const applyCloaking = (lat: number, lon: number): Coordinates => {
  // divide by grid size, floor to integer, multiply back: 44.123456 -> 44.123
  const pLat = Math.floor(lat / GRID_SIZE) * GRID_SIZE;
  const pLon = Math.floor(lon / GRID_SIZE) * GRID_SIZE;

  return {
    latitude: Number(pLat.toFixed(5)),
    longitude: Number(pLon.toFixed(5)),
  };
};
