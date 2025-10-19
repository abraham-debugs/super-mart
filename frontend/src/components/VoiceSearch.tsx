import React, { useState } from "react";

interface VoiceSearchProps {
  onSearch: (query: string) => void;
  lang?: string;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onSearch, lang = "en-IN" }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      if (text) {
        setTranscript(text);
        onSearch(text);
      }
    };

    recognition.start();
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={startListening}
        className={`p-2 rounded-full shadow-md text-white ${isListening ? "bg-red-500" : "bg-primary"}`}
        title={isListening ? "Listening..." : "Tap to speak"}
      >
        <span role="img" aria-label="mic">🎤</span>
      </button>
      <span className="text-sm text-muted-foreground">
        {transcript || "Tap mic & say product name..."}
      </span>
    </div>
  );
};

export default VoiceSearch;
