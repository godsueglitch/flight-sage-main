import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Navigation, 
  Plane, 
  Radar, 
  Compass,
  RefreshCw,
  Volume2,
  AlertTriangle,
  Satellite,
  Map as MapIcon,
  Route,
  Building,
  Radio
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Airport {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  type: 'major' | 'regional' | 'airstrip';
  facilities: string[];
}

interface FlightPath {
  id: string;
  origin: [number, number];
  destination: [number, number];
  waypoints: [number, number][];
  distance: number;
  estimatedTime: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  weather: 'clear' | 'cloudy' | 'stormy';
}

interface FlightMapProps {
  currentLocation?: [number, number];
  destination?: [number, number];
  showWeather?: boolean;
  onAirportSelect?: (airport: Airport) => void;
  onRouteCalculated?: (route: FlightPath) => void;
}

const FlightMap: React.FC<FlightMapProps> = ({
  currentLocation,
  destination,
  showWeather = true,
  onAirportSelect,
  onRouteCalculated
}) => {
  const { toast } = useToast();
  const [airports] = useState<Airport[]>([
    {
      id: '1',
      name: 'John F. Kennedy International Airport',
      code: 'JFK',
      lat: 40.6413,
      lng: -73.7781,
      type: 'major',
      facilities: ['Control Tower', 'Radar', 'ILS', 'Emergency Services']
    },
    {
      id: '2',
      name: 'Los Angeles International Airport',
      code: 'LAX',
      lat: 34.0522,
      lng: -118.2437,
      type: 'major',
      facilities: ['Control Tower', 'Radar', 'ILS', 'Emergency Services', 'Weather Station']
    },
    {
      id: '3',
      name: 'Chicago O\'Hare International Airport',
      code: 'ORD',
      lat: 41.9742,
      lng: -87.9073,
      type: 'major',
      facilities: ['Control Tower', 'Radar', 'ILS', 'Emergency Services']
    }
  ]);

  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [routeInfo, setRouteInfo] = useState<FlightPath | null>(null);

  const calculateRoute = () => {
    if (currentLocation && destination) {
      const distance = calculateDistance(currentLocation, destination);
      const route: FlightPath = {
        id: 'route-1',
        origin: currentLocation,
        destination: destination,
        waypoints: [
          [currentLocation[0] + 0.5, currentLocation[1] - 0.5],
          [destination[0] - 0.5, destination[1] + 0.5]
        ],
        distance,
        estimatedTime: Math.round(distance / 800 * 60) + 'm', // Rough calculation
        difficulty: distance > 1000 ? 'challenging' : distance > 500 ? 'moderate' : 'easy',
        weather: 'clear'
      };
      
      setRouteInfo(route);
      onRouteCalculated?.(route);
      
      toast({
        title: "Route Calculated",
        description: `${distance.toFixed(0)} km route planned successfully`
      });
    }
  };

  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatCoordinates = (coords: [number, number]) => {
    return `${coords[0].toFixed(4)}°, ${coords[1].toFixed(4)}°`;
  };

  return (
    <div className="space-y-6">
      {/* Map Visualization */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-primary" />
            Flight Navigation Map
          </CardTitle>
          <CardDescription>
            Interactive aviation map with real-time flight paths and weather
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-950 dark:to-sky-950 rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-800">
            
            {/* Map Grid */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Radar Sweep Animation */}
            <div className="absolute top-4 right-4 w-16 h-16 border-2 border-green-400 rounded-full flex items-center justify-center bg-green-50 dark:bg-green-950">
              <div className="w-8 h-8 relative">
                <div className="absolute inset-0 border-2 border-green-500 rounded-full radar-sweep opacity-60"></div>
                <Radar className="h-6 w-6 text-green-600 absolute top-1 left-1" />
              </div>
            </div>

            {/* Current Location */}
            {currentLocation && (
              <div className="absolute animate-pulse" style={{
                top: '40%',
                left: '30%',
                transform: 'translate(-50%, -50%)'
              }}>
                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg pulse-glow"></div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-blue-600 whitespace-nowrap">
                  Current Location
                </div>
              </div>
            )}

            {/* Destination */}
            {destination && (
              <div className="absolute" style={{
                top: '30%',
                left: '70%',
                transform: 'translate(-50%, -50%)'
              }}>
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-red-600 whitespace-nowrap">
                  Destination
                </div>
              </div>
            )}

            {/* Airports */}
            {airports.slice(0, 3).map((airport, index) => (
              <div 
                key={airport.id}
                className="absolute cursor-pointer group"
                style={{
                  top: `${20 + index * 25}%`,
                  left: `${20 + index * 30}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => {
                  setSelectedAirport(airport);
                  onAirportSelect?.(airport);
                }}
              >
                <div className="relative">
                  <Plane className="h-6 w-6 text-indigo-600 hover:text-indigo-800 transition-colors airplane-float" />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-indigo-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {airport.code}
                  </div>
                </div>
              </div>
            ))}

            {/* Flight Path */}
            {currentLocation && destination && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d={`M ${30}% ${40}% Q ${50}% ${20}% ${70}% ${30}%`}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="10,5"
                  className="animate-pulse"
                />
                <circle cx="30%" cy="40%" r="3" fill="#3b82f6" />
                <circle cx="70%" cy="30%" r="3" fill="#ef4444" />
              </svg>
            )}

            {/* Weather Indicators */}
            {showWeather && (
              <div className="absolute top-4 left-4 space-y-2">
                <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80">
                  🌤️ Clear Skies
                </Badge>
                <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80">
                  🌬️ Wind: 15 kt
                </Badge>
              </div>
            )}

            {/* Map Controls */}
            <div className="absolute bottom-4 left-4 space-x-2">
              <Button size="sm" variant="outline" onClick={calculateRoute}>
                <Route className="h-4 w-4 mr-2" />
                Calculate Route
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Information */}
      {routeInfo && (
        <Card className="fly-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Calculated Flight Route
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{routeInfo.distance.toFixed(0)} km</p>
                <p className="text-sm text-muted-foreground">Total Distance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{routeInfo.estimatedTime}</p>
                <p className="text-sm text-muted-foreground">Flight Time</p>
              </div>
              <div className="text-center">
                <Badge variant={routeInfo.difficulty === 'easy' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                  {routeInfo.difficulty}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Difficulty</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Airport Info */}
      {selectedAirport && (
        <Card className="fly-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              {selectedAirport.name}
            </CardTitle>
            <CardDescription>Airport Information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Airport Code:</span>
                <Badge variant="outline" className="font-mono">{selectedAirport.code}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Type:</span>
                <Badge variant={selectedAirport.type === 'major' ? 'default' : 'secondary'}>
                  {selectedAirport.type}
                </Badge>
              </div>
              <div>
                <span className="font-semibold">Facilities:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAirport.facilities.map((facility, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Coordinates:</span>
                <span className="font-mono text-sm">{formatCoordinates([selectedAirport.lat, selectedAirport.lng])}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              Navigation Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="h-4 w-4 mr-2" />
              Set Waypoint
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Route className="h-4 w-4 mr-2" />
              Plan Alternative Route
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Satellite className="h-4 w-4 mr-2" />
              GPS Calibration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-2 border rounded">
              <span className="text-sm">ATC Tower:</span>
              <Badge variant="outline" className="font-mono">121.5</Badge>
            </div>
            <div className="flex justify-between items-center p-2 border rounded">
              <span className="text-sm">Approach:</span>
              <Badge variant="outline" className="font-mono">125.25</Badge>
            </div>
            <div className="flex justify-between items-center p-2 border rounded">
              <span className="text-sm">Emergency:</span>
              <Badge variant="destructive" className="font-mono">121.5</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlightMap;