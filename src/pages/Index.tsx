import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plane, 
  Navigation, 
  CloudRain, 
  MapPin, 
  Mic, 
  Search,
  Compass,
  Radio,
  Gauge,
  Zap,
  Shield,
  Globe,
  Headphones,
  Sparkles
} from 'lucide-react';
import FlightSearchForm from '@/components/FlightSearchForm';
import VoiceInterface from '@/components/VoiceInterface';
import WeatherWidget from '@/components/WeatherWidget';
import LocationTracker from '@/components/LocationTracker';
import FlightMap from '@/components/FlightMap';
import heroAirplane from '@/assets/hero-airplane.jpg';
import aviationBg from '@/assets/aviation-bg.jpg';

const Index = () => {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | undefined>();
  const [selectedDestination, setSelectedDestination] = useState<[number, number] | undefined>();
  const [activeTab, setActiveTab] = useState('search');

  // Handle voice commands
  const handleVoiceCommand = (command: any) => {
    console.log('Voice command received:', command);
    
    // Auto-switch tabs based on voice commands
    switch (command.intent) {
      case 'search':
        setActiveTab('search');
        break;
      case 'location':
        setActiveTab('location');
        break;
      case 'weather':
        setActiveTab('weather');
        break;
      case 'navigate':
        setActiveTab('map');
        break;
    }
  };

  const handleLocationUpdate = (location: any) => {
    setCurrentLocation([location.latitude, location.longitude]);
  };

  const handleFlightSearch = (criteria: any) => {
    console.log('Flight search:', criteria);
    // Mock destination coordinates for demo
    if (criteria.destination?.toLowerCase().includes('new york')) {
      setSelectedDestination([40.7128, -74.0060]);
    } else if (criteria.destination?.toLowerCase().includes('los angeles')) {
      setSelectedDestination([34.0522, -118.2437]);
    }
  };

  const handleNavigationHelp = (destination: string) => {
    console.log('Navigation help requested for:', destination);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Hero Section with Airplane */}
      <div className="relative overflow-hidden flight-hero">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${aviationBg})` }}
        />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse opacity-40 animation-delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-50 animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-8 fly-in">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl pulse-glow">
                    <Plane className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Flight Sage AI
                  </h1>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-200">
                    Your Intelligent Aviation Assistant
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    Experience the future of flight planning with AI-powered search, real-time weather analysis, 
                    GPS navigation, and hands-free voice control designed for pilots and travelers.
                  </p>
                </div>
              </div>
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">AI-Powered</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <Headphones className="h-6 w-6 text-green-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Voice Control</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <Globe className="h-6 w-6 text-blue-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Global Coverage</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <Shield className="h-6 w-6 text-purple-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Safety First</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => setActiveTab('voice')}
                  className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Start Voice Assistant
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setActiveTab('search')}
                  className="text-lg px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search Flights
                </Button>
              </div>
            </div>

            {/* Right Content - Airplane Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img 
                  src={heroAirplane} 
                  alt="Modern Commercial Airplane" 
                  className="w-full h-[500px] object-cover airplane-float"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                
                {/* Floating Stats */}
                <div className="absolute top-6 left-6 space-y-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg fly-in animation-delay-500">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-semibold">Real-time Processing</span>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg fly-in animation-delay-700">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-semibold">5000+ Airports</span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg fly-in animation-delay-1000">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-semibold">99.9% Safety Rating</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Application */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:mx-auto">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <CloudRain className="h-4 w-4" />
              <span className="hidden sm:inline">Weather</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">GPS</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="space-y-6">
            <VoiceInterface
              onCommand={handleVoiceCommand}
              onFlightSearch={handleFlightSearch}
              onLocationRequest={() => setActiveTab('location')}
              onNavigationHelp={handleNavigationHelp}
            />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <FlightSearchForm onSearch={handleFlightSearch} />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Interactive Aviation Map
                </CardTitle>
                <CardDescription>
                  Real-time flight paths, airports, weather overlays, and navigation aids
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FlightMap
                  currentLocation={currentLocation}
                  destination={selectedDestination}
                  showWeather={true}
                  onAirportSelect={(airport) => console.log('Airport selected:', airport)}
                  onRouteCalculated={(route) => console.log('Route calculated:', route)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weather" className="space-y-6">
            <WeatherWidget
              location=""
              autoUpdate={true}
              showFlightAnalysis={true}
              onWeatherUpdate={(weather) => console.log('Weather updated:', weather)}
            />
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <LocationTracker
              onLocationUpdate={handleLocationUpdate}
              onNearbyAirportsFound={(airports) => console.log('Nearby airports:', airports)}
              showNavigationAids={true}
              autoUpdate={true}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Plane className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Flight Routes</p>
                  <p className="text-2xl font-bold">1000+</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Compass className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Airports</p>
                  <p className="text-2xl font-bold">5000+</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Radio className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Nav Aids</p>
                  <p className="text-2xl font-bold">2500+</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Gauge className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold">99.9%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
