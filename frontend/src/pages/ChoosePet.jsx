import React, { useState } from "react";
import { Box, HStack, VStack, Heading, Button, Text, Image, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

// Pet options
const petOptions = [
  { name: "Dog", image: "/images/dog.png" },
  { name: "Cat", image: "/images/cat.png" },
  { name: "Bird", image: "/images/bird.png" },
];

const ChoosePetPage = () => {
  const [selectedPet, setSelectedPet] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSelectPet = (petName) => {
    setSelectedPet(petName);
  };

  const handleConfirmPet = () => {
    navigate("/profile-complete"); // Redirect to Profile Completion Page
  };
  

  return (
    <Box
      minH="100vh"
      bg="gray.800"
      color="green.300"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
    >
      <Heading size="2xl" fontWeight="bold" mb={4}>Choose Your Pet</Heading>
      <Text mb={6}>Select a pet to start your journey!</Text>

      <HStack spacing={8}>
        {petOptions.map((pet) => (
          <Box
            key={pet.name}
            onClick={() => handleSelectPet(pet.name)}
            borderWidth={selectedPet === pet.name ? "4px" : "2px"}
            borderColor={selectedPet === pet.name ? "green.400" : "gray.500"}
            borderRadius="md"
            p={3}
            cursor="pointer"
            _hover={{ borderColor: "green.400" }}
            textAlign="center"
          >
            <Image src={pet.image} alt={pet.name} boxSize="120px" />
            <Text fontSize="lg" fontWeight="bold" mt={2}>{pet.name}</Text>
          </Box>
        ))}
      </HStack>

      {/* Confirm Button Below */}
      <Button
        mt={8}
        width="full"
        maxW="300px"
        bg="green.400"
        color="black"
        borderRadius="md"
        fontSize="lg"
        fontWeight="bold"
        _hover={{ bg: "green.500" }}
        onClick={handleConfirmPet}
      >
        Confirm Selection
      </Button>
    </Box>
  );
};

export default ChoosePetPage;
