import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";

const ProfileCreationCompletePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params; // Get the email from the route params

  const handleContinue = () => {
    Alert.alert("Profile Created", "You're all set! Continue to the User Profile page.");
    navigation.replace('HomeTabs', {
      screen: 'UserProfilePage',
      params: { email },  // make sure `email` is available in this scope
    });    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Creation Complete!</Text>
      <Text style={styles.subtitle}>You're all set! Click below to continue.</Text>

      <TouchableOpacity onPress={handleContinue} style={styles.button}>
        <Text style={styles.buttonText}>To User Profile Page</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',      
    backgroundColor: '#2d3748',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#68d391',
    marginBottom: 20,
    textAlign: 'center',  
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',  
  },
  button: {
    backgroundColor: '#68d391',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ProfileCreationCompletePage;
