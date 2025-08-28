import React, { useState, useEffect } from 'react';
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
  Satellite
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  accuracy: number;
  timestamp: Date;
}

interface NearbyAirport {
  id: string;
  name: string;
  code: string;
  distance: number;
  bearing: number;
  type: 'major' | 'regional' | 'airstrip';
  frequencies: {
    tower?: string;
    ground?: string;
    approach?: string;
  };
  runways: Array<{
    number: string;
    length: number;
    surface: string;
  }>;
}

interface NavigationAid {
  id: string;
  name: string;
  type: 'VOR' | 'NDB' | 'ILS' | 'GPS';
  frequency: string;
  distance: number;
  bearing: number;
}

interface LocationTrackerProps {
  onLocationUpdate?: (location: LocationData) => void;
  onNearbyAirportsFound?: (airports: NearbyAirport[]) => void;
  showNavigationAids?: boolean;
  autoUpdate?: boolean;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({
  onLocationUpdate,
  onNearbyAirportsFound,
  showNavigationAids = true,
  autoUpdate = true
}) => {
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [nearbyAirports, setNearbyAirports] = useState<NearbyAirport[]>([]);
  const [navigationAids, setNavigationAids] = useState<NavigationAid[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      toast({
        title: "GPS Not Supported",
        description: "Your browser doesn't support GPS tracking.",
        variant: "destructive"
      });
      return;
    }

    setIsTracking(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    const success = (position: GeolocationPosition) => {
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        accuracy: position.coords.accuracy,
        timestamp: new Date()
      };

      setLocation(locationData);
      onLocationUpdate?.(locationData);
      
      // Find nearby airports and navigation aids
      findNearbyAirports(locationData);
      if (showNavigationAids) {
        findNavigationAids(locationData);
      }

      // Voice announcement
      announceLocation(locationData);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      let errorMessage = 'Unknown location error';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }

      setError(errorMessage);
      setIsTracking(false);
      
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive"
      });
    };

    if (autoUpdate) {
      const id = navigator.geolocation.watchPosition(success, errorCallback, options);
      setWatchId(id);
    } else {
      navigator.geolocation.getCurrentPosition(success, errorCallback, options);
    }
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  const findNearbyAirports = (currentLocation: LocationData) => {
    // Mock nearby airports data (in production, use aviation database APIs)
    const mockAirports: NearbyAirport[] = [
      {
        id: '1',
        name: 'John F. Kennedy International Airport',
        code: 'KJFK',
        distance: calculateDistance(currentLocation.latitude, currentLocation.longitude, 40.6413, -73.7781),
        bearing: calculateBearing(currentLocation.latitude, currentLocation.longitude, 40.6413, -73.7781),
        type: 'major',
        frequencies: {
          tower: '119.1',
          ground: '121.9',
          approach: '125.25'
        },
        runways: [
          { number: '04L/22R', length: 3682, surface: 'Asphalt' },
          { number: '04R/22L', length: 2560, surface: 'Asphalt' }
        ]
      },
      {
        id: '2',
        name: 'La Guardia Airport',
        code: 'KLGA',
        distance: calculateDistance(currentLocation.latitude, currentLocation.longitude, 40.7769, -73.8740),
        bearing: calculateBearing(currentLocation.latitude, currentLocation.longitude, 40.7769, -73.8740),
        type: 'major',
        frequencies: {
          tower: '118.7',
          ground: '121.7'
        },
        runways: [
          { number: '04/22', length: 2134, surface: 'Asphalt' }
        ]
      },
      {
        id: '3',
        name: 'Westchester County Airport',
        code: 'KHPN',
        distance: calculateDistance(currentLocation.latitude, currentLocation.longitude, 41.0670, -73.7076),
        bearing: calculateBearing(currentLocation.latitude, currentLocation.longitude, 41.0670, -73.7076),
        type: 'regional',
        frequencies: {
          tower: '119.4'
        },
        runways: [
          { number: '16/34', length: 1676, surface: 'Asphalt' }
        ]
      }
    ];

    // Sort by distance and take closest 5
    const sortedAirports = mockAirports
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    setNearbyAirports(sortedAirports);
    onNearbyAirportsFound?.(sortedAirports);
  };

  const findNavigationAids = (currentLocation: LocationData) => {
    // Mock navigation aids data
    const mockNavAids: NavigationAid[] = [
      {
        id: '1',
        name: 'Kennedy VOR',
        type: 'VOR',
        frequency: '115.9',
        distance: calculateDistance(currentLocation.latitude, currentLocation.longitude, 40.6413, -73.7781),
        bearing: calculateBearing(currentLocation.latitude, currentLocation.longitude, 40.6413, -73.7781)
      },
      {
        id: '2',
        name: 'LaGuardia ILS',
        type: 'ILS',
        frequency: '111.1',
        distance: calculateDistance(currentLocation.latitude, currentLocation.longitude, 40.7769, -73.8740),
        bearing: calculateBearing(currentLocation.latitude, currentLocation.longitude, 40.7769, -73.8740)
      }
    ];

    setNavigationAids(mockNavAids.sort((a, b) => a.distance - b.distance));
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  const formatCoordinates = (lat: number, lon: number): string => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    const latDeg = Math.floor(Math.abs(lat));
    const latMin = ((Math.abs(lat) - latDeg) * 60).toFixed(3);
    const lonDeg = Math.floor(Math.abs(lon));
    const lonMin = ((Math.abs(lon) - lonDeg) * 60).toFixed(3);
    
    return `${latDeg}°${latMin}'${latDir} ${lonDeg}°${lonMin}'${lonDir}`;
  };

  const announceLocation = (locationData: LocationData) => {
    if ('speechSynthesis' in window) {
      const coordinates = formatCoordinates(locationData.latitude, locationData.longitude);
      const announcement = `GPS position acquired. Current location: ${coordinates}. 
        ${locationData.altitude ? `Altitude: ${Math.round(locationData.altitude)} meters. ` : ''}
        ${nearbyAirports.length > 0 ? `Nearest airport: ${nearbyAirports[0].name} at ${nearbyAirports[0].distance.toFixed(1)} kilometers.` : ''}`;

      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const getAccuracyStatus = (accuracy: number): { text: string; variant: any } => {
    if (accuracy <= 5) return { text: 'High Precision', variant: 'default' };
    if (accuracy <= 20) return { text: 'Good Accuracy', variant: 'secondary' };
    if (accuracy <= 100) return { text: 'Fair Accuracy', variant: 'outline' };
    return { text: 'Low Accuracy', variant: 'destructive' };
  };

  useEffect(() => {
    // Auto-start tracking if autoUpdate is enabled
    if (autoUpdate) {
      startTracking();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-primary" />
            GPS Location Tracker
          </CardTitle>
          <CardDescription>
            Real-time positioning with nearby aviation facilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={isTracking ? stopTracking : startTracking}
                variant={isTracking ? "destructive" : "default"}
                className="flex-1"
              >
                {isTracking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Stop Tracking
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Start GPS Tracking
                  </>
                )}
              </Button>
              
              {location && (
                <Button 
                  variant="outline" 
                  onClick={() => announceLocation(location)}
                  size="icon"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Location Display */}
            {location && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-semibold">Current Position</span>
                      </div>
                      <p className="text-sm font-mono">
                        {formatCoordinates(location.latitude, location.longitude)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Decimal: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        {location.altitude && (
                          <div className="flex justify-between">
                            <span className="text-sm">Altitude:</span>
                            <span className="text-sm font-semibold">{Math.round(location.altitude)} m</span>
                          </div>
                        )}
                        {location.speed && (
                          <div className="flex justify-between">
                            <span className="text-sm">Speed:</span>
                            <span className="text-sm font-semibold">{(location.speed * 3.6).toFixed(1)} km/h</span>
                          </div>
                        )}
                        {location.heading && (
                          <div className="flex justify-between">
                            <span className="text-sm">Heading:</span>
                            <span className="text-sm font-semibold">{Math.round(location.heading)}°</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Accuracy:</span>
                          <Badge variant={getAccuracyStatus(location.accuracy).variant}>
                            ±{Math.round(location.accuracy)}m
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Last update: {location.timestamp.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nearby Airports */}
      {nearbyAirports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              Nearby Airports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearbyAirports.map((airport) => (
                <Card key={airport.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{airport.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{airport.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{airport.distance.toFixed(1)} km</p>
                        <p className="text-xs text-muted-foreground">{Math.round(airport.bearing)}° bearing</p>
                      </div>
                    </div>
                    
                    <Badge variant={airport.type === 'major' ? 'default' : 'secondary'} className="mb-2">
                      {airport.type}
                    </Badge>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-semibold mb-1">Frequencies:</p>
                        {airport.frequencies.tower && (
                          <p>Tower: {airport.frequencies.tower}</p>
                        )}
                        {airport.frequencies.ground && (
                          <p>Ground: {airport.frequencies.ground}</p>
                        )}
                        {airport.frequencies.approach && (
                          <p>Approach: {airport.frequencies.approach}</p>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Runways:</p>
                        {airport.runways.slice(0, 2).map((runway, idx) => (
                          <p key={idx}>{runway.number}: {runway.length}m</p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Aids */}
      {showNavigationAids && navigationAids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" />
              Navigation Aids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {navigationAids.map((aid) => (
                <div key={aid.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-semibold text-sm">{aid.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">{aid.type}</Badge>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-mono">{aid.frequency}</p>
                    <p className="text-xs text-muted-foreground">
                      {aid.distance.toFixed(1)}km @ {Math.round(aid.bearing)}°
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationTracker;