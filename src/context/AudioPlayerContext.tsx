import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Song } from '../types.ts';

interface AudioPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMusicChampOpen: boolean;
  playSong: (song: Song, openChamp?: boolean) => void;
  togglePlay: () => void;
  replaySong: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  openMusicChamp: () => void;
  closeMusicChamp: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

// Web Audio synthesizer fallback for sacred hymn melody
class SynthHymnPlayer {
  private ctx: AudioContext | null = null;
  private isSynthesizing = false;
  private timer: number | null = null;

  start(onTimeUpdate: (time: number) => void) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.isSynthesizing = true;
      let startTime = this.ctx.currentTime;
      let noteIndex = 0;

      // Malagasy hymn chord progression notes (Frequencies in Hz)
      // D major / Sol hymn harmony: D4, F#4, A4, G4, B4, E4
      const chords = [
        [293.66, 369.99, 440.00], // D - F# - A
        [329.63, 392.00, 493.88], // E - G - B
        [369.99, 440.00, 554.37], // F# - A - C#
        [392.00, 493.88, 587.33], // G - B - D
        [440.00, 554.37, 659.25], // A - C# - E
        [369.99, 440.00, 587.33], // F# - A - D
        [293.66, 369.99, 440.00], // D - F# - A
      ];

      const playNextChord = () => {
        if (!this.isSynthesizing || !this.ctx) return;
        const currentChord = chords[noteIndex % chords.length];
        const now = this.ctx.currentTime;
        const chordDuration = 1.6;

        currentChord.forEach(freq => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle'; // Warm organ/flute timbre
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.08, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.04, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + chordDuration);
        });

        noteIndex++;
        const elapsed = this.ctx.currentTime - startTime;
        onTimeUpdate(elapsed);

        this.timer = window.setTimeout(playNextChord, 1500);
      };

      playNextChord();
    } catch (e) {
      console.warn('Synth player init failed', e);
    }
  }

  stop() {
    this.isSynthesizing = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.suspend();
      } catch (e) {
        // ignore
      }
    }
  }
}

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(270); // default ~4:30
  const [isMusicChampOpen, setIsMusicChampOpen] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SynthHymnPlayer>(new SynthHymnPlayer());

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      synthRef.current.stop();
    };
  }, []);

  const playSong = (song: Song, openChamp = true) => {
    setCurrentSong(song);
    setCurrentTime(0);

    // Parse duration string e.g. "5:03" into seconds
    if (song.duration) {
      const parts = song.duration.split(':').map(Number);
      if (parts.length === 2) {
        setDuration(parts[0] * 60 + parts[1]);
      }
    }

    if (openChamp) {
      setIsMusicChampOpen(true);
    }

    if (song.audioUrl && audioRef.current) {
      synthRef.current.stop();
      audioRef.current.src = song.audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn('Real audio playback failed, falling back to hymnal synth:', err);
          synthRef.current.start(t => setCurrentTime(t));
          setIsPlaying(true);
        });
    } else {
      // No MP3 uploaded for this song yet -> use warm organ synth hymn melody
      if (audioRef.current) audioRef.current.pause();
      synthRef.current.stop();
      synthRef.current.start(t => setCurrentTime(t));
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!currentSong) return;

    if (isPlaying) {
      pause();
    } else {
      if (currentSong.audioUrl && audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            synthRef.current.start(t => setCurrentTime(t));
            setIsPlaying(true);
          });
      } else {
        synthRef.current.start(t => setCurrentTime(t));
        setIsPlaying(true);
      }
    }
  };

  const pause = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    synthRef.current.stop();
  };

  const replaySong = () => {
    if (!currentSong) return;
    setCurrentTime(0);
    if (currentSong.audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      synthRef.current.stop();
      synthRef.current.start(t => setCurrentTime(t));
    }
    setIsPlaying(true);
  };

  const seek = (seconds: number) => {
    setCurrentTime(seconds);
    if (currentSong?.audioUrl && audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  const openMusicChamp = () => setIsMusicChampOpen(true);
  const closeMusicChamp = () => setIsMusicChampOpen(false);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        isMusicChampOpen,
        playSong,
        togglePlay,
        replaySong,
        pause,
        seek,
        openMusicChamp,
        closeMusicChamp,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
};
