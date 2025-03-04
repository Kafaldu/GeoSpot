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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Get the logged-in user
    const user = auth.currentUser;
    if (!user) {
      setError("No user found. Please log in again.");
      return;
    }

    // Validate fields
    if (!profile.firstName || !profile.lastName || !profile.birthday) {
      setError("Please fill in all fields.");
      return;
    }

    // Set default user stats
    const userData = {
      uid: user.uid,
      firstName: profile.firstName,
      lastName: profile.lastName,
      birthday: profile.birthday,
      userLevel: 1, // Default level
      joinDate: Timestamp.now(), // Auto-set current date
      streakDays: 0, // Starts at 0
      spotsVisited: 0, // No spots yet
    };

    try {
      // Save user data in Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      toast({
        title: "Profile Created!",
        description: "Your account has been set up.",
        status: "success",
        isClosable: true,
      });

      // Redirect to the pet selection page
      navigate("/choose-pet");
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to create profile. Please try again.");
    }
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
