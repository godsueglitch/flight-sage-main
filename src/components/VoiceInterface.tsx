import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Plane, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommand {
  command: string;
  intent: 'search' | 'navigate' | 'weather' | 'location' | 'emergency' | 'general';
  parameters?: Record<string, any>;
  confidence: number;
}

interface VoiceResponse {
  text: string;
  action?: string;
  data?: any;
}

interface VoiceInterfaceProps {
  onCommand?: (command: VoiceCommand) => void;
  onFlightSearch?: (criteria: any) => void;
  onLocationRequest?: () => void;
  onNavigationHelp?: (destination: string) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onCommand,
  onFlightSearch,
  onLocationRequest,
  onNavigationHelp
}) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'ai';
    message: string;
    timestamp: Date;
  }>>([]);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Voice Assistant Active",
          description: "Listening for your command..."
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript);
          addToConversation('user', finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please try speaking again.",
          variant: "destructive"
        });
      };
      
      recognitionRef.current = recognition;
      synthesisRef.current = window.speechSynthesis;

      // Initial greeting
      speak("Flight Sage AI assistant ready. How can I help you with your flight needs today?");
    } else {
      setIsSupported(false);
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processVoiceCommand = (command: string): VoiceCommand => {
    const lowerCommand = command.toLowerCase();
    let intent: VoiceCommand['intent'] = 'general';
    let parameters: Record<string, any> = {};
    let confidence = 0.8;

    // Flight search patterns
    if (lowerCommand.includes('find flights') || lowerCommand.includes('search flights') || 
        lowerCommand.includes('book flight') || lowerCommand.includes('fly to')) {
      intent = 'search';
      
      // Extract destination
      const toMatch = lowerCommand.match(/(?:to|fly to)\s+([a-zA-Z\s]+?)(?:\s|$)/);
      const fromMatch = lowerCommand.match(/(?:from)\s+([a-zA-Z\s]+?)(?:\s+to|$)/);
      
      if (toMatch) parameters.destination = toMatch[1].trim();
      if (fromMatch) parameters.origin = fromMatch[1].trim();
      
      // Extract date patterns
      const dateMatch = lowerCommand.match(/(?:on|for)\s+(today|tomorrow|next week|this weekend|\d{1,2}\/\d{1,2})/);
      if (dateMatch) parameters.date = dateMatch[1];
      
      // Extract preferences
      if (lowerCommand.includes('cheap') || lowerCommand.includes('cheapest')) {
        parameters.priority = 'cost';
      } else if (lowerCommand.includes('fast') || lowerCommand.includes('quick')) {
        parameters.priority = 'time';
      } else if (lowerCommand.includes('direct') || lowerCommand.includes('non-stop')) {
        parameters.directFlight = true;
      }
      
      confidence = 0.9;
    }
    
    // Location/navigation patterns
    else if (lowerCommand.includes('where am i') || lowerCommand.includes('current location') ||
             lowerCommand.includes('my location')) {
      intent = 'location';
      confidence = 0.95;
    }
    
    // Navigation patterns
    else if (lowerCommand.includes('navigate to') || lowerCommand.includes('route to') ||
             lowerCommand.includes('directions to')) {
      intent = 'navigate';
      const toMatch = lowerCommand.match(/(?:navigate to|route to|directions to)\s+([a-zA-Z\s]+)/);
      if (toMatch) parameters.destination = toMatch[1].trim();
      confidence = 0.9;
    }
    
    // Weather patterns
    else if (lowerCommand.includes('weather') || lowerCommand.includes('forecast')) {
      intent = 'weather';
      const locationMatch = lowerCommand.match(/weather\s+(?:in|at|for)\s+([a-zA-Z\s]+)/);
      if (locationMatch) parameters.location = locationMatch[1].trim();
      confidence = 0.85;
    }
    
    // Emergency patterns
    else if (lowerCommand.includes('emergency') || lowerCommand.includes('help') ||
             lowerCommand.includes('lost') || lowerCommand.includes('mayday')) {
      intent = 'emergency';
      confidence = 1.0;
    }

    const voiceCommand: VoiceCommand = {
      command,
      intent,
      parameters,
      confidence
    };

    // Process the command
    handleVoiceCommand(voiceCommand);
    onCommand?.(voiceCommand);

    return voiceCommand;
  };

  const handleVoiceCommand = (command: VoiceCommand) => {
    let response: VoiceResponse;

    switch (command.intent) {
      case 'search':
        response = handleFlightSearch(command);
        break;
      case 'location':
        response = handleLocationRequest(command);
        break;
      case 'navigate':
        response = handleNavigationRequest(command);
        break;
      case 'weather':
        response = handleWeatherRequest(command);
        break;
      case 'emergency':
        response = handleEmergencyRequest(command);
        break;
      default:
        response = {
          text: "I understand you said: " + command.command + ". How can I help you with flight planning, navigation, or weather information?",
        };
    }

    addToConversation('ai', response.text);
    speak(response.text);
  };

  const handleFlightSearch = (command: VoiceCommand): VoiceResponse => {
    const { parameters } = command;
    
    if (parameters?.destination) {
      // Trigger flight search
      const searchCriteria = {
        origin: parameters.origin || '',
        destination: parameters.destination,
        departureDate: parameters.date || '',
        priority: parameters.priority || 'balanced'
      };
      
      onFlightSearch?.(searchCriteria);
      
      return {
        text: `Searching for flights to ${parameters.destination}${parameters.origin ? ` from ${parameters.origin}` : ''}. 
              ${parameters.priority ? `Optimizing for ${parameters.priority}.` : ''} 
              I'll show you the best options with real-time pricing and weather conditions.`,
        action: 'flight_search',
        data: searchCriteria
      };
    } else {
      return {
        text: "I'd be happy to help you find flights. Please specify your destination. For example, say 'Find flights to New York' or 'Search flights from Los Angeles to Miami'.",
      };
    }
  };

  const handleLocationRequest = (command: VoiceCommand): VoiceResponse => {
    onLocationRequest?.();
    
    return {
      text: "Accessing your current location using GPS. I'll show your position on the map along with nearby airports and navigation aids.",
      action: 'get_location'
    };
  };

  const handleNavigationRequest = (command: VoiceCommand): VoiceResponse => {
    const { parameters } = command;
    
    if (parameters?.destination) {
      onNavigationHelp?.(parameters.destination);
      
      return {
        text: `Calculating optimal route to ${parameters.destination}. I'll provide turn-by-turn navigation with real-time weather conditions and airspace information.`,
        action: 'navigation',
        data: { destination: parameters.destination }
      };
    } else {
      return {
        text: "I can help you navigate. Please specify your destination. For example, say 'Navigate to JFK Airport' or 'Route to Los Angeles'.",
      };
    }
  };

  const handleWeatherRequest = (command: VoiceCommand): VoiceResponse => {
    const { parameters } = command;
    const location = parameters?.location || 'your current area';
    
    return {
      text: `Checking current weather conditions for ${location}. I'll provide visibility, wind conditions, and flight safety recommendations.`,
      action: 'weather',
      data: { location }
    };
  };

  const handleEmergencyRequest = (command: VoiceCommand): VoiceResponse => {
    return {
      text: `Emergency mode activated. I'm here to help. Please state your situation clearly. 
            I can provide nearest airport locations, emergency frequencies, and direct you to safety.
            If this is a real emergency, contact air traffic control on 121.5 MHz immediately.`,
      action: 'emergency'
    };
  };

  const speak = (text: string) => {
    if (synthesisRef.current && 'speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const addToConversation = (type: 'user' | 'ai', message: string) => {
    setConversation(prev => [...prev, {
      type,
      message,
      timestamp: new Date()
    }]);
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <MicOff className="h-5 w-5" />
            Voice Interface Unavailable
          </CardTitle>
          <CardDescription>
            Your browser doesn't support speech recognition. Please use a modern browser like Chrome or Edge.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            AI Voice Assistant
          </CardTitle>
          <CardDescription>
            Speak naturally to search flights, get navigation help, or check weather
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Voice Controls */}
            <div className="flex gap-2">
              <Button 
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                className="flex-1"
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Listening
                  </>
                )}
              </Button>
              
              <Button 
                onClick={isSpeaking ? stopSpeaking : () => speak("How can I help you today?")}
                variant={isSpeaking ? "destructive" : "outline"}
                size="lg"
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Status */}
            <div className="flex gap-2">
              {isListening && (
                <Badge variant="default" className="animate-pulse">
                  <Mic className="h-3 w-3 mr-1" />
                  Listening...
                </Badge>
              )}
              {isSpeaking && (
                <Badge variant="secondary" className="animate-pulse">
                  <Volume2 className="h-3 w-3 mr-1" />
                  Speaking...
                </Badge>
              )}
            </div>

            {/* Current Transcript */}
            {transcript && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>You said:</strong> {transcript}
                </p>
              </div>
            )}

            {/* Quick Commands */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Try saying:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>• "Find flights to New York"</div>
                <div>• "Where am I?"</div>
                <div>• "Navigate to LAX airport"</div>
                <div>• "Check weather conditions"</div>
                <div>• "Search cheapest flights to Miami"</div>
                <div>• "Emergency assistance"</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {conversation.slice(-5).map((item, index) => (
                <div key={index} className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    item.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{item.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {item.timestamp.toLocaleTimeString()}
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

export default VoiceInterface;