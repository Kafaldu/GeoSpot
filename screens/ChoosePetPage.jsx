import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";  

const ChoosePetPage = () => {
  const [selectedPet, setSelectedPet] = useState(null);
  const navigation = useNavigation();  

  const handleSelectPet = (petName) => {
    setSelectedPet(petName);
  };

  const handleConfirmPet = () => {
    if (selectedPet) {
      navigation.navigate("ProfileCreationCompletePage");  
    } else {
      Alert.alert("Please select a pet before continuing.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Pet</Text>
      <Text style={styles.subtitle}>Select a pet to start your journey!</Text>

      <View style={styles.petOptionsContainer}>
        {["Dog", "Cat", "Bird"].map((pet) => (
          <TouchableOpacity
            key={pet}
            onPress={() => handleSelectPet(pet)}
            style={[
              styles.petOption,
              selectedPet === pet ? styles.selectedPet : null,
            ]}
          >
            <View style={styles.imageContainer}>
              <Text style={styles.petName}>{pet}</Text>
            </View>
            <Text>{pet}</Text>  
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleConfirmPet} style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Confirm Selection</Text>
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
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  petOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  petOption: {
    backgroundColor: '#4a5568',
    padding: 10,
    borderRadius: 8,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPet: {
    borderWidth: 2,
    borderColor: '#68d391',
  },
  imageContainer: {
    backgroundColor: '#cbd5e0',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  petName: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#68d391',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ChoosePetPage;
