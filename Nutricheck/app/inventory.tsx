import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function InventoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [foodItems, setFoodItems] = useState([]);
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredFoodItems(foodItems);
    } else {
      setFilteredFoodItems(
        foodItems.filter(item => 
          item.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, foodItems]);

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
        setFilteredFoodItems(userFoodItems);
      } else {
        alert("Failed to fetch food items.");
      }
    } catch (error) {
      console.error("Error fetching food items:", error);
      alert("Error fetching food items!");
    } finally {
      setLoading(false);
    }
  };

  const formatFieldName = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Food Inventory</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          placeholder="Search food items..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.sectionTitle}>Food Items</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
        data={filteredFoodItems}
        keyExtractor={(item) => item._id || item.name}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.foodCard}>
            <Image source={{ uri: item.image_url || "https://via.placeholder.com/100" }} style={styles.foodImage} />
            <Text style={styles.foodName}>{item.name}</Text>
            <View style={styles.foodDetails}>
              {Object.entries(item)
                .filter(([key]) => !["_id", "image_url", "name", "email", "nutrients", "status"].includes(key)) // Excluding "status"
                .map(([key, value]) => (
                  <Text key={key} style={styles.foodInfo}>
                    <Text style={styles.foodLabel}>{formatFieldName(key)}: </Text>
                    {value}
                  </Text>
                ))}
                
                {item.nutrients && (
                  <View style={styles.nutrientContainer}>
                    {Object.entries(item.nutrients).map(([nutrient, value]) => (
                      <Text key={nutrient} style={styles.foodInfo}>
                        <Text style={styles.foodLabel}>{formatFieldName(nutrient)}: </Text>
                        {value}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/addFood")}> 
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <View style={styles.navbarContainer}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => router.push("/profile")}> 
            <Ionicons name="person-outline" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/inventory")}> 
            <Ionicons name="list-outline" size={24} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/expiryTracker")}> 
            <Ionicons name="time-outline" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/recipe")}> 
            <Ionicons name="book-outline" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/tips")}> 
            <Ionicons name="bulb-outline" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", flex: 1 },
  settingsIcon: { position: "absolute", right: 0 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 10 },
  sectionTitle: { marginTop: 15, fontSize: 18, fontWeight: "bold" },
  foodCard: {
    width: 150,
    padding: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginRight: 10,
    marginTop: 10,
  },
  foodImage: { width: "100%", height: 100, borderRadius: 10, marginBottom: 5 },
  foodName: { fontWeight: "bold", fontSize: 16, textAlign: "center", marginBottom: 5 },
  foodDetails: { paddingHorizontal: 5 },
  foodInfo: { fontSize: 14, color: "gray", marginBottom: 2 },
  foodLabel: { fontWeight: "bold", color: "#000" },
  addButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 50,
    elevation: 5,
  },
  navbarContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    alignItems: "center",
    backgroundColor: "#fff",
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
  },})