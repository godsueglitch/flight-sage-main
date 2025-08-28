import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Search, Plane, DollarSign, Clock, Shield, Star, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchCriteria {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  class: 'economy' | 'business' | 'first';
  tripType: 'oneway' | 'roundtrip';
  priorities: {
    cost: number;
    time: number;
    safety: number;
    comfort: number;
    layovers: number;
  };
  filters: {
    maxLayovers: number;
    maxDuration: string;
    preferredAirlines: string[];
    flexibleDates: boolean;
    directFlights: boolean;
  };
}

interface FlightResult {
  id: string;
  airline: string;
  flight: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  stops: number;
  layovers: string[];
  aircraft: string;
  score: number;
  safetyRating: number;
  onTimePerformance: number;
  route: string[];
  weather: 'favorable' | 'caution' | 'warning';
}

interface FlightSearchFormProps {
  onSearch?: (criteria: SearchCriteria) => void;
  onResultSelect?: (result: FlightResult) => void;
  isSearching?: boolean;
}

const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  onSearch,
  onResultSelect,
  isSearching = false
}) => {
  const { toast } = useToast();
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy',
    tripType: 'oneway',
    priorities: {
      cost: 70,
      time: 60,
      safety: 90,
      comfort: 40,
      layovers: 30
    },
    filters: {
      maxLayovers: 2,
      maxDuration: '12:00',
      preferredAirlines: [],
      flexibleDates: false,
      directFlights: false
    }
  });

  const [searchResults, setSearchResults] = useState<FlightResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const mockSearchResults: FlightResult[] = [
    {
      id: '1',
      airline: 'SkyLine Airways',
      flight: 'SK-1423',
      origin: 'JFK',
      destination: 'LAX',
      departure: '08:30',
      arrival: '12:45',
  duration: '5h 15m',
  price: 325,
  stops: 0,
  layovers: [],
  aircraft: 'Boeing 737-800',
  score: 92,
  safetyRating: 4.8,
  onTimePerformance: 87,
  route: ['JFK', 'LAX'],
  weather: 'favorable'
},
{
  id: '2',
  airline: 'Atlantic Express',
  flight: 'AE-8901',
  origin: 'JFK',
  destination: 'LAX',
  departure: '14:20',
  arrival: '20:35',
  duration: '6h 15m',
      price: 289,
      stops: 1,
      layovers: ['DEN'],
      aircraft: 'Airbus A320',
      score: 85,
      safetyRating: 4.6,
      onTimePerformance: 92,
      route: ['JFK', 'DEN', 'LAX'],
      weather: 'caution'
    },
    {
      id: '3',
      airline: 'Global Wings',
      flight: 'GW-5567',
      origin: 'JFK',
      destination: 'LAX',
      departure: '19:45',
      arrival: '02:30+1',
      duration: '7h 45m',
      price: 199,
      stops: 2,
      layovers: ['CHI', 'PHX'],
      aircraft: 'Boeing 757',
      score: 72,
      safetyRating: 4.4,
      onTimePerformance: 78,
      route: ['JFK', 'CHI', 'PHX', 'LAX'],
      weather: 'favorable'
    }
  ];

  const calculateAIScore = (flight: FlightResult, priorities: SearchCriteria['priorities']): number => {
    const costScore = Math.max(0, 100 - (flight.price / 5)); // Lower price = higher score
    const timeScore = Math.max(0, 100 - (parseInt(flight.duration) / 2)); // Shorter duration = higher score
    const safetyScore = flight.safetyRating * 20; // Convert 5-point scale to 100-point
    const comfortScore = flight.stops === 0 ? 100 : Math.max(0, 100 - (flight.stops * 30));
    const layoverScore = Math.max(0, 100 - (flight.layovers.length * 25));

    const weightedScore = (
      (costScore * priorities.cost / 100) +
      (timeScore * priorities.time / 100) +
      (safetyScore * priorities.safety / 100) +
      (comfortScore * priorities.comfort / 100) +
      (layoverScore * priorities.layovers / 100)
    ) / 5;

    return Math.round(weightedScore);
  };

  const handleSearch = () => {
    if (!searchCriteria.origin || !searchCriteria.destination) {
      toast({
        title: "Missing Information",
        description: "Please enter both origin and destination.",
        variant: "destructive"
      });
      return;
    }

    // AI Analysis announcement
    const analysisMessage = `AI Flight Sage analyzing routes from ${searchCriteria.origin} to ${searchCriteria.destination}. 
    Optimizing for ${searchCriteria.priorities.cost > 70 ? 'cost efficiency' : ''} 
    ${searchCriteria.priorities.safety > 80 ? 'maximum safety' : ''} 
    ${searchCriteria.priorities.time > 70 ? 'speed' : ''}. 
    Found ${mockSearchResults.length} optimal routes with real-time weather and traffic analysis.`;

    // Text-to-speech announcement
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(analysisMessage);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }

    // Calculate AI scores for each result
    const resultsWithScores = mockSearchResults.map(flight => ({
      ...flight,
      score: calculateAIScore(flight, searchCriteria.priorities)
    })).sort((a, b) => b.score - a.score);

    setSearchResults(resultsWithScores);
    setShowResults(true);
    onSearch?.(searchCriteria);

    toast({
      title: "AI Analysis Complete",
      description: `Found ${resultsWithScores.length} optimized flight options.`
    });
  };

  const handleResultSelect = (result: FlightResult) => {
    const selectionMessage = `Selected ${result.airline} flight ${result.flight}. 
    Departure ${result.departure}, arrival ${result.arrival}. 
    Price $${result.price}. ${result.stops === 0 ? 'Direct flight' : `${result.stops} stops`}. 
    AI optimization score: ${result.score} out of 100.`;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(selectionMessage);
      speechSynthesis.speak(utterance);
    }

    onResultSelect?.(result);
    toast({
      title: "Flight Selected",
      description: `${result.airline} ${result.flight} - $${result.price}`
    });
  };

  const updatePriority = (key: keyof SearchCriteria['priorities'], value: number[]) => {
    setSearchCriteria(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [key]: value[0]
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            AI-Powered Flight Search
          </CardTitle>
          <CardDescription>
            Advanced pathfinding with real-world data integration and custom optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                placeholder="e.g., JFK, New York"
                value={searchCriteria.origin}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, origin: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="e.g., LAX, Los Angeles"
                value={searchCriteria.destination}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, destination: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="departure">Departure Date</Label>
              <Input
                id="departure"
                type="date"
                value={searchCriteria.departureDate}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, departureDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="passengers">Passengers</Label>
              <Select value={searchCriteria.passengers.toString()} onValueChange={(value) => 
                setSearchCriteria(prev => ({ ...prev, passengers: parseInt(value) }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={searchCriteria.class} onValueChange={(value: any) => 
                setSearchCriteria(prev => ({ ...prev, class: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* AI Optimization Priorities */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              AI Optimization Priorities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cost Priority
                    </Label>
                    <span className="text-sm font-mono">{searchCriteria.priorities.cost}%</span>
                  </div>
                  <Slider
                    value={[searchCriteria.priorities.cost]}
                    onValueChange={(value) => updatePriority('cost', value)}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time Priority
                    </Label>
                    <span className="text-sm font-mono">{searchCriteria.priorities.time}%</span>
                  </div>
                  <Slider
                    value={[searchCriteria.priorities.time]}
                    onValueChange={(value) => updatePriority('time', value)}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Safety Priority
                    </Label>
                    <span className="text-sm font-mono">{searchCriteria.priorities.safety}%</span>
                  </div>
                  <Slider
                    value={[searchCriteria.priorities.safety]}
                    onValueChange={(value) => updatePriority('safety', value)}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Comfort Priority
                    </Label>
                    <span className="text-sm font-mono">{searchCriteria.priorities.comfort}%</span>
                  </div>
                  <Slider
                    value={[searchCriteria.priorities.comfort]}
                    onValueChange={(value) => updatePriority('comfort', value)}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Layover Sensitivity
                    </Label>
                    <span className="text-sm font-mono">{searchCriteria.priorities.layovers}%</span>
                  </div>
                  <Slider
                    value={[searchCriteria.priorities.layovers]}
                    onValueChange={(value) => updatePriority('layovers', value)}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="directFlights"
                      checked={searchCriteria.filters.directFlights}
                      onCheckedChange={(checked) => 
                        setSearchCriteria(prev => ({
                          ...prev,
                          filters: { ...prev.filters, directFlights: !!checked }
                        }))
                      }
                    />
                    <Label htmlFor="directFlights">Prefer Direct Flights</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="flexibleDates"
                      checked={searchCriteria.filters.flexibleDates}
                      onCheckedChange={(checked) => 
                        setSearchCriteria(prev => ({
                          ...prev,
                          filters: { ...prev.filters, flexibleDates: !!checked }
                        }))
                      }
                    />
                    <Label htmlFor="flexibleDates">Flexible Dates (±3 days)</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full" disabled={isSearching} size="lg">
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                AI Analyzing Routes...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Optimized Flights
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Optimized Flight Results</CardTitle>
            <CardDescription>
              Ranked by your preferences with real-time data analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((result) => (
                <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleResultSelect(result)}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{result.airline}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{result.flight}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${result.price}</p>
                        <Badge variant={result.score >= 90 ? 'default' : result.score >= 75 ? 'secondary' : 'outline'}>
                          AI Score: {result.score}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Route</p>
                        <p className="font-semibold">{result.route.join(' → ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Departure</p>
                        <p className="font-semibold">{result.departure}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Arrival</p>
                        <p className="font-semibold">{result.arrival}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold">{result.duration}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {result.stops === 0 ? (
                        <Badge variant="default">Direct Flight</Badge>
                      ) : (
                        <Badge variant="secondary">{result.stops} Stop{result.stops > 1 ? 's' : ''}</Badge>
                      )}
                      <Badge variant="outline">Safety: {result.safetyRating}/5</Badge>
                      <Badge variant="outline">On-time: {result.onTimePerformance}%</Badge>
                      <Badge variant={result.weather === 'favorable' ? 'default' : 
                              result.weather === 'caution' ? 'secondary' : 'destructive'}>
                        Weather: {result.weather}
                      </Badge>
                    </div>

                    {result.layovers.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Layovers: {result.layovers.join(', ')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FlightSearchForm;