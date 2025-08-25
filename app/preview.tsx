import { View, Text, ScrollView } from "react-native";
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
              {b.notes && (
                <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                  {b.notes}
                </Text>
              )}
            </View>
          ))}
        </View>
        
        <Button title="Start Workout" onPress={()=> router.push("/run")} />
        
        <View style={{ height: 16 }} />
        
        <Button 
          title="Back to Edit" 
          onPress={()=> router.back()} 
        />
      </Card>
    </ScrollView>
  );
}
