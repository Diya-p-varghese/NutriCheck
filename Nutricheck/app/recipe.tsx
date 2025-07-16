import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RecipeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("All Items");
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipesModalVisible, setRecipesModalVisible] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [expandedRecipeIndex, setExpandedRecipeIndex] = useState(null); // 🔥 NEW STATE

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const email = await AsyncStorage.getItem("user_email");
        if (!email) {
          setError("User email not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://192.168.1.35:5000/getFoodItems");
        const data = await response.json();

        if (data.success) {
          const userFoodItems = data.foodItems.filter(item => item.email === email);
          setFoodItems(userFoodItems);
        } else {
          setError("Failed to fetch food items.");
        }
      } catch (error) {
        setError("Error fetching food items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  const toggleSelection = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleGenerateRecipes = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    try {
      const response = await fetch("http://192.168.1.35:5000/generateRecipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: selectedItems }),
      });

      const data = await response.json();

      if (data.success) {
        let recipes = data.recipes;

        if (typeof recipes === "string") {
          try {
            recipes = JSON.parse(recipes.replace(/'/g, '"'));
          } catch (e) {
            console.error("Failed to parse recipes:", recipes);
            recipes = [];
          }
        }

        setGeneratedRecipes(recipes);
        setRecipesModalVisible(true);
        setExpandedRecipeIndex(null); // reset
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Server error. Try again later.");
      console.error("Server error:", err);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recipe Recommendation</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="gray" style={styles.searchIcon} />
          <TextInput
            placeholder="Search food items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab("All Items")}>
            <Text style={[styles.tabText, activeTab === "All Items" && styles.activeTab]}>
              All Items
            </Text>
          </TouchableOpacity>
        </View>

        {/* Select Food Items */}
        <Text style={styles.selectText}>Select food items to generate recipes.</Text>

        {/* Loading & Error Handling */}
        {loading ? (
          <ActivityIndicator size="large" color="#6A5ACD" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.listWrapper}>
            <FlatList
              data={foodItems}
              keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => toggleSelection(item.name)} style={styles.foodItem}>
                  <Ionicons
                    name={selectedItems.includes(item.name) ? "checkbox-outline" : "square-outline"}
                    size={20}
                    color="black"
                  />
                  <Text style={styles.foodText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}

        {/* Generate Recipe Button */}
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerateRecipes}>
          <Text style={styles.generateButtonText}>Generate Recipe</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Displaying Recipes */}
      <Modal 
        visible={recipesModalVisible}
        animationType="slide"
        onRequestClose={() => setRecipesModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Generated Recipes</Text>
          <ScrollView contentContainerStyle={styles.recipeList}>
            {Array.isArray(generatedRecipes) && generatedRecipes.length > 0 ? (
              generatedRecipes.map((recipe, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recipeCard}
                  onPress={() =>
                    setExpandedRecipeIndex(expandedRecipeIndex === index ? null : index)
                  }
                >
                  <Text style={styles.recipeTitle}>
                    {recipe.Name || `Recipe ${index + 1}`}
                  </Text>

                  {expandedRecipeIndex === index && (
                    <>
                      {recipe.Ingredients && (
                        <>
                          <Text style={styles.recipeLabel}>Ingredients:</Text>
                          <Text style={styles.recipeText}>
                            {Array.isArray(recipe.Ingredients)
                              ? recipe.Ingredients.join(", ")
                              : recipe.Ingredients}
                          </Text>
                        </>
                      )}

                      {recipe.Instructions && (
                        <>
                          <Text style={styles.recipeLabel}>Instructions:</Text>
                          <Text style={styles.recipeText}>{recipe.Instructions}</Text>
                        </>
                      )}

                      {recipe.Recipe && (
                        <>
                          <Text style={styles.recipeLabel}>Recipe Details:</Text>
                          <Text style={styles.recipeText}>{recipe.Recipe}</Text>
                        </>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.recipeText}>No recipes found or invalid format.</Text>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setRecipesModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Bottom Navigation */}
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
          <Ionicons name="book-outline" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/tips")}>
          <Ionicons name="bulb-outline" size={24} color="gray" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "white" },
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F3F3F3", borderRadius: 10,
    paddingHorizontal: 10, marginVertical: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 10 },
  tabs: { flexDirection: "row", marginBottom: 10 },
  tabText: { fontSize: 16, fontWeight: "500", color: "gray", marginRight: 20 },
  activeTab: { color: "#6A5ACD", textDecorationLine: "underline" },
  selectText: { fontSize: 14, fontWeight: "500", marginVertical: 10 },
  listWrapper: { flex: 1 },
  foodItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  foodText: { marginLeft: 10, fontSize: 16 },
  generateButton: {
    backgroundColor: "#6A5ACD",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  generateButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  listContainer: { paddingBottom: 20 },
  errorText: { color: "red", fontSize: 16, textAlign: "center", marginVertical: 10 },
  navbar: {
    flexDirection: "row", justifyContent: "space-around",
    width: "100%", height: 60,
    alignItems: "center", borderTopWidth: 1,
    borderColor: "#ddd", backgroundColor: "#fff",
  },
  modalContainer: {
    flex: 1, padding: 20, backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center",
  },
  recipeList: {
    paddingBottom: 20,
  },
  recipeCard: {
    padding: 15, borderWidth: 1,
    borderColor: "#ddd", borderRadius: 10,
    marginBottom: 10, backgroundColor: "#f9f9f9",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#6A5ACD",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white", fontSize: 16, fontWeight: "bold",
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  recipeLabel: {
    fontWeight: '600',
    marginTop: 8,
  },
  recipeText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
