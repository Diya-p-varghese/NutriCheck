import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";  // ✅ Correct navigation
import axios from "axios";

const API_URL = "http://192.168.1.35:5000/signup";  // ✅ Replace with your IP or Ngrok

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false); // 🔹 Loading state

  // ✅ Function to handle user signup
  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required!");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    setLoading(true); // 🔹 Show loading

    try {
      const response = await axios.post(API_URL, { email, password });

      console.log("Response:", response.data);  // Debugging API response

      if (response.data.message === "User created successfully") {
        if (Platform.OS === "web") {
          alert("Account created successfully!");
        } else {
          Alert.alert("Success", "Account created successfully!");
        }
        navigation.navigate("login");  // ✅ Use correct navigation
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      Alert.alert("Sign Up Failed", error.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false); // 🔹 Hide loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign Up</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />

      {/* Signup Button with Loading Indicator */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Navigate to Login */}
      <TouchableOpacity onPress={() => navigation.navigate("login")}>
        <Text style={styles.signupText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  signupText: {
    marginTop: 15,
    textAlign: "center",
    color: "blue",
  },
});