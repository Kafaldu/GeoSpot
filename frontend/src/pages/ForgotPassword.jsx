import { useState } from "react";
import { Box, Button, Input, Text, VStack, Heading, Icon } from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Password reset requested for:", email);
    // Add API call here to send reset instructions
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

      {/* Icon */}
      <Icon as={FaLock} boxSize={10} mt={3} />

      {/* Forgot Password Form */}
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
      >
        <VStack spacing={4} width="100%">
          <Text fontSize="md" color="gray.400">
            Enter your email to receive reset instructions.
          </Text>
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
          />
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
            Send Reset Link
          </Button>
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
