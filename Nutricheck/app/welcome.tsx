import React from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../assets/images/bck image.jpg")}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text style={{ fontSize: 30, fontWeight: "bold", color: "white" }}>
        NutriCheck
      </Text>
      <Text style={{ color: "white", marginVertical: 10 }}>
        Explore the app's features for fresh and healthy eating!
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: "#007BFF",
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
        onPress={() => router.push("/login")} 
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Get Started</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}