import React, { useState } from "react";
import { Box, Container, Input, useColorModeValue, VStack, Heading, Button, Text } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { useUserStore } from "../creator/user"; 
import { auth, googleProvider } from "../firebaseConfig"; 
import { signInWithPopup } from "firebase/auth"; 
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); 
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false); 
  const { createUser } = useUserStore(); 
  const toast = useToast();
  const navigate = useNavigate();


  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    console.log("🚀 Attempting to create user in MongoDB...");

    try {
      const { success, message } = await createUser(newUser);
      if (!success) {
        throw new Error(message); 
      }

      console.log("✅ User created in MongoDB:", newUser);

      toast({
        title: "Success!",
        description: "Account created! Redirecting...",
        status: "success",
        isClosable: true,
      });

      setTimeout(() => {
        navigate("/create-profile"); 
      }, 500);
    } catch (error) {
      console.error("❌ Sign Up Error:", error);
      setError(error.message);
      toast({
        title: "Sign Up Failed",
        description: error.message,
        status: "error",
        isClosable: true,
      });
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Use displayName or fallback to email if displayName is not available
      const username = user.displayName || user.email.split('@')[0]; // Using email prefix if displayName is empty
      console.log("✅ Google User Created:", user.email);

      // You can store the user data and navigate to a profile setup page
      const newUserData = {
        username: username,
        email: user.email,
        password: "", // No password needed for Google sign-up
      };

      // Create user in the store or backend if necessary
      const { success, message } = await createUser(newUserData);
      if (!success) {
        throw new Error(message);
      }

      toast({
        title: "Google Sign-Up Success!",
        description: "Redirecting to profile setup...",
        status: "success",
        isClosable: true,
      });

      setTimeout(() => {
        navigate("/create-profile"); // Redirect to profile setup page
      }, 500);
    } catch (error) {
      console.error("Google Sign Up Error:", error);
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

      <Heading size="2xl" fontWeight="bold" mb={10}></Heading>

      {/* Toggle Button */}
      <Box display="flex" justifyContent="center" mb={4} >
        <Button
          onClick={() => setIsGoogleSignUp(false)}
          colorScheme={isGoogleSignUp ? "gray" : "green"}
        >
          Password Sign Up
        </Button>
        <Button
          onClick={() => setIsGoogleSignUp(true)}
          colorScheme={isGoogleSignUp ? "green" : "gray"}
          ml={4}
        >
          Google Sign Up
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
            Sign Up with Google
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
            <Button type="submit" width="full" bg="green.400" color="black" borderRadius="md" fontSize="lg" fontWeight="bold" _hover={{ bg: "green.500" }}>
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
