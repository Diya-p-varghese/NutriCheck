import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("Loading...");
  const [photoURL, setPhotoURL] = useState(null);
  const [theme, setTheme] = useState("light");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = await AsyncStorage.getItem("user_email");
        const userProfile = await AsyncStorage.getItem("user_photo");
        const storedTheme = await AsyncStorage.getItem("theme");

        if (userEmail) {
          setEmail(userEmail);
          setPhotoURL(userProfile || null);
        } else {
          router.replace("/login");
        }

        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const setAppTheme = async (selectedTheme) => {
    setTheme(selectedTheme);
    await AsyncStorage.setItem("theme", selectedTheme);
    setModalVisible(false);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user_email");
    await AsyncStorage.removeItem("user_photo");
    await AsyncStorage.removeItem("theme");
    router.replace("/login");
  };

  return (
    <SafeAreaView style={[styles.safeContainer, theme === "dark" ? darkStyles.container : lightStyles.container]}>
      <View style={[styles.header, theme === "dark" ? darkStyles.header : lightStyles.header]}>
        <Image source={require("../assets/images/dummy-profile.png")} style={styles.profileImage} />
        <View style={styles.userInfo}>
          <Text style={[styles.userEmail, theme === "dark" ? darkStyles.text : lightStyles.text]}>{email}</Text>
        </View>
      </View>

    {/* Theme Selection Button */}
<TouchableOpacity style={styles.themeOption} onPress={() => setModalVisible(true)}>
  <View style={styles.themeContainer}>
    <Ionicons name="color-palette-outline" size={24} color={theme === "dark" ? "white" : "black"} />
    <Text style={[styles.themeText, theme === "dark" ? darkStyles.text : lightStyles.text]}>
      Theme
    </Text>
    <Text style={[styles.themeText, theme === "dark" ? darkStyles.text : lightStyles.text]}>
      {theme.charAt(0).toUpperCase() + theme.slice(1)}
    </Text>
  </View>
</TouchableOpacity>



      {/* Theme Selection Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Theme</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => setAppTheme("light")}> 
              <Ionicons name={theme === "light" ? "radio-button-on" : "radio-button-off"} size={24} color="green" />
              <Text style={styles.optionText}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => setAppTheme("dark")}> 
              <Ionicons name={theme === "dark" ? "radio-button-on" : "radio-button-off"} size={24} color="green" />
              <Text style={styles.optionText}>Dark</Text>
            </TouchableOpacity>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Button */}
      <TouchableOpacity style={[styles.logoutButton, theme === "dark" ? darkStyles.button : lightStyles.button]} onPress={logout}>
        <Text style={[styles.logoutText, theme === "dark" ? darkStyles.buttonText : lightStyles.buttonText]}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, justifyContent: "space-between" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1 },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  userInfo: { flex: 1 },
  userEmail: { fontSize: 16, fontWeight: "bold" },
  themeOption: { padding: 20, flexDirection: "row", justifyContent: "space-between" ,backgroundColor: "transparent"},
  themeText: { fontSize: 18, fontWeight: "bold" },
  themeContainer: {flexDirection: "row",alignItems: "center",gap: 10,marginBottom:500},
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: 300 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalOption: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  optionText: { fontSize: 16, marginLeft: 10 },
  modalActions: { marginTop: 10, alignItems: "flex-end" },
  cancelText: { fontSize: 16, color: "red" },
  logoutButton: { padding: 15, margin: 20, borderRadius: 10, alignItems: "center" },
  logoutText: { fontSize: 16, fontWeight: "bold" },
});

const lightStyles = StyleSheet.create({ container: { backgroundColor: "#FFFFFF" }, text: { color: "#333" }, button: { backgroundColor: "#E63946" }, buttonText: { color: "white" } });
const darkStyles = StyleSheet.create({ container: { backgroundColor: "#121212" }, text: { color: "#FFFFFF" }, button: { backgroundColor: "#E63946" }, buttonText: { color: "#121212" } });