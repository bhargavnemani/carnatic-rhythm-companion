import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { TALAMS, DEFAULT_TALAM, JAATHIS, TRADITIONAL_TALAMS, getCommonTalams, getTraditionalTalams, createCustomTalam, type Talam } from '@/data/talams';

interface MetronomeState {
  isPlaying: boolean;
  currentBeat: number;
  currentSubdivision: number;
  tempo: number;
  selectedTalam: Talam;
  selectedJaathi: string;
  selectedTraditionalTalam: string;
  selectionMode: 'jaathi-talam' | 'common';
  selectedGathi: string;
  shrutiPlaying: boolean;
  shrutiPitch: string;
  shrutiVolume: number;
}

const GATHIS = [
  { name: "Tisra", subdivisions: 3 },
  { name: "Chatusra", subdivisions: 4 },
  { name: "Khanda", subdivisions: 5 },
  { name: "Misra", subdivisions: 7 },
  { name: "Sankeerna", subdivisions: 9 }
];

const SHRUTI_NOTES = [
  { name: "Sa", frequency: 261.63, swaram: "Sa" },
  { name: "Ri", frequency: 277.18, swaram: "Ri" },
  { name: "Ga", frequency: 293.66, swaram: "Ga" },
  { name: "Ma", frequency: 311.13, swaram: "Ma" },
  { name: "Pa", frequency: 349.23, swaram: "Pa" },
  { name: "Dha", frequency: 392.00, swaram: "Dha" },
  { name: "Ni", frequency: 440.00, swaram: "Ni" }
];

