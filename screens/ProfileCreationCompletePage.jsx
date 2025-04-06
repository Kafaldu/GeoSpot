import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const ProfileCreationCompletePage = () => {
  const handleContinue = () => {
    Alert.alert("Profile Created", "You're all set! Continue to the User Profile page.");
    navigation.navigate("UserProfilePage");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Creation Complete!</Text>
      <Text style={styles.subtitle}>You're all set! Click below to continue.</Text>

      <TouchableOpacity onPress={handleContinue} style={styles.button}>
        <Text style={styles.buttonText}>Continue to Profile</Text>
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
