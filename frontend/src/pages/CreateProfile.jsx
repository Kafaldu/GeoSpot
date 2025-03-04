import React, { useState } from "react";
import { Box, VStack, Heading, Input, Button, Text, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig"; 
import { doc, setDoc, Timestamp } from "firebase/firestore"; 

const CreateProfilePage = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
  });
  const [error, setError] = useState(""); 
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log(" Navigating to /choose-pet...");
    navigate("/choose-pet"); 
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
      <Heading size="2xl" fontWeight="bold" mb={4}>Complete Your Profile</Heading>
      <Text mb={6}>Enter your details to continue</Text>

      <Box
        as="form"
        onSubmit={handleSubmit}
        w="90%"
        maxW="400px"
        p={5}
        bg="gray.700"
        borderRadius="md"
        shadow="md"
      >
        <VStack spacing={4}>
          <Input
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            placeholder="First Name"
            bg="green.400"
            color="black"
            borderRadius="md"
            _placeholder={{ color: "black" }}
          />

          <Input
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            bg="green.400"
            color="black"
            borderRadius="md"
            _placeholder={{ color: "black" }}
          />

          <Input
            name="birthday"
            type="date"
            value={profile.birthday}
            onChange={handleChange}
            placeholder="Birthday"
            bg="green.400"
            color="black"
            borderRadius="md"
            _placeholder={{ color: "black" }}
          />

          {error && <Text color="red.500">{error}</Text>}

          <Button
            type="submit"
            width="full"
            bg="green.400"
            color="black"
            borderRadius="md"
            fontSize="lg"
            fontWeight="bold"
            _hover={{ bg: "green.500" }}
          >
            Continue
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default CreateProfilePage;
