import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTimerStore } from "../store/useTimerStore";
import { computeTotalSeconds, formatDuration } from "../lib/timeline";

export default function Preview() {
  const { workout } = useTimerStore();
  const router = useRouter();

  if (!workout) {
    router.replace("/");
    return null;
  }

  const totalSeconds = computeTotalSeconds(workout.timeline);
  const totalFormatted = formatDuration(totalSeconds);

  // Derive simple stats from timeline for display
  const workItems = workout.timeline.filter(item => item.kind === 'work');
  const restItems = workout.timeline.filter(item => item.kind === 'rest');
  const roundRestItems = workout.timeline.filter(item => item.kind === 'round_rest');
  
  const rounds = workout.timeline[0]?.round || 1;
  const avgWorkTime = workItems.length > 0 ? Math.round(workItems.reduce((sum, item) => sum + item.seconds, 0) / workItems.length) : 0;
  const avgRestTime = restItems.length > 0 ? Math.round(restItems.reduce((sum, item) => sum + item.seconds, 0) / restItems.length) : 0;
  const roundRestTime = roundRestItems.length > 0 ? roundRestItems[0]?.seconds || 0 : 0;

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
          {workout.title}
        </Text>
        
        <Text style={{ fontSize: 18, color: "#666", marginBottom: 16 }}>
          {totalFormatted} total
        </Text>

        {/* Debug badge */}
        {workout.debug && (
          <View style={{ 
            backgroundColor: workout.debug.used_ai ? "#e8f5e8" : "#fff3cd", 
            padding: 8, 
            borderRadius: 6, 
            marginBottom: 16 
          }}>
            <Text style={{ 
              color: workout.debug.used_ai ? "#0a0" : "#a60", 
              fontSize: 14 
            }}>
              {workout.debug.used_ai ? "🤖 AI Generated" : "⚡ Deterministic Parse"} 
              {workout.debug.inferred_mode ? ` • ${workout.debug.inferred_mode}` : ""} 
              {workout.debug.notes ? ` • ${workout.debug.notes}` : ""}
            </Text>
          </View>
        )}

        {/* Workout summary */}
        <View style={{ 
          backgroundColor: "#f8f9fa", 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 16 
        }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Workout Summary
          </Text>
          <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
            {rounds} rounds • {workItems.length} exercises
          </Text>
          {avgWorkTime > 0 && (
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
              {avgWorkTime}s work intervals
            </Text>
          )}
          {avgRestTime > 0 && (
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
              {avgRestTime}s rest between exercises
            </Text>
          )}
          {roundRestTime > 0 && (
            <Text style={{ fontSize: 14, color: "#666" }}>
              {formatDuration(roundRestTime)} rest between rounds
            </Text>
          )}
        </View>

        {/* Timeline preview */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Timeline Preview
          </Text>
          {workout.timeline.slice(0, 10).map((item, index) => (
            <View key={index} style={{ 
              flexDirection: "row", 
              justifyContent: "space-between", 
              paddingVertical: 4,
              borderBottomWidth: 1,
              borderBottomColor: "#eee"
            }}>
              <Text style={{ 
                fontSize: 14, 
                color: item.kind === 'work' ? "#000" : "#666",
                fontWeight: item.kind === 'work' ? "500" : "400"
              }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: 14, color: "#666" }}>
                {item.seconds}s
              </Text>
            </View>
          ))}
          {workout.timeline.length > 10 && (
            <Text style={{ fontSize: 14, color: "#999", textAlign: "center", marginTop: 8 }}>
              ... and {workout.timeline.length - 10} more items
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: "#007AFF",
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={() => router.push("/run")}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
          Start Workout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
