'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings, Check } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  lectureId: string;
  initialPosition?: number;
  onProgressUpdate?: (positionSeconds: number, completed: boolean) => void;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  lectureId,
  initialPosition = 0,
  onProgressUpdate,
  onEnded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  useEffect(() => {
    if (initialPosition > 10) {
      setShowResumePrompt(true);
    }
  }, [initialPosition, lectureId]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setCurrentTime(current);
      setDuration(dur);

      // Periodically trigger progress update every 10 seconds
      if (Math.floor(current) % 10 === 0 && onProgressUpdate) {
        const isComp = current / dur >= 0.9;
        onProgressUpdate(Math.floor(current), isComp);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const resumeFromPosition = () => {
    if (videoRef.current && initialPosition) {
      videoRef.current.currentTime = initialPosition;
      videoRef.current.play();
      setIsPlaying(true);
    }
    setShowResumePrompt(false);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.parentElement?.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-brand-border/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] group">
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
      />

      {/* Resume playback banner */}
      {showResumePrompt && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-brand-surface/95 border border-brand-green/60 text-white shadow-2xl backdrop-blur-md animate-fade-in">
          <RotateCcw className="w-4 h-4 text-brand-green" />
          <span className="text-xs font-mono">Resume watching from {formatTime(initialPosition)}?</span>
          <button
            onClick={resumeFromPosition}
            className="px-3 py-1 text-xs font-bold text-black bg-brand-green rounded-lg hover:bg-emerald-400 transition-colors"
          >
            Resume
          </button>
          <button
            onClick={() => setShowResumePrompt(false)}
            className="text-xs text-brand-silver hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overlay Play Icon when paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity"
        >
          <div className="w-20 h-20 rounded-full bg-brand-green/20 border-2 border-brand-green text-brand-green flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_30px_rgba(0,255,102,0.4)]">
            <Play className="w-8 h-8 fill-brand-green ml-1" />
          </div>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
        {/* Scrubber Progress Bar */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-brand-surface-light accent-brand-green rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between text-white text-xs font-mono">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-brand-green transition-colors">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5 hover:text-brand-green" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-brand-surface-light accent-brand-green rounded cursor-pointer"
              />
            </div>

            <span className="text-brand-silver">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4 relative">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 rounded bg-brand-surface border border-brand-border text-xs font-mono text-brand-silver hover:text-brand-green"
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-8 right-0 bg-brand-surface border border-brand-border rounded-xl p-1 w-24 shadow-2xl z-40">
                  {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className="w-full text-left px-3 py-1.5 text-xs text-brand-silver hover:text-white hover:bg-brand-surface-light rounded-lg flex items-center justify-between"
                    >
                      <span>{rate}x</span>
                      {playbackRate === rate && <Check className="w-3 h-3 text-brand-green" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Badge */}
            <span className="px-2 py-0.5 rounded bg-brand-green/20 text-brand-green text-[10px] font-mono border border-brand-green/40">
              1080p HD
            </span>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="hover:text-brand-green transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
