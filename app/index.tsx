import { useState } from "react";
import { View, TextInput, ScrollView, Text, Alert, TouchableOpacity } from "react-native";
import { Label, Button, Card } from "@/components/Field";
import { generateFromText } from "@/lib/api";
import { buildTimeline } from "@/lib/timeline";
import type { WorkoutJSON } from "@/lib/types";
import { useTimerStore } from "@/store/useTimerStore";
import { useRouter } from "expo-router";

export default function Index(){
  const [text, setText] = useState("20-min EMOM. Odd: 12 burpees. Even: 45s plank.");
  const [loading, setLoading] = useState(false);
  const [userLevel, setUserLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const setWorkout = useTimerStore(s=>s.setWorkout);
  const router = useRouter();

  async function onGenerate(){
    if (!text.trim()) {
      Alert.alert("Error", "Please describe your workout");
      return;
    }
    
    setLoading(true);
    try {
      const w: WorkoutJSON = await generateFromText(text, { level: userLevel });
      const tl = buildTimeline(w);
      setWorkout(w, tl);
      router.push("/preview");
    } catch (e:any) {
      Alert.alert("Error", e.message || "Failed to generate workout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#f8f9fa', minHeight: '100%' }}>
      <Card>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' }}>
          AI Workout Timer
        </Text>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' }}>
          Describe your workout and get a smart timer with voice cues
        </Text>
        
        <Label>Fitness Level</Label>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {(["beginner", "intermediate", "advanced"] as const).map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setUserLevel(level)}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 6,
                backgroundColor: userLevel === level ? '#007AFF' : '#E5E5EA',
                alignItems: 'center'
              }}
            >
              <Text style={{ 
                color: userLevel === level ? 'white' : '#8E8E93',
                fontWeight: userLevel === level ? '600' : '400',
                textTransform: 'capitalize'
              }}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Label>Describe your workout</Label>
        <TextInput 
          value={text} 
          onChangeText={setText} 
          multiline 
          style={{ 
            minHeight: 140, 
            borderWidth: 1, 
            borderColor: "#ddd", 
            borderRadius: 8, 
            padding: 12,
            fontSize: 16,
            textAlignVertical: 'top'
          }} 
          placeholder="e.g., 20-min EMOM. Odd: 12 burpees. Even: 45s plank."
        />
        
        <View style={{ height: 16 }} />
        
        <Button 
          title={loading ? "Generating..." : "Generate Timer"} 
          onPress={onGenerate} 
          disabled={loading} 
        />
        
        <View style={{ height: 16 }} />
        
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          Supports: EMOM, Intervals, Circuits, Tabata
        </Text>
      </Card>
    </ScrollView>
  );
}
