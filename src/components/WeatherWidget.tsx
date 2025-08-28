import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Eye, 
  Thermometer, 
  AlertTriangle,
  Plane,
  RefreshCw,
  Volume2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  pressure: number;
  cloudCover: number;
  conditions: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';
  flightSafety: 'excellent' | 'good' | 'caution' | 'poor' | 'dangerous';
  alerts: string[];
  timestamp: Date;
}

interface FlightConditions {
  visibility: 'excellent' | 'good' | 'limited' | 'poor';
  turbulence: 'none' | 'light' | 'moderate' | 'severe';
  icing: 'none' | 'light' | 'moderate' | 'severe';
  recommendation: string;
}

interface WeatherWidgetProps {
  location?: string;
  autoUpdate?: boolean;
  showFlightAnalysis?: boolean;
  onWeatherUpdate?: (weather: WeatherData) => void;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  location: initialLocation,
  autoUpdate = true,
  showFlightAnalysis = true,
  onWeatherUpdate
}) => {
  const { toast } = useToast();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [flightConditions, setFlightConditions] = useState<FlightConditions | null>(null);
  const [location, setLocation] = useState(initialLocation || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Get user's location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter a city name.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Please enter a city name manually.",
        variant: "destructive"
      });
    }
  };

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock API call - in production, use real weather API like OpenWeatherMap
      const mockWeatherData = generateMockWeather(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWeather(mockWeatherData);
      setFlightConditions(analyzeFlightConditions(mockWeatherData));
      setLastUpdate(new Date());
      onWeatherUpdate?.(mockWeatherData);

      // Voice announcement
      announceWeather(mockWeatherData);

    } catch (err) {
      setError('Failed to fetch weather data');
      toast({
        title: "Weather Error",
        description: "Unable to fetch weather data. Using mock data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch weather by location name
  const fetchWeatherByLocation = async (locationName: string) => {
    if (!locationName.trim()) {
      toast({
        title: "Invalid Location",
        description: "Please enter a valid location name.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock API call - in production, use real weather API
      const mockWeatherData = generateMockWeather(locationName);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWeather(mockWeatherData);
      setFlightConditions(analyzeFlightConditions(mockWeatherData));
      setLastUpdate(new Date());
      onWeatherUpdate?.(mockWeatherData);

      // Voice announcement
      announceWeather(mockWeatherData);

    } catch (err) {
      setError('Failed to fetch weather data');
      toast({
        title: "Weather Error",
        description: "Unable to fetch weather data for " + locationName,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock weather data (replace with real API in production)
  const generateMockWeather = (locationName: string): WeatherData => {
    const conditions = ['clear', 'cloudy', 'rainy', 'stormy', 'foggy'] as const;
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    const temperature = Math.floor(Math.random() * 40) - 5; // -5 to 35°C
    const windSpeed = Math.floor(Math.random() * 50); // 0-50 km/h
    const visibility = Math.floor(Math.random() * 20) + 1; // 1-20 km
    
    const alerts: string[] = [];
    let flightSafety: WeatherData['flightSafety'] = 'excellent';
    
    if (randomCondition === 'stormy') {
      alerts.push('Thunderstorm Warning');
      flightSafety = 'dangerous';
    } else if (randomCondition === 'foggy' || visibility < 5) {
      alerts.push('Low Visibility Warning');
      flightSafety = 'poor';
    } else if (windSpeed > 30) {
      alerts.push('High Wind Warning');
      flightSafety = 'caution';
    } else if (randomCondition === 'rainy') {
      flightSafety = 'good';
    }

    return {
      location: locationName,
      temperature,
      description: getWeatherDescription(randomCondition),
      humidity: Math.floor(Math.random() * 80) + 20,
      windSpeed,
      windDirection: Math.floor(Math.random() * 360),
      visibility,
      pressure: Math.floor(Math.random() * 100) + 950,
      cloudCover: Math.floor(Math.random() * 100),
      conditions: randomCondition,
      flightSafety,
      alerts,
      timestamp: new Date()
    };
  };

  const getWeatherDescription = (condition: string): string => {
    const descriptions = {
      clear: 'Clear skies',
      cloudy: 'Partly cloudy',
      rainy: 'Light rain',
      stormy: 'Thunderstorms',
      foggy: 'Foggy conditions'
    };
    return descriptions[condition as keyof typeof descriptions] || 'Unknown';
  };

  const analyzeFlightConditions = (weather: WeatherData): FlightConditions => {
    let visibility: FlightConditions['visibility'] = 'excellent';
    let turbulence: FlightConditions['turbulence'] = 'none';
    let icing: FlightConditions['icing'] = 'none';
    
    // Analyze visibility
    if (weather.visibility < 3) visibility = 'poor';
    else if (weather.visibility < 8) visibility = 'limited';
    else if (weather.visibility < 15) visibility = 'good';
    
    // Analyze turbulence
    if (weather.windSpeed > 40) turbulence = 'severe';
    else if (weather.windSpeed > 25) turbulence = 'moderate';
    else if (weather.windSpeed > 15) turbulence = 'light';
    
    // Analyze icing conditions
    if (weather.temperature < 0 && weather.humidity > 80) {
      icing = weather.temperature < -10 ? 'severe' : 'moderate';
    } else if (weather.temperature < 5 && weather.humidity > 90) {
      icing = 'light';
    }

    let recommendation = '';
    if (weather.flightSafety === 'dangerous') {
      recommendation = 'Flight operations not recommended. Wait for conditions to improve.';
    } else if (weather.flightSafety === 'poor') {
      recommendation = 'Only experienced pilots should fly. Use caution.';
    } else if (weather.flightSafety === 'caution') {
      recommendation = 'Flight possible with extra precautions. Monitor conditions closely.';
    } else {
      recommendation = 'Good conditions for flight operations.';
    }

    return { visibility, turbulence, icing, recommendation };
  };

  const announceWeather = (weatherData: WeatherData) => {
    if ('speechSynthesis' in window) {
      const announcement = `Weather update for ${weatherData.location}. 
        Temperature ${weatherData.temperature} degrees celsius. 
        ${weatherData.description}. 
        Wind ${weatherData.windSpeed} kilometers per hour. 
        Visibility ${weatherData.visibility} kilometers. 
        Flight safety assessment: ${weatherData.flightSafety}.
        ${weatherData.alerts.length > 0 ? 'Weather alerts: ' + weatherData.alerts.join(', ') : ''}`;

      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const getWeatherIcon = (conditions: string) => {
    switch (conditions) {
      case 'clear': return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'stormy': return <CloudRain className="h-8 w-8 text-purple-500" />;
      case 'foggy': return <Cloud className="h-8 w-8 text-gray-400" />;
      default: return <Sun className="h-8 w-8" />;
    }
  };

  const getSafetyBadgeVariant = (safety: string) => {
    switch (safety) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'caution': return 'outline';
      case 'poor': return 'destructive';
      case 'dangerous': return 'destructive';
      default: return 'outline';
    }
  };

  // Auto-update effect
  useEffect(() => {
    if (autoUpdate && weather) {
      const interval = setInterval(() => {
        if (location) {
          fetchWeatherByLocation(location);
        }
      }, 300000); // Update every 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoUpdate, weather, location]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Real-Time Weather
          </CardTitle>
          <CardDescription>
            Live weather conditions with flight safety analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Location Input */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="location-input">Location</Label>
                <Input
                  id="location-input"
                  placeholder="Enter city or airport code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchWeatherByLocation(location);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => fetchWeatherByLocation(location)}
                  disabled={isLoading}
                  className="mt-6"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Get Weather'
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="flex-1"
              >
                Use Current Location
              </Button>
              {weather && (
                <Button 
                  variant="outline" 
                  onClick={() => announceWeather(weather)}
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

            {/* Weather Display */}
            {weather && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(weather.conditions)}
                    <div>
                      <h3 className="font-semibold text-lg">{weather.location}</h3>
                      <p className="text-sm text-muted-foreground">{weather.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{weather.temperature}°C</p>
                    <Badge variant={getSafetyBadgeVariant(weather.flightSafety)}>
                      {weather.flightSafety} conditions
                    </Badge>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Wind className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-semibold">{weather.windSpeed} km/h</p>
                    <p className="text-xs text-muted-foreground">Wind Speed</p>
                  </div>
                  <div className="text-center">
                    <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-semibold">{weather.visibility} km</p>
                    <p className="text-xs text-muted-foreground">Visibility</p>
                  </div>
                  <div className="text-center">
                    <Thermometer className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-semibold">{weather.humidity}%</p>
                    <p className="text-xs text-muted-foreground">Humidity</p>
                  </div>
                  <div className="text-center">
                    <Cloud className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-semibold">{weather.pressure} hPa</p>
                    <p className="text-xs text-muted-foreground">Pressure</p>
                  </div>
                </div>

                {/* Alerts */}
                {weather.alerts.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Weather Alerts:</strong> {weather.alerts.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Flight Analysis */}
                {showFlightAnalysis && flightConditions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Plane className="h-4 w-4" />
                        Flight Conditions Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {flightConditions.visibility}
                            </Badge>
                            <p className="text-xs text-muted-foreground">Visibility</p>
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {flightConditions.turbulence}
                            </Badge>
                            <p className="text-xs text-muted-foreground">Turbulence</p>
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {flightConditions.icing}
                            </Badge>
                            <p className="text-xs text-muted-foreground">Icing Risk</p>
                          </div>
                        </div>
                        
                        <Alert>
                          <Plane className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Recommendation:</strong> {flightConditions.recommendation}
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {lastUpdate && (
                  <p className="text-xs text-muted-foreground text-center">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherWidget;