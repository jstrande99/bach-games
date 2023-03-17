import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import L from 'leaflet';
import MarkerPNG from './Styles/Images/marker-icon-2x.png';
import { Link } from "react-router-dom";

export default function Map() {
  const [positions, setPosition] = useState([38.9608, -119.9415]);

  const locations = [
    { position: [38.9591, -119.94272], name: 'Location 1' },
    { position: [38.9596, -119.9422], name: 'Location 2' },
    { position: [38.9601, -119.943], name: 'Location 3' },
    { position: [38.9594, -119.94145], name: 'Location 4' },
    { position: [38.9597, -119.9415], name: 'Location 5' },
    { position: [38.9609, -119.9408], name: 'Location 6' },
    { position: [38.961, -119.9407], name: 'Location 7' },
    { position: [38.96115, -119.94055], name: 'Location 8' },
    { position: [38.96167, -119.9401], name: 'Location 9' },
    { position: [38.9621, -119.9413], name: 'End' },
  ];
  const customIcon = L.icon({
  iconUrl: MarkerPNG,
  iconSize: [50, 50]
});

  function handleMapClick(e) {
    setPosition(e.latlng);
  }

  console.log(locations)

  return (
    <>
    <Link to='/' className="nav-links">
        <button className="submit gal"> View Score Card</button>
    </Link>
    <MapContainer center={positions} zoom={17.45} style={{ height: "90vh", marginTop: "2vh"}} onClick={handleMapClick}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((location, index) => (
        <Marker position={location.position} key={index} icon={customIcon}>
          <Popup>{location.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
    </>
  );
}
