import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const CreateProfilePage = () => {
  const route = useRoute();            
  const { email } = route.params;       
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
  });
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const handleChange = (e, field) => {
    setProfile({ ...profile, [field]: e });
  };

  const handleSubmit = () => {
    if (!profile.firstName || !profile.lastName || !profile.birthday) {
      setError("Please fill all fields.");
      return;
    }

    // Handle form submission 
    console.log("Profile created:", profile);
    navigation.navigate("ChoosePetPage", { email: email }); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Enter your details to continue</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={profile.firstName}
          onChangeText={(e) => handleChange(e, "firstName")}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={profile.lastName}
          onChangeText={(e) => handleChange(e, "lastName")}
        />
        <TextInput
          style={styles.input}
          placeholder="Birthday"
          value={profile.birthday}
          onChangeText={(e) => handleChange(e, "birthday")}
          keyboardType="numeric"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2d3748",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#68d391",
    marginBottom: 20,
  },
  subtitle: {
    color: "#e2e8f0",
    marginBottom: 20,
    fontSize: 16,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#4a5568",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  input: {
    backgroundColor: "#48bb78",
    color: "black",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    width: "100%",
  },
  button: {
    backgroundColor: "#48bb78",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default CreateProfilePage;
