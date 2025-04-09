import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native"; 
import axios from 'axios';



const monsterImages = [
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230983/kispd3yrq5srohe7igiq.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230983/ge9k5tou73ewuklcqm50.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230983/febrt8lvztd9bdvcevvj.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230983/vuq0uiogmwpwphu3ojjv.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230983/as5jwm7hmqfjspkwa3ng.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230983/d8igeytxubnh7uzxtloy.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230984/cd0bu5tv2hjpdnkhqpt0.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230984/eetdplixjfmwc9x3rswt.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230984/o0jznyskonwlv760motq.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230984/gjtdrsiqb2ayh1fgypp7.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230984/mbz3e9xlteajf4c4amet.png)",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230984/bppokd0ezyxaszydnsij.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230984/iaki2kcykalwspdupf3u.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230984/gsljngkr400tywz3ailf.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230984/fedgeubk3m8yr8qjqbac.png",
  "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230993/grrisvojafjgzctdpxu5.png",
];

const ITEMS_PER_PAGE = 9; 

const ChoosePetPage = () => {
  const route = useRoute();           
  const { email } = route.params;
  const [selectedPet, setSelectedPet] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const navigation = useNavigation();  

  const totalPages = Math.ceil(monsterImages.length / ITEMS_PER_PAGE);

  const handleSelectPet = (index) => {
    setSelectedPet(index);
  };

  const handleConfirmPet = async () => {
    if (selectedPet !== null) {
      try {
        const chosenPetImageURL = monsterImages[selectedPet];  
  
        console.log("Chosen pet URL:", chosenPetImageURL);
  
        await axios.post('http://localhost:3000/savePet', {
          email: email,
          selectedPet: chosenPetImageURL,   
          petLevel: 1,
          petName: "No Name",
          petCurrency: 0
        
        });
  
        navigation.navigate("ProfileCreationCompletePage", { pet: chosenPetImageURL }); 
  
      } catch (error) {
        console.error("Error saving pet:", error);
        Alert.alert("Failed to save pet. Please try again.");
      }
    } else {
      Alert.alert("Please select a pet before continuing.");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMonsters = monsterImages.slice(startIndex, endIndex);

  const renderItem = ({ item, index }) => {
    const globalIndex = startIndex + index;
    return (
      <TouchableOpacity
        onPress={() => handleSelectPet(globalIndex)}
        style={[
          styles.petOption,
          selectedPet === globalIndex && styles.selectedPet,
        ]}
      >
        <Image source={{ uri: item }} style={styles.petImage} />
        <Text style={styles.petLabel}>Monster {globalIndex + 1}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Pet</Text>
      <Text style={styles.subtitle}>Select a pet to start your journey!</Text>

      <FlatList
        data={currentMonsters}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={styles.petOptionsContainer}
      />

      <View style={styles.paginationContainer}>
        <TouchableOpacity onPress={handlePreviousPage} disabled={currentPage === 0}>
          <Text style={[styles.paginationArrow, currentPage === 0 && styles.disabledArrow]}>
            {"←"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageNumber}>{currentPage + 1} / {totalPages}</Text>

        <TouchableOpacity onPress={handleNextPage} disabled={currentPage === totalPages - 1}>
          <Text style={[styles.paginationArrow, currentPage === totalPages - 1 && styles.disabledArrow]}>
            {"→"}
          </Text>
        </TouchableOpacity>
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
    backgroundColor: "#2d3748",
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#68d391',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  petOptionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexGrow: 1, 
  },
  petOption: {
    backgroundColor: '#4a5568',
    padding: 15,           
    borderRadius: 10,       
    margin: 10,             
    width: 100,             
    height: 120,            
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPet: {
    borderWidth: 3,
    borderColor: '#68d391',
  },
  petImage: {
    width: 70,             
    height: 70,
    borderRadius: 10,
    marginBottom: 5,
  },
  petLabel: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#68d391',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20, 
  },
  confirmButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationArrow: {
    fontSize: 30,
    color: '#68d391',
    paddingHorizontal: 20,
  },
  disabledArrow: {
    color: '#718096',
  },
  pageNumber: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChoosePetPage;
