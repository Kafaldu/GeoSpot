import React from "react";
import { Box, VStack, Heading, Button, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ProfileCreationCompletePage = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/User-Profile"); 
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
      <VStack spacing={6}>
        <Heading size="2xl" fontWeight="bold">
          Profile Creation Complete!
        </Heading>
        <Text fontSize="lg">You're all set! Click below to continue.</Text>

        <Button
          width="full"
          maxW="300px"
          bg="green.400"
          color="black"
          borderRadius="md"
          fontSize="lg"
          fontWeight="bold"
          _hover={{ bg: "green.500" }}
          onClick={handleContinue} 
        >
          Continue to Profile
        </Button>
      </VStack>
    </Box>
  );
};

export default ProfileCreationCompletePage;
