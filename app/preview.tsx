import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTimerStore } from "@/store/useTimerStore";
import { Button, Card } from "@/components/Field";
import { useRouter } from "expo-router";
import { WorkoutJSON } from "@/lib/types";

export default function Preview() {
  const router = useRouter();
  const { workout: w } = useTimerStore();
  
  if (!w) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No workout data found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: 'blue', marginTop: 20 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalMinutes = Math.ceil(w.total_seconds / 60);
  const eventCount = w.timeline.length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16 }}>
        <Card>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
            {w.title}
          </Text>
          <Text style={{ fontSize: 16, color: '#666', marginBottom: 20 }}>
            {totalMinutes} minutes • {eventCount} events
          </Text>

          {/* Debug Badge */}
          {w.debug && (
            <View style={{ 
              backgroundColor: w.debug.used_ai ? '#34C759' : '#FF9500', 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              borderRadius: 16, 
              alignSelf: 'flex-start',
              marginBottom: 20
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                {w.debug.used_ai ? 'AI Generated' : 'Fallback'}
              </Text>
            </View>
          )}

          {/* Workout Summary */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Workout Summary
            </Text>
            <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
              {w.timeline.length} events with {w.timeline.filter(e => e.kind === 'work').length} work periods and {w.timeline.filter(e => e.kind === 'rest' || e.kind === 'round_rest').length} rest periods.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ 
                flex: 1, 
                backgroundColor: '#666', 
                padding: 16, 
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Back to Edit
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/timeline-preview')}
              style={{ 
                flex: 1, 
                backgroundColor: '#007AFF', 
                padding: 16, 
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Preview Timeline
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={() => router.push("/run")}
            style={{ 
              backgroundColor: '#34C759', 
              padding: 16, 
              borderRadius: 8, 
              alignItems: 'center',
              marginTop: 12
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Start Timer
            </Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}
