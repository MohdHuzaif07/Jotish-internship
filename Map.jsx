import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Updated with Country Names
const cityData = [
  { city: 'San Francisco', country: 'USA', coords: [37.7749, -122.4194] },
  { city: 'London', country: 'United Kingdom', coords: [51.5074, -0.1278] },
  { city: 'Tokyo', country: 'Japan', coords: [35.6762, 139.6503] },
  { city: 'Chennai', country: 'India', coords: [13.0827, 80.2707] }
];

function Map() {
  return (
    <div className="group relative">
      <div className="h-80 w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
        <MapContainer 
          center={[20, 10]} 
          zoom={2} 
          scrollWheelZoom={false} 
          className="h-full w-full z-0 [filter:hue-rotate(110deg)_saturate(0.6)_brightness(1.1)]"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          
          {cityData.map((loc) => (
            <CircleMarker 
              key={loc.city}
              center={loc.coords} 
              radius={10}
              pathOptions={{ 
                fillColor: '#d4af37', // GOLD
                color: '#065f46',     // EMERALD
                weight: 2,
                fillOpacity: 0.9 
              }}
            >
              {/* This Tooltip makes the Country/City name visible immediately */}
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                <div className="text-[10px] font-bold text-emerald-900 leading-tight">
                  {loc.city}, <span className="text-emerald-600">{loc.country}</span>
                </div>
              </Tooltip>

              <Popup>
                <div className="text-center p-1">
                  <p className="font-black text-emerald-900 text-sm">{loc.city}</p>
                  <p className="text-[10px] text-emerald-600 uppercase font-bold">{loc.country}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      
      {/* Legend / Status Badge */}
      <div className="absolute bottom-4 right-4 bg-emerald-900/80 backdrop-blur-md px-4 py-2 rounded-2xl z-[1000] border border-white/20">
        <p className="text-[10px] font-bold text-white uppercase tracking-widest">Global Coverage</p>
        <p className="text-[9px] text-emerald-200">4 Regions Identified</p>
      </div>
    </div>
  );
}

export default Map;