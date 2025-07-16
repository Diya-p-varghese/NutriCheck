import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="addFood" />
      <Stack.Screen name="expiryTracker" />
      <Stack.Screen name="recipe" />
      <Stack.Screen name="tips" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="welcome" />
    </Stack>
  );
}
