import React, { useState } from "react";
import { Box, Container, Input, useColorModeValue, VStack, Heading, Button, Text } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { useUserStore } from "../creator/user"; // Import the user store
import { auth, googleProvider } from "../firebaseConfig"; // Import Firebase authentication
import { signInWithPopup } from "firebase/auth"; // Modular import

const SignUpPage = () => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); // Declare the error state
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false); // To toggle between regular and Google sign-up
  const { createUser } = useUserStore(); // Adjust this line to your user store
  const toast = useToast();

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    setError(""); // Reset error before new sign-up attempt

    const { success, message } = await createUser(newUser);
    if (!success) {
      setError(message); // Set error message if creation fails
      toast({
        title: "Error",
        description: message,
        status: "error",
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: message,
        status: "success",
        isClosable: true,
      });
      setNewUser({
        username: "",
        email: "",
        password: "",
      }); // Reset form if successful
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // Use the modular API's signInWithPopup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Handle user data (store, show, etc.)
      toast({
        title: "Success",
        description: "Successfully signed up with Google",
        status: "success",
        isClosable: true,
      });
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        isClosable: true,
      });
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
      {/* Title */}
      <Heading size="2xl" fontWeight="bold" mb={10}>Create an Account</Heading>

      {/* Icon */}
      <FaUserPlus size={50} color="green.300" mt={3} mb={8} /> {/* Adjusted mb for space below icon */}

      <Heading size="2xl" fontWeight="bold" mb={112}></Heading>


      {/* Toggle Button */}
      <Box display="flex" justifyContent="center" mb={4}>
        <Button
          onClick={() => setIsGoogleSignUp(false)}
          colorScheme={isGoogleSignUp ? "black" : "green"}
        >
          Regular Sign Up
        </Button>
        <Button
          onClick={() => setIsGoogleSignUp(true)}
          colorScheme={isGoogleSignUp ? "green" : "black"}
          ml={4}
        >
          Sign Up with Google
        </Button>
      </Box>



      {/* Sign Up Form */}
      <Box
        as="form"
        onSubmit={handleSignUp}
        w="90%"
        maxW="400px"
        mt={5}
        p={5}
        display="flex"
        flexDirection="column"
        alignItems="center"
        bg={"gray.700"}
        borderRadius="md"
        shadow="md"
      >
        {isGoogleSignUp ? (
          // Google Sign-Up Form (Button only)
          <Button
            onClick={handleGoogleSignUp}
            width="full"
            bg="green.400"
            color="black"
            borderRadius="md"
            fontSize="lg"
            fontWeight="bold"
            _hover={{ bg: "green.500" }}
          >
            Sign Up
          </Button>
        ) : (
          // Regular Sign-Up Form
          <VStack spacing={4} width="100%">
            {/* Username Input */}
            <Input
              name="username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Username"
              bg="green.400"
              color="black"
              borderRadius="md"
              _placeholder={{ color: "black" }}
            />

            {/* Email Input */}
            <Input
              name="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Email"
              bg="green.400"
              color="black"
              borderRadius="md"
              _placeholder={{ color: "black" }}
            />

            {/* Password Input */}
            <Input
              name="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Password"
              bg="green.400"
              color="black"
              borderRadius="md"
              _placeholder={{ color: "black" }}
            />

            {/* Error Message */}
            {error && <Text color="red.500">{error}</Text>} {/* Display error */}

            {/* Sign-Up Button */}
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
              Sign Up
            </Button>
          </VStack>
        )}
        <Heading  fontWeight="bold" mb={4}></Heading>
        {/* Link to Login page */}
        <Link to="/login">
          <Text
            as="span"
            color="blue.500"
            _hover={{ textDecoration: "underline" }}
            mb = {6}
          >
            Already have an account? Log in
          </Text>
        </Link>
      </Box>
    </Box>
  );
};

export default SignUpPage;
