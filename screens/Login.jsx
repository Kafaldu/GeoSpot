import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';



const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const handleSubmit = async () => {
    setError("");
  
    try {
      const result = await axios.post('http://localhost:3000/login', { email, password });
  
      if (result.data.message === "Success") {
        
        await AsyncStorage.removeItem('user');
  
        
        const loggedInEmail = result.data.user.email;
        const loggedInUid = result.data.user.uid;
  
        await AsyncStorage.setItem('user', JSON.stringify({
          email: loggedInEmail,
          uid: loggedInUid,
          username: result.data.user.username,
        }));
        
    
        await AsyncStorage.setItem('userEmail', loggedInEmail);
        await AsyncStorage.setItem('userUid', loggedInUid);
  
     
        navigation.navigate('HomeTabs', {
          screen: 'UserProfilePage',
          params: { email: loggedInEmail }
        });
      } else {
        setError(result.data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again later.");
    }
  };
  
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <FontAwesome name="user-plus" size={50} color="#68d391" style={styles.icon} />
      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="black"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="black"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.link}>
                Don't have an account? Sign up
            </Text>
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.link}>
            Forgot your password?
          </Text>
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
  icon: {
    marginBottom: 20,
  },
  form: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#4a5568",
    borderRadius: 12,
    padding: 20,
  },
  input: {
    backgroundColor: "#48bb78",
    color: "black",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#48bb78",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  link: {
    color: "#3182ce",
    marginTop: 15,
    textAlign: "center",
    textDecorationLine: "underline",
  }  
});

export default Login;
