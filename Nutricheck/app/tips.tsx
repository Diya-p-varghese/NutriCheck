import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function TipsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const tips = [
    {
      id: "1",
      title: "Keep Produce Fresh",
      description: "Essential Tips for Storing Food Safely at Home.",
      image: "https://via.placeholder.com/150",
      buttonText: "Learn More",
    },
    {
      id: "2",
      title: "Decode Expiry Dates",
      description: "Understand the difference between 'best by' and 'use by' dates.",
      image: "https://via.placeholder.com/150",
      buttonText: "Read Tips",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tips</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Tips List */}
      <FlatList
        data={tips}
        keyExtractor={(item) => item.id}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            <TouchableOpacity style={styles.cardButton}>
              <Text style={styles.cardButtonText}>{item.buttonText}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Bottom Navigation */}
      <View style={styles.navbarContainer}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Ionicons name="person-outline" size={24} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/inventory")}>
            <Ionicons name="list-outline" size={24} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/expiryTracker")}>
            <Ionicons name="time-outline" size={24} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/recipe")}>
            <Ionicons name="book-outline" size={24} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/tips")}>
            <Ionicons name="bulb-outline" size={24} color="blue" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    width: "90%",  // Reduced width
    height: "85%", // Reduced height
    padding: 15,
    alignSelf: "center", // Center the container
    borderRadius: 10, // Optional: gives a rounded look
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    width: 180,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  cardDescription: {
    fontSize: 13,
    color: "gray",
    marginVertical: 5,
  },
  cardButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#6A5ACD",
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  cardButtonText: {
    color: "#6A5ACD",
    fontSize: 12,
    fontWeight: "bold",
  },
  navbarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: width,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    height: 60,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
});
