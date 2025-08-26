import { ScrollView, View, Text } from "react-native";
import TimerRunner from "@/components/TimerRunner";
import { useTimerStore } from "@/store/useTimerStore";
import { useRouter } from "expo-router";

export default function Run(){
  const w = useTimerStore(s=>s.workout);
  const router = useRouter();
  
  if (!w) {
    router.replace("/");
    return null;
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
          {w.total_minutes} minutes • {w.blocks.length} blocks
        </Text>
      </View>
      
      <TimerRunner />
    </ScrollView>
  );
}
