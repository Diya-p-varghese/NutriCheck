import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddFoodScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [selectedNutrients, setSelectedNutrients] = useState([]);
  const [nutrientValues, setNutrientValues] = useState({});
  const [imageUri, setImageUri] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedNutrient, setSelectedNutrient] = useState(null);
 
 
 
  const getLoggedInUserEmail = async () => {
    try {
      const email = await AsyncStorage.getItem("user_email");
      return email || "";
    } catch (error) {
      console.error("Failed to load email from AsyncStorage:", error);
      return "";
    }
  };
  
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem("user_email");
        if (email) {
          setUserEmail(email);
        }
      } catch (error) {
        console.error("Failed to load email from AsyncStorage:", error);
      }
    };
  
    fetchUserEmail();
  }, []);
  
  const nutrientOptions = [
    "Calories", "Protein", "Fat", "Carbohydrates",
    "Saturated Fat", "Sugars", "Salt", "Sodium",
    "Cholesterol", "Potassium"
  ];

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddNutrient = (nutrient) => {
    if (nutrient && !selectedNutrients.includes(nutrient)) {
      setSelectedNutrients([...selectedNutrients, nutrient]);
      setNutrientValues({ ...nutrientValues, [nutrient]: "" });
    }
    setSelectedNutrient(null);
  };

  const onChangeDate = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setExpiry(formatDate(date));
    }
  };

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? "0" + day : day}/${month < 10 ? "0" + month : month}/${year}`;
  };

  const handleSubmit = async () => {
    if (!name || !expiry || !quantity || !location || !userEmail) {
      alert("Please fill in all required fields.");
      return;
    }

    const foodData = {
      email: userEmail, // Include the logged-in user's email
      name,
      expiry,
      quantity,
      location,
      nutrients: nutrientValues,
      image_url: imageUri,
    };

    try {
      const response = await fetch("http://192.168.1.35:5000/addfood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(foodData),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Food added successfully!");
        router.push("/inventory");
      } else {
        alert(result.error || "Failed to add food.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.header}>Enter Food</Text>
      </View>
      
      <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
        <Ionicons name="camera-outline" size={20} color="white" />
        <Text style={styles.photoButtonText}>Take Photo</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <Text style={styles.label}>Item Name *</Text>
      <TextInput placeholder="Enter the Item Name" value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Expiry Date *</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={{ color: expiry ? "black" : "#ccc" }}>{expiry || "Select Expiry Date"}</Text>
      </TouchableOpacity>
      {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onChangeDate} />}

      <Text style={styles.label}>Quantity *</Text>
      <TextInput placeholder="Enter Quantity" value={quantity} onChangeText={setQuantity} style={styles.input} keyboardType="numeric" />

      <Text style={styles.label}>Storage Location *</Text>
      <TextInput placeholder="Enter Location" value={location} onChangeText={setLocation} style={styles.input} />

      <Text style={styles.label}>Select Nutritional Values</Text>
      <Picker selectedValue={selectedNutrient} 
  onValueChange={handleAddNutrient} 
  style={styles.pickerContainer}
>
  <Picker.Item label="Select a Nutrient" value="" />
  {nutrientOptions.map((nutrient, index) => (
    <Picker.Item key={`${nutrient}-${index}`} label={nutrient} value={nutrient} />
  ))}
</Picker>

      {selectedNutrients.map((nutrient) => (
        <View key={nutrient}>
          <Text style={styles.label}>{`Enter ${nutrient} amount (g or kcal)`}</Text>
          <TextInput placeholder={`Enter ${nutrient} value`} value={nutrientValues[nutrient]} onChangeText={(value) => setNutrientValues({ ...nutrientValues, [nutrient]: value })} style={styles.input} keyboardType="numeric" />
        </View>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  backButton: { position: "absolute", left: 0 },
  header: { fontSize: 20, fontWeight: "bold" },
  photoButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#007BFF", padding: 10, borderRadius: 5, justifyContent: "center", marginVertical: 10 },
  photoButtonText: { color: "white", fontSize: 16, marginLeft: 5 },
  image: { width: "100%", height: 200, borderRadius: 10, marginTop: 10 },
  label: { fontWeight: "bold", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginTop: 5 },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginTop: 5 },
  submitButton: { backgroundColor: "#007BFF", padding: 15, borderRadius: 5, alignItems: "center", marginTop: 20 },
  submitButtonText: { color: "white", fontSize: 16 },
});
