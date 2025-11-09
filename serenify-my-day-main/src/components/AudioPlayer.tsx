import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  onComplete?: () => void;
  className?: string;
}

export const AudioPlayer = ({ audioUrl, onComplete, className = "" }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onComplete]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleReset = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.pause();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={className}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleReset}
          className="rounded-full w-14 h-14 p-0"
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
        <Button
          size="lg"
          onClick={togglePlay}
          className="rounded-full w-20 h-20 bg-primary hover:bg-primary/90"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 max-w-xs mx-auto">
        <Volume2 className="w-5 h-5 text-muted-foreground" />
        <Slider
          value={[volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(val) => setVolume(val[0])}
          className="flex-1"
        />
      </div>

      {/* Completion Message */}
      {currentTime >= duration && duration > 0 && (
        <div className="mt-6 text-center p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 animate-fade-in">
          <p className="text-xl font-semibold mb-2">
            Session Complete! 🌟
          </p>
          <p className="text-muted-foreground">
            You've completed this meditation
          </p>
        </div>
      )}
    </div>
  );
};
