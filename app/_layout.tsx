import { Stack } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";

export default function Layout(){
  useKeepAwake();
  return (
    <Stack 
      screenOptions={{ 
        headerTitle: "AI Timer",
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }} 
    />
  );
}
