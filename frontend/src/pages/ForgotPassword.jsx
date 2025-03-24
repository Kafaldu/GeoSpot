import { useState } from "react";
import { Box, Button, Input, Text, VStack, Heading, Icon, useToast } from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

const ForgotPassword = () => {
  // State management for form data and UI states
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Handle password reset request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      // Show error if email is empty
      toast({
        title: "Error",
        description: "Please enter your email address",
        status: "error",
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // First check if the email exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length === 0) {
        // No account found with this email
        toast({
          title: "Error",
          description: "No account found with this email address.",
          status: "error",
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      // If email exists, send password reset email
      await sendPasswordResetEmail(auth, email);
      
      // Show success message
      toast({
        title: "Success",
        description: "Password reset email sent. Please check your inbox.",
        status: "success",
        isClosable: true,
      });
      // Clear the email field after successful submission
      setEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      // Handle different types of errors
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }

      // Show error message to user
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
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
      <Heading size="2xl" fontWeight="bold">
        Reset Password
      </Heading>

      {/* Lock Icon */}
      <Icon as={FaLock} boxSize={10} mt={3} />

      {/* Password Reset Form */}
      <Box
        as="form"
        onSubmit={handleSubmit}
        w="90%"
        maxW="400px"
        mt={5}
        p={5}
        display="flex"
        flexDirection="column"
        alignItems="center"
        bg="gray.700"
        borderRadius="md"
      >
        <VStack spacing={4} width="100%">
          {/* Instructions */}
          <Text fontSize="md" color="gray.400">
            Enter your email to receive reset instructions.
          </Text>
          
          {/* Email Input */}
          <Input
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            bg="green.400"
            color="black"
            borderRadius="md"
            _placeholder={{ color: "black" }}
            aria-label="Email Address"
            required
          />
          
          {/* Submit Button */}
          <Button
            type="submit"
            width="full"
            bg="green.400"
            color="black"
            borderRadius="md"
            fontSize="lg"
            fontWeight="bold"
            _hover={{ bg: "green.500" }}
            isLoading={isLoading}
          >
            Send Reset Link
          </Button>
          
          {/* Back to Login Link */}
          <Link to="/login">
            <Text as="span" color="blue.500" _hover={{ textDecoration: "underline" }}>
              Back to Login
            </Text>
          </Link>
        </VStack>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
