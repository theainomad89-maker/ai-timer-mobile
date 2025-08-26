import { ScrollView, View, Text } from "react-native";
import TimerRunner from "@/components/TimerRunner";
import { useTimerStore } from "@/store/useTimerStore";
import { useRouter } from "expo-router";
import { computeTotalSeconds, formatDuration } from "@/lib/timeline";

export default function Run(){
  const w = useTimerStore(s=>s.workout);
  const router = useRouter();
  
  if (!w) {
    router.replace("/");
    return null;
  }
  
  // Handle both timeline-based and legacy responses
  let totalTime = "";
  let blockInfo = "";
  
  if (w.timeline && Array.isArray(w.timeline)) {
    // New timeline-based format
    const totalSeconds = computeTotalSeconds(w.timeline);
    totalTime = formatDuration(totalSeconds);
    blockInfo = `${w.timeline.length} steps`;
  } else if (w.total_minutes && w.blocks) {
    // Legacy block-based format
    totalTime = `${w.total_minutes} minutes`;
    blockInfo = `${w.blocks.length} blocks`;
  } else {
    // Fallback
    totalTime = "Unknown duration";
    blockInfo = "Unknown structure";
  }
  
  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#f8f9fa', minHeight: '100%' }}>
      <View style={{ 
        backgroundColor: 'white', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd'
      }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
          {w.title}
        </Text>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
          {totalTime} • {blockInfo}
        </Text>
      </View>
      
      <TimerRunner />
    </ScrollView>
  );
}
