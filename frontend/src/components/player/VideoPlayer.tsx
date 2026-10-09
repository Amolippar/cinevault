import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
  Settings,
  Subtitles,
  ShieldCheck,
  X,
} from 'lucide-react';
import { LicenseStatus } from '../../types';

interface VideoPlayerProps {
  src?: string | null;
  title: string;
  licenseStatus: LicenseStatus | string;
  licenseNotes: string;
  initialProgressSeconds?: number;
  onProgressUpdate?: (progressSeconds: number, durationSeconds: number) => void;
  onClose?: () => void;
  isExpired?: boolean;
  unavailableNotice?: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  licenseStatus,
  licenseNotes,
  initialProgressSeconds = 0,
  onProgressUpdate,
  onClose,
  isExpired = false,
  unavailableNotice,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<any>(null);

  if (isExpired || unavailableNotice || !src) {
    return (
      <div className="relative w-full aspect-video bg-black/95 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 text-center border border-rose-500/40 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm font-semibold text-rose-300 max-w-lg mb-6 leading-relaxed">
          {unavailableNotice || 'This content is currently unavailable because its distribution license has expired.'}
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
          >
            Close Player
          </button>
        )}
      </div>
    );
  }

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(false);
  const [resumePrompt, setResumePrompt] = useState<boolean>(initialProgressSeconds > 15);

  const controlsTimeoutRef = useRef<any>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3500);
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (initialProgressSeconds > 0 && !resumePrompt) {
        videoRef.current.currentTime = initialProgressSeconds;
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
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

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume > 0 ? volume : 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  // Sync progress every 5 seconds while playing
  useEffect(() => {
    if (isPlaying && onProgressUpdate) {
      progressIntervalRef.current = setInterval(() => {
        if (videoRef.current && videoRef.current.duration > 0) {
          onProgressUpdate(
            Math.floor(videoRef.current.currentTime),
            Math.floor(videoRef.current.duration)
          );
        }
      }, 5000);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, onProgressUpdate]);

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'ArrowRight' && videoRef.current) {
        videoRef.current.currentTime += 10;
      } else if (e.code === 'ArrowLeft' && videoRef.current) {
        videoRef.current.currentTime -= 10;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleResumeChoice = (resume: boolean) => {
    if (resume && videoRef.current) {
      videoRef.current.currentTime = initialProgressSeconds;
    }
    setResumePrompt(false);
    togglePlay();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none border border-slate-800"
    >
      <video
        ref={videoRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Top Bar (Title & Legal Watermark) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <h4 className="text-sm sm:text-base font-bold text-white drop-shadow-md">
            {title}
          </h4>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <ShieldCheck className="w-3 h-3" />
            {licenseStatus === 'PUBLIC_DOMAIN' ? 'Public Domain' : 'Verified License'}
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Resume Prompt Modal Overlay */}
      {resumePrompt && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-30 animate-fade-in">
          <div className="max-w-md w-full glass-panel rounded-2xl p-6 text-center border border-emerald-500/30 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <FastForward className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Resume Playback?</h3>
            <p className="text-xs text-slate-300">
              You previously stopped watching at{' '}
              <span className="font-semibold text-emerald-400">{formatTime(initialProgressSeconds)}</span>.
              Would you like to resume or start from the beginning?
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => handleResumeChoice(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20"
              >
                Resume at {formatTime(initialProgressSeconds)}
              </button>
              <button
                onClick={() => handleResumeChoice(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Center Big Play Button if paused */}
      {!isPlaying && !resumePrompt && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer z-10"
        >
          <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-slate-950" />
        </button>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 z-20 space-y-3 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar Slider */}
        <div className="relative flex items-center group/scrub">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:h-2 transition-all"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between text-white text-xs sm:text-sm">
          {/* Left: Play, Rewind, Forward, Volume, Time */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={togglePlay}
              className="p-1 text-slate-200 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime -= 10;
              }}
              className="p-1 text-slate-300 hover:text-white transition-colors"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-1.5 group/volume">
              <button onClick={toggleMute} className="p-1 text-slate-300 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <span className="text-[11px] sm:text-xs text-slate-300 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Speed, Subtitles, Fullscreen */}
          <div className="flex items-center space-x-3 sm:space-x-4 relative">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 py-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs w-24">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${
                        playbackSpeed === s ? 'text-emerald-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Captions toggle */}
            <button
              onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
              title={subtitlesEnabled ? 'Disable Subtitles' : 'Enable Subtitles'}
              className={`p-1 transition-colors ${
                subtitlesEnabled ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 text-slate-300 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
