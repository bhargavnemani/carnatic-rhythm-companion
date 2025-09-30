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
  tempo: number;
  selectedTalam: Talam;
  selectedJaathi: string;
  selectedTraditionalTalam: string;
  selectionMode: 'jaathi-talam' | 'common';
}

export const CarnaticMetronome = () => {
  const [state, setState] = useState<MetronomeState>({
    isPlaying: false,
    currentBeat: 0,
    tempo: 80,
    selectedTalam: DEFAULT_TALAM,
    selectedJaathi: 'Chatusra',
    selectedTraditionalTalam: 'Dhruva',
    selectionMode: 'common'
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play sound for beats
  const playBeat = (isSam: boolean = false) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    // Samam (first beat) has higher pitch and longer duration
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
  };

  // Metronome tick logic
  useEffect(() => {
    if (state.isPlaying) {
      const interval = 60000 / state.tempo; // Convert BPM to milliseconds
      
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const nextBeat = (prev.currentBeat + 1) % prev.selectedTalam.aksharas;
          const isSamam = nextBeat === 0;
          const isEmphasis = prev.selectedTalam.emphasis.includes(nextBeat);
          const isSilent = prev.selectedTalam.silentBeats?.includes(nextBeat) || false;
          
          // Play sound only if not silent
          if (!isSilent) {
            playBeat(isSamam || isEmphasis);
          }
          
          return {
            ...prev,
            currentBeat: nextBeat
          };
        });
      }, interval);
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
  }, [state.isPlaying, state.tempo]);

  const togglePlayPause = () => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const resetMetronome = () => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentBeat: 0
    }));
  };

  const handleSelectionModeChange = (mode: 'jaathi-talam' | 'common') => {
    setState(prev => ({
      ...prev,
      selectionMode: mode,
      currentBeat: 0,
      isPlaying: false
    }));
  };

  const handleCommonTalamChange = (talamName: string) => {
    const newTalam = getCommonTalams().find(t => t.name === talamName) || DEFAULT_TALAM;
    setState(prev => ({
      ...prev,
      selectedTalam: newTalam,
      currentBeat: 0,
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
      isPlaying: false
    }));
  };

  const handleTempoChange = (value: number[]) => {
    setState(prev => ({ ...prev, tempo: value[0] }));
  };

  const getBeatStyle = (beatIndex: number) => {
    const isActive = beatIndex === state.currentBeat && state.isPlaying;
    const isSamam = beatIndex === 0;
    const isEmphasis = state.selectedTalam.emphasis.includes(beatIndex);
    const isSilent = state.selectedTalam.silentBeats?.includes(beatIndex) || false;
    
    let className = "w-14 h-14 rounded-full border-3 flex items-center justify-center text-sm font-display font-bold transition-all duration-200 hover:scale-105";
    
    // Silent beats are always grayed out
    if (isSilent) {
      className += " bg-muted/20 text-muted-foreground/30 border-muted-foreground/20";
      if (isActive) {
        className += " scale-110 shadow-sm";
      }
    } else if (isActive) {
      if (isSamam) {
        className += " bg-accent text-accent-foreground border-accent shadow-glow scale-125 animate-pulse";
      } else if (isEmphasis) {
        className += " bg-primary text-primary-foreground border-primary scale-115 shadow-warm";
      } else {
        className += " bg-secondary text-secondary-foreground border-secondary scale-110 shadow-sm";
      }
    } else {
      if (isSamam) {
        className += " border-accent/50 text-accent bg-accent/10 hover:bg-accent/20";
      } else if (isEmphasis) {
        className += " border-primary/50 text-primary bg-primary/10 hover:bg-primary/20";
      } else {
        className += " border-muted/60 text-muted-foreground bg-background/50 hover:bg-muted/20";
      }
    }
    
    return className;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block">
            <h1 className="text-5xl lg:text-6xl font-display font-bold tracking-tight mb-4">
              <span className="bg-gradient-warm bg-clip-text text-transparent">
                Tāla
              </span>
              <span className="text-foreground ml-2">Practice</span>
            </h1>
            <div className="w-20 h-1 bg-gradient-warm mx-auto mb-6 rounded-full"></div>
          </div>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Master the rhythmic patterns of Carnatic music with precision and elegance
          </p>
        </div>

        {/* Main Controls */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-soft border-0 bg-card/80 backdrop-blur-sm">
              <div className="space-y-10">
                {/* Selection Mode */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-display font-semibold text-foreground">
                    Choose Your Tāla
                  </h2>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-muted/50 rounded-xl">
                    <Button
                      variant={state.selectionMode === 'common' ? 'default' : 'ghost'}
                      onClick={() => handleSelectionModeChange('common')}
                      className={`
                        h-12 font-medium transition-all duration-200
                        ${state.selectionMode === 'common' 
                          ? 'bg-primary shadow-md text-primary-foreground' 
                          : 'hover:bg-background/80'
                        }
                      `}
                    >
                      Popular Tālas
                    </Button>
                    <Button
                      variant={state.selectionMode === 'jaathi-talam' ? 'default' : 'ghost'}
                      onClick={() => handleSelectionModeChange('jaathi-talam')}
                      className={`
                        h-12 font-medium transition-all duration-200
                        ${state.selectionMode === 'jaathi-talam' 
                          ? 'bg-primary shadow-md text-primary-foreground' 
                          : 'hover:bg-background/80'
                        }
                      `}
                    >
                      Custom Build
                    </Button>
                  </div>
                </div>

                {/* Common Talams Selection */}
                {state.selectionMode === 'common' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-lg font-display font-medium text-foreground">
                        Select Tāla
                      </label>
                      <Select value={state.selectedTalam.name} onValueChange={handleCommonTalamChange}>
                        <SelectTrigger className="h-14 border-2 border-border/50 hover:border-primary/50 transition-colors">
                          <SelectValue className="text-lg" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-border/50">
                          {getCommonTalams().map((talam) => (
                            <SelectItem key={talam.name} value={talam.name} className="text-base py-3">
                              {talam.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                      <p className="text-muted-foreground leading-relaxed">
                        {state.selectedTalam.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Custom Selection */}
                {state.selectionMode === 'jaathi-talam' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-lg font-display font-medium text-foreground">
                        Jāti
                      </label>
                      <Select value={state.selectedJaathi} onValueChange={handleJaathiChange}>
                        <SelectTrigger className="h-14 border-2 border-border/50 hover:border-primary/50 transition-colors">
                          <SelectValue className="text-base" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-border/50">
                          {JAATHIS.map((jaathi) => (
                            <SelectItem key={jaathi.name} value={jaathi.name} className="text-base py-3">
                              {jaathi.name} <span className="text-muted-foreground">({jaathi.beats} beats)</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-lg font-display font-medium text-foreground">
                        Tāla
                      </label>
                      <Select value={state.selectedTraditionalTalam} onValueChange={handleTraditionalTalamChange}>
                        <SelectTrigger className="h-14 border-2 border-border/50 hover:border-primary/50 transition-colors">
                          <SelectValue className="text-base" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-border/50">
                          {TRADITIONAL_TALAMS.map((talam) => (
                            <SelectItem key={talam} value={talam} className="text-base py-3">
                              {talam}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Tempo Control */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="text-lg font-display font-medium text-foreground">
                      Tempo
                    </label>
                    <div className="text-right">
                      <div className="text-3xl font-display font-bold text-primary">
                        {state.tempo}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        BPM
                      </div>
                    </div>
                  </div>
                  <div className="px-2">
                    <Slider
                      value={[state.tempo]}
                      onValueChange={handleTempoChange}
                      min={40}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-3 px-1">
                      <span className="font-medium">Slow</span>
                      <span className="font-medium">Medium</span>
                      <span className="font-medium">Fast</span>
                    </div>
                  </div>
                </div>

                {/* Transport Controls */}
                <div className="flex justify-center gap-6 pt-4">
                  <Button
                    onClick={togglePlayPause}
                    size="lg"
                    className="w-20 h-20 rounded-full bg-gradient-warm hover:shadow-glow transition-all duration-300 transform hover:scale-105"
                  >
                    {state.isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </Button>
                  <Button
                    onClick={resetMetronome}
                    size="lg"
                    variant="outline"
                    className="w-20 h-20 rounded-full border-2 hover:bg-muted/50 transition-all duration-200"
                  >
                    <RotateCcw className="w-7 h-7" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Beat Visualization Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-soft border-0 bg-card/80 backdrop-blur-sm h-fit sticky top-4">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    Beat Pattern
                  </h3>
                  <p className="text-muted-foreground">
                    {state.selectedTalam.aksharas} Mātrās
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center p-6 bg-gradient-subtle/50 rounded-xl border border-border/30">
                  {Array.from({ length: state.selectedTalam.aksharas }).map((_, index) => (
                    <div
                      key={index}
                      className={getBeatStyle(index)}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="text-sm font-medium">Sam</span>
                  </div>
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg ml-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">Tāli</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>


        {/* Talam Structure Info */}
        <Card className="p-8 shadow-soft border-0 bg-card/80 backdrop-blur-sm mt-8">
          <h3 className="text-2xl font-display font-semibold mb-8 text-center text-foreground">
            Tāla Structure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {state.selectedTalam.structure.map((component, index) => (
              <div key={index} className="text-center p-6 bg-gradient-subtle/30 rounded-xl border border-border/30 hover:shadow-soft transition-all duration-200">
                <div className="text-4xl font-display font-bold mb-3 bg-gradient-accent bg-clip-text text-transparent">
                  {component.symbol}
                </div>
                <div className="font-display font-semibold text-lg text-foreground mb-2">
                  {component.component}
                </div>
                <div className="text-muted-foreground font-medium">
                  {component.beats} mātrā{component.beats !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};