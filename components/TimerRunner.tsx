import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Vibration } from "react-native";
import { useTimerStore } from "@/store/useTimerStore";
import { msToClock } from "@/lib/timeline";
import * as Speech from "expo-speech";

export default function TimerRunner(){
  const tl = useTimerStore(s=>s.timeline);
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startRef = useRef<number|null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  const current = tl[idx];
  const total = current ? (current.endMs - current.startMs) : 0;
  const remaining = current ? Math.max(0, total - now) : 0;

  useEffect(()=>{
    if (!isRunning) return;
    
    const start = Date.now();
    startRef.current = start;
    const loop = ()=>{
      const t = Date.now();
      setNow(t - (startRef.current || t));
      if (current && (t - (startRef.current || t)) >= current.endMs){
        setIdx(i => (i+1 < tl.length ? i+1 : i));
        startRef.current = Date.now();
        setNow(0);
      }
      rafRef.current = requestAnimationFrame(loop as any);
    };
    rafRef.current = requestAnimationFrame(loop as any);
    return ()=> {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [tl.length, isRunning, current]);

  useEffect(()=>{
    if (!current || !isRunning) return;
    try {
      Speech.speak(current.label, { rate: 1.0 });
      Vibration.vibrate(50);
      
      // Five second warning
      if (total > 5000) {
        const timeout = setTimeout(()=> {
          if (isRunning) {
            Speech.speak("five seconds", { rate: 1.0 });
            Vibration.vibrate([100, 100, 100]);
          }
        }, Math.max(0, total - 5000));
        return ()=> clearTimeout(timeout);
      }
    } catch {}
  }, [idx, current, total, isRunning]);

  const startTimer = () => {
    setIsRunning(true);
    setNow(0);
    startRef.current = Date.now();
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIdx(0);
    setNow(0);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  if (!current) return null;
  const pct = total ? (1 - (remaining/total)) * 100 : 0;

  return (
    <View style={{ 
      borderWidth:1, 
      borderColor:'#ddd', 
      borderRadius:12, 
      padding:16, 
      marginTop:12,
      backgroundColor: 'white'
    }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{current.label}</Text>
      <Text style={{ fontSize: 48, fontWeight: '800', marginVertical: 8, textAlign: 'center' }}>
        {msToClock(remaining)}
      </Text>
      
      {/* Progress bar */}
      <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: '#000' }} />
      </View>
      
      {/* Control buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TouchableOpacity 
          onPress={isRunning ? pauseTimer : startTimer} 
          style={{ 
            flex: 1,
            padding: 12, 
            backgroundColor: isRunning ? '#ff4444' : '#44aa44',
            borderRadius: 8 
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            {isRunning ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={resetTimer} 
          style={{ 
            flex: 1,
            padding: 12, 
            backgroundColor: '#666',
            borderRadius: 8 
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Reset</Text>
        </TouchableOpacity>
      </View>
      
      {/* Navigation buttons */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity 
          onPress={()=> setIdx(i=> Math.max(0, i-1))} 
          style={{ 
            flex: 1,
            padding:10, 
            borderWidth:1, 
            borderRadius:8,
            borderColor: '#ddd'
          }}
        >
          <Text style={{ textAlign: 'center' }}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={()=> setIdx(i=> Math.min(tl.length-1, i+1))} 
          style={{ 
            flex: 1,
            padding:10, 
            borderWidth:1, 
            borderRadius:8,
            borderColor: '#ddd'
          }}
        >
          <Text style={{ textAlign: 'center' }}>Next</Text>
        </TouchableOpacity>
      </View>
      
      {/* Progress indicator */}
      <Text style={{ textAlign: 'center', marginTop: 12, color: '#666' }}>
        {idx + 1} of {tl.length}
      </Text>
    </View>
  );
}
