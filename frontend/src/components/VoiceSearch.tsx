import React, { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceSearchProps {
  onSearch: (query: string) => void;
  lang?: string;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onSearch, lang = "en-IN" }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const startListening = () => {
    if (typeof window === "undefined") return;
    
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice search not supported");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setError("");
    setTranscript("");
    
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e.error, e);
      setIsListening(false);
      
      switch (e.error) {
        case 'no-speech':
          setError("No speech detected. Try again.");
          break;
        case 'not-allowed':
        case 'service-not-allowed':
          setError("Microphone access denied");
          break;
        case 'aborted':
          // User stopped it, no error needed
          return;
        case 'audio-capture':
          setError("No microphone found");
          break;
        case 'network':
          setError("Network error. Check connection.");
          break;
        case 'language-not-supported':
          setError("Language not supported");
          break;
        default:
          // Don't show error for other cases, just log it
          console.log("Voice search stopped:", e.error);
          return;
      }
      
      setTimeout(() => setError(""), 4000);
    };

      recognition.onresult = (event: any) => {
        const text = event.results?.[0]?.[0]?.transcript || "";
        console.log("Voice search result:", text);
        if (text) {
          setTranscript(text);
          setIsListening(false);
          // Wait a moment to show the transcript, then search
          setTimeout(() => {
            onSearch(text);
            setTranscript("");
          }, 500);
        }
      };

      recognition.start();
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
      setError("Voice search failed to start");
      setIsListening(false);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={startListening}
        variant="ghost"
        size="icon"
        disabled={isListening}
        className={`
          relative
          hover:bg-primary/10 hover:scale-110 
          transition-all duration-200
          ${isListening ? 'bg-red-50 animate-pulse' : ''}
        `}
        title={isListening ? "Listening..." : "Voice search"}
      >
        {isListening ? (
          <div className="relative">
            <Mic className="h-5 w-5 text-red-500" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        ) : (
          <Mic className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        )}
      </Button>
      
      {/* Transcript or Error Display */}
      {(transcript || error || isListening) && (
        <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] whitespace-nowrap">
          {isListening && (
            <p className="text-sm text-blue-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Listening...
            </p>
          )}
          {transcript && !isListening && (
            <p className="text-sm text-green-600">
              Searching for: "{transcript}"
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
