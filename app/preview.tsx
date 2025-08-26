import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTimerStore } from "@/store/useTimerStore";
import { Button, Card } from "@/components/Field";
import { useRouter } from "expo-router";

export default function Preview(){
  const w = useTimerStore(s=>s.workout);
  const router = useRouter();
  
  if (!w) {
    router.replace("/");
    return null;
  }
  
  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#f8f9fa', minHeight: '100%' }}>
      <Card>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
          {w.title}
        </Text>
        <Text style={{ fontSize: 18, color: '#666', marginBottom: 20, textAlign: 'center' }}>
          {w.total_minutes} minutes
        </Text>
        
        {/* Debug Badge */}
        {w.debug && (
          <View style={{ 
            backgroundColor: w.debug.used_ai ? '#E8F5E8' : '#FFF3E0', 
            padding: 8, 
            borderRadius: 6, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: w.debug.used_ai ? '#4CAF50' : '#FF9800'
          }}>
            <Text style={{ 
              color: w.debug.used_ai ? '#2E7D32' : '#E65100', 
              fontSize: 12, 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {w.debug.used_ai ? "🤖 AI Generated" : "⚡ Deterministic Parse"}
              {w.debug.inferred_mode && ` • ${w.debug.inferred_mode}`}
              {w.debug.notes && ` • ${w.debug.notes}`}
            </Text>
          </View>
        )}
        
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Workout Structure:</Text>
          {w.blocks.map((b, i) => (
            <View key={i} style={{ 
              padding: 12, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 8, 
              marginBottom: 8 
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                {b.type}
              </Text>
              {b.title && (
                <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                  {b.title}
                </Text>
              )}
              
              {/* Block-specific details */}
              {b.type === "EMOM" && (
                <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                  {b.minutes} minutes • {b.instructions.map(x => 
                    x.minute_mod ? `${x.minute_mod}: ${x.name}` : x.name
                  ).join(" | ")}
                </Text>
              )}
              
              {b.type === "INTERVAL" && b.sequence && (
                <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                  Sets {b.sets} • {b.sequence.map(s => `${s.seconds}s ${s.name}`).join(" → ")}
                </Text>
              )}
              
              {b.type === "INTERVAL" && !b.sequence && (
                <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                  {b.sets}x {b.work_seconds}s / {b.rest_seconds}s
                </Text>
              )}
              
              {b.type === "CIRCUIT" && (
                <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                  {b.rounds} rounds • {b.exercises.map(e => 
                    e.seconds ? `${e.seconds}s ${e.name}` : e.name
                  ).join(", ")}
                </Text>
              )}
              
              {b.type === "TABATA" && (
                <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                  {b.rounds}x {b.work_seconds}/{b.rest_seconds}
                </Text>
              )}
              
              {b.notes && (
                <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                  {b.notes}
                </Text>
              )}
            </View>
          ))}
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
    </ScrollView>
  );
}
