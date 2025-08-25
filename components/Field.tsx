import { View, Text, TouchableOpacity } from "react-native";

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 14, marginBottom: 6 }}>{children}</Text>;
}

export function Button({ title, onPress, disabled }: { title: string; onPress: ()=>void; disabled?: boolean }) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled} 
      style={{ 
        backgroundColor: "black", 
        padding: 12, 
        borderRadius: 8, 
        opacity: disabled ? 0.6 : 1 
      }}
    >
      <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ 
      borderWidth: 1, 
      borderColor: "#ddd", 
      borderRadius: 12, 
      padding: 12,
      backgroundColor: "white",
      marginBottom: 16
    }}>
      {children}
    </View>
  );
}
