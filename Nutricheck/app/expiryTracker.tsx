import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function ExpiryTrackerScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [foodItems, setFoodItems] = useState([]);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const email = await AsyncStorage.getItem("user_email");
      if (!email) {
        alert("User email not found. Please log in again.");
        return;
      }

      const response = await fetch("http://192.168.1.35:5000/getFoodItems");
      const data = await response.json();

      if (data.success) {
        const userFoodItems = data.foodItems.filter(item => item.email === email);
        setFoodItems(userFoodItems);
      } else {
        console.error("Failed to fetch food items:", data.error);
      }
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  };

  const filteredItems = foodItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expiring Food</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          placeholder="Search food items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

<FlatList
  data={filteredItems}
  keyExtractor={(item) => item._id || Math.random().toString()}
  renderItem={({ item }) => {
    const gradientColors = getGradientColors(item.status);

    return (
      <LinearGradient colors={gradientColors} style={styles.foodCard}
      start={{ x: 1, y: 0 }} 
      end={{ x: 0, y: 0 }}>
        <Image
          source={{ uri: item.image_url || "https://via.placeholder.com/100x100?text=Food" }}
          style={styles.foodImage}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodInfo}>Expiry: {item.expiry}</Text>
          <Text style={[styles.foodStatus, { color: gradientColors[0] }]}>
            {item.status}
          </Text>
        </View>
        <TouchableOpacity style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>
    );
  }}
/>

    {/* Bottom Navigation */}
    <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Ionicons name="person-outline" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/inventory")}>
          <Ionicons name="list-outline" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/expiryTracker")}>
          <Ionicons name="time-outline" size={24} color="blue" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/recipe")}>
          <Ionicons name="book-outline" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/tips")}>
          <Ionicons name="bulb-outline" size={24} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getGradientColors = (status) => {
  switch (status) {
    case "Expiring Today":
      return ["#D32F2F", "#FFCDD2"]; // Light red → Dark red
    case "Expiring Soon":
      return ["#FBC02D", "#FFF9C4"];; // Light orange → Dark orange
    case "Urgent":
      return ["#FB8C00", "#FFE0B2"];; // Pale yellow → Rich yellow #FBC02D
    case "Expired":
      return ["#757575", "#EEEEEE"]; // Light grey → Dark grey
    default:
      return ["#2E7D32", "#C8E6C9"]; // Soft green → Deep green
  }
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
  },
  foodCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  foodInfo: {
    color: "gray",
  },
  foodStatus: {
    fontSize: 14,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#E0E4FF",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#3F51B5",
    fontWeight: "bold",
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