export const CarnaticMetronome = () => {
  const [state, setState] = useState<MetronomeState>({
    isPlaying: false,
    currentBeat: 0,
    currentSubdivision: 0,
    tempo: 80,
    selectedTalam: DEFAULT_TALAM,
    selectedJaathi: 'Chatusra',
    selectedTraditionalTalam: 'Dhruva',
    selectionMode: 'common',
    selectedGathi: 'Chatusra',
    shrutiPlaying: false,
    shrutiPitch: 'Sa',
    shrutiVolume: 0.25
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const shrutiIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shrutiGainRef = useRef<GainNode | null>(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (shrutiIntervalRef.current) {
        clearInterval(shrutiIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play sound for beats
  const playBeat = (isSam: boolean = false, isSubdivision: boolean = false) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    if (isSubdivision) {
      // Subdivision clicks are softer and higher pitched
      oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.08, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.05);
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.05);
    } else {
      // Main beats
      oscillator.frequency.setValueAtTime(
        isSam ? 800 : 400, 
        audioContextRef.current.currentTime
      );
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01, 
        audioContextRef.current.currentTime + (isSam ? 0.2 : 0.1)
      );
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + (isSam ? 0.2 : 0.1));
    }
  };

  // Metronome tick logic with gathi subdivisions
  useEffect(() => {
    if (state.isPlaying) {
      const gathi = GATHIS.find(g => g.name === state.selectedGathi);
      const subdivisions = gathi?.subdivisions || 4;
      
      // Calculate interval based on tempo and subdivisions
      const beatInterval = 60000 / state.tempo;
      const subdivisionInterval = beatInterval / subdivisions;
      
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const nextSubdivision = (prev.currentSubdivision + 1) % subdivisions;
          const isLastSubdivision = nextSubdivision === 0;
          
          let nextBeat = prev.currentBeat;
          if (isLastSubdivision) {
            nextBeat = (prev.currentBeat + 1) % prev.selectedTalam.aksharas;
          }
          
          const isSamam = nextBeat === 0 && nextSubdivision === 0;
          const isMainBeat = nextSubdivision === 0;
          const isEmphasis = prev.selectedTalam.emphasis.includes(nextBeat);
          const isSilent = prev.selectedTalam.silentBeats?.includes(nextBeat) || false;
          
          // Play sound
          if (!isSilent || !isMainBeat) {
            if (isMainBeat) {
              playBeat(isSamam || isEmphasis, false);
            } else {
              playBeat(false, true);
            }
          }
          
          return {
            ...prev,
            currentBeat: nextBeat,
            currentSubdivision: nextSubdivision
          };
        });
      }, subdivisionInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isPlaying, state.tempo, state.selectedGathi]);

  const togglePlayPause = () => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const resetMetronome = () => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentBeat: 0,
      currentSubdivision: 0
    }));
  };

  const handleSelectionModeChange = (mode: 'jaathi-talam' | 'common') => {
    setState(prev => ({
      ...prev,
      selectionMode: mode,
      currentBeat: 0,
      currentSubdivision: 0,
      isPlaying: false
    }));
  };

  const handleCommonTalamChange = (talamName: string) => {
    const newTalam = getCommonTalams().find(t => t.name === talamName) || DEFAULT_TALAM;
    setState(prev => ({
      ...prev,
      selectedTalam: newTalam,
      currentBeat: 0,
      currentSubdivision: 0,
      isPlaying: false
    }));
  };

  const handleJaathiChange = (jaathi: string) => {
    const customTalam = createCustomTalam(jaathi, state.selectedTraditionalTalam);
    setState(prev => ({
      ...prev,
      selectedJaathi: jaathi,
      selectedTalam: customTalam,
      currentBeat: 0,
      currentSubdivision: 0,
      isPlaying: false
    }));
  };

  const handleTraditionalTalamChange = (talamName: string) => {
    const customTalam = createCustomTalam(state.selectedJaathi, talamName);
    setState(prev => ({
      ...prev,
      selectedTalam: customTalam,
      selectedTraditionalTalam: talamName,
      currentBeat: 0,
      currentSubdivision: 0,
      isPlaying: false
    }));
  };

  const handleTempoChange = (value: number[]) => {
    setState(prev => ({ ...prev, tempo: value[0] }));
  };

  const handleGathiChange = (gathi: string) => {
    setState(prev => ({
      ...prev,
      selectedGathi: gathi,
      currentSubdivision: 0
    }));
  };

  // Play tanpura string pluck
  const playTanpuraPluck = (frequency: number) => {
    if (!audioContextRef.current || !shrutiGainRef.current) return;

    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Simulate string pluck with harmonics
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 4, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    // Sharp attack, long decay
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(shrutiGainRef.current);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 3.0);
  };

  const toggleShruti = () => {
    if (!audioContextRef.current) return;

    if (state.shrutiPlaying) {
      // Stop shruti with fade out
      if (shrutiGainRef.current) {
        shrutiGainRef.current.gain.exponentialRampToValueAtTime(
          0.001,
          audioContextRef.current.currentTime + 1.0
        );
      }
      if (shrutiIntervalRef.current) {
        clearInterval(shrutiIntervalRef.current);
        shrutiIntervalRef.current = null;
      }
      setState(prev => ({ ...prev, shrutiPlaying: false }));
    } else {
      // Start Pa-Sa-Sa-Pa tanpura pattern
      const selectedNote = SHRUTI_NOTES.find(n => n.name === state.shrutiPitch);
      if (!selectedNote) return;

      const ctx = audioContextRef.current;
      const masterGain = ctx.createGain();
      
      masterGain.gain.setValueAtTime(state.shrutiVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      shrutiGainRef.current = masterGain;

      // Pa-Sa-Sa-Pa pattern (5th, root, root, 5th)
      const sa = selectedNote.frequency;
      const pa = sa * 1.5; // Perfect fifth
      const pattern = [pa, sa, sa, pa];
      let currentIndex = 0;

      // Play first note immediately
      playTanpuraPluck(pattern[0]);
      currentIndex = 1;

      // Set up interval for remaining notes
      shrutiIntervalRef.current = setInterval(() => {
        playTanpuraPluck(pattern[currentIndex]);
        currentIndex = (currentIndex + 1) % pattern.length;
      }, 1000); // One pluck per second

      setState(prev => ({ ...prev, shrutiPlaying: true }));
    }
  };

  const handleShrutiPitchChange = (pitch: string) => {
    const wasPlaying = state.shrutiPlaying;
    
    // Stop current shruti if playing
    if (wasPlaying) {
      if (shrutiIntervalRef.current) {
        clearInterval(shrutiIntervalRef.current);
      }
    }

    setState(prev => ({ ...prev, shrutiPitch: pitch, shrutiPlaying: false }));

    // Restart with new pitch if it was playing
    if (wasPlaying) {
      setTimeout(() => {
        toggleShruti();
      }, 100);
    }
  };

  const handleShrutiVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setState(prev => ({ ...prev, shrutiVolume: newVolume }));
    
    // Update volume in real-time if playing
    if (shrutiGainRef.current && state.shrutiPlaying) {
      shrutiGainRef.current.gain.setValueAtTime(
        newVolume,
        audioContextRef.current?.currentTime || 0
      );
    }
  };

  const getBeatStyle = (beatIndex: number) => {
    const isActive = beatIndex === state.currentBeat && state.isPlaying;
    const isSamam = beatIndex === 0;
    const isEmphasis = state.selectedTalam.emphasis.includes(beatIndex);
    const isSilent = state.selectedTalam.silentBeats?.includes(beatIndex) || false;
    
    let className = "w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-150";
    
    // Silent beats are always grayed out
    if (isSilent) {
      className += " bg-muted/30 text-muted-foreground/40 border-muted/30";
      if (isActive) {
        className += " scale-105";
      }
    } else if (isActive) {
      if (isSamam) {
        className += " bg-accent text-accent-foreground border-accent shadow-warm scale-110";
      } else if (isEmphasis) {
        className += " bg-primary text-primary-foreground border-primary scale-105";
      } else {
        className += " bg-secondary text-secondary-foreground border-secondary scale-105";
      }
    } else {
      if (isSamam) {
        className += " border-accent/40 text-accent";
      } else if (isEmphasis) {
        className += " border-primary/40 text-primary";
      } else {
        className += " border-muted text-muted-foreground";
      }
    }
    
    return className;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}

      {/* Main Controls */}
      <Card className="p-8 shadow-soft">
        <div className="space-y-8">
          {/* Selection Mode */}
          <div className="space-y-4">
            <label className="text-lg font-semibold">Select Mode</label>
            <div className="flex gap-2">
              <Button
                variant={state.selectionMode === 'common' ? 'default' : 'outline'}
                onClick={() => handleSelectionModeChange('common')}
                className="flex-1"
              >
                Common Talams
              </Button>
              <Button
                variant={state.selectionMode === 'jaathi-talam' ? 'default' : 'outline'}
                onClick={() => handleSelectionModeChange('jaathi-talam')}
                className="flex-1"
              >
                Custom
              </Button>
            </div>
          </div>

          {/* Common Talams Selection */}
          {state.selectionMode === 'common' && (
            <div className="space-y-4">
              <label className="text-lg font-semibold">Common Talams</label>
              <Select value={state.selectedTalam.name} onValueChange={handleCommonTalamChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getCommonTalams().map((talam) => (
                    <SelectItem key={talam.name} value={talam.name}>
                      {talam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {state.selectedTalam.description}
              </p>
            </div>
          )}

          {/* Custom Selection */}
          {state.selectionMode === 'jaathi-talam' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-4">
                <label className="text-lg font-semibold">Jaathi</label>
                <Select value={state.selectedJaathi} onValueChange={handleJaathiChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JAATHIS.map((jaathi) => (
                      <SelectItem key={jaathi.name} value={jaathi.name}>
                        {jaathi.name} ({jaathi.beats} beats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <label className="text-lg font-semibold">Talam</label>
                <Select value={state.selectedTraditionalTalam} onValueChange={handleTraditionalTalamChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADITIONAL_TALAMS.map((talam) => (
                      <SelectItem key={talam} value={talam}>
                        {talam}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <label className="text-lg font-semibold">Gathi</label>
                <Select value={state.selectedGathi} onValueChange={handleGathiChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GATHIS.map((gathi) => (
                      <SelectItem key={gathi.name} value={gathi.name}>
                        {gathi.name} ({gathi.subdivisions})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Beat Visualization */}
          <div className="space-y-4">
            <label className="text-lg font-semibold">
              Beat Pattern ({state.selectedTalam.aksharas} Aksharas)
            </label>
            <div className="flex flex-wrap gap-3 justify-center p-6 bg-gradient-subtle rounded-lg">
              {Array.from({ length: state.selectedTalam.aksharas }).map((_, index) => (
                <div
                  key={index}
                  className={getBeatStyle(index)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                Samam (First Beat)
              </span>
              <span className="inline-flex items-center gap-2 ml-4">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                Emphasis
              </span>
            </div>
          </div>

          {/* Shruti Controls */}
          <div className="space-y-4 p-6 bg-muted/30 rounded-lg">
            <label className="text-lg font-semibold">Shruti (Tanpura)</label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Select value={state.shrutiPitch} onValueChange={handleShrutiPitchChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Pitch" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHRUTI_NOTES.map((note) => (
                      <SelectItem key={note.name} value={note.name}>
                        {note.swaram}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={toggleShruti}
                variant={state.shrutiPlaying ? 'default' : 'outline'}
                className="px-8"
              >
                {state.shrutiPlaying ? 'Stop Shruti' : 'Start Shruti'}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Volume</span>
                <span className="text-sm font-mono">{Math.round(state.shrutiVolume * 100)}%</span>
              </div>
              <Slider
                value={[state.shrutiVolume]}
                onValueChange={handleShrutiVolumeChange}
                min={0}
                max={0.5}
                step={0.01}
                className="w-full"
              />
            </div>
          </div>

          {/* Tempo Control */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-lg font-semibold">Tempo</label>
              <span className="text-xl font-mono font-bold text-primary">
                {state.tempo} BPM
              </span>
            </div>
            <Slider
              value={[state.tempo]}
              onValueChange={handleTempoChange}
              min={40}
              max={200}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow (40)</span>
              <span>Medium (120)</span>
              <span>Fast (200)</span>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={togglePlayPause}
              size="lg"
              className="w-16 h-16 rounded-full bg-gradient-warm hover:shadow-warm transition-all duration-200"
            >
              {state.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            <Button
              onClick={resetMetronome}
              size="lg"
              variant="outline"
              className="w-16 h-16 rounded-full"
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Talam Structure Info */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-lg font-semibold mb-4">Talam Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.selectedTalam.structure.map((component, index) => (
            <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold mb-2">{component.symbol}</div>
              <div className="font-semibold">{component.component}</div>
              <div className="text-sm text-muted-foreground">
                {component.beats} beat{component.beats !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};