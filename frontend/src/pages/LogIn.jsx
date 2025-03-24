import { useState } from "react";
import { Box, Button, Input, Text, VStack, Heading, Icon, useToast } from "@chakra-ui/react";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";

const LoginPage = () => {
  // State management for form data and UI states
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Handle input changes in the form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Attempt to sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      console.log("Logged in user:", userCredential.user);
      // Show success message
      toast({
        title: "Success",
        description: "Logged in successfully.",
        status: "success",
        isClosable: true,
      });
      // Navigate to profile page after successful login
      navigate("/User-Profile");
    } catch (error) {
      console.error("Login error:", error);
      // Handle different types of authentication errors
      let errorMessage = "Failed to log in. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }

      setError(errorMessage);
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

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Attempt to sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Google login successful:", user);
      // Show success message
      toast({
        title: "Success",
        description: "Logged in with Google successfully.",
        status: "success",
        isClosable: true,
      });
      // Navigate to profile page after successful login
      navigate("/User-Profile");
    } catch (error) {
      console.error("Error during Google login:", error);
      // Show error message to user
      toast({
        title: "Error",
        description: error.message,
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
      <Heading size="2xl" fontWeight="bold" mb={10}>Login</Heading>

      {/* Icon */}
      <FaUser size={50} mt={3} color="green.300" mb={8} />
      
      <Heading size="2xl" fontWeight="bold" mb={112}></Heading>

      {/* Toggle Button */}
      <Box display="flex" justifyContent="center" mb={4} >
        <Button
          onClick={() => setIsGoogleLogin(false)}
          colorScheme={isGoogleLogin ? "gray" : "green"}
        >
          Password Login
        </Button>
        <Button
          onClick={() => setIsGoogleLogin(true)}
          colorScheme={isGoogleLogin ? "green" : "gray"}
          ml={4}
        >
          Google Login
        </Button>
      </Box>

      {/* Login Form */}
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
        bg={"gray.700"}
        borderRadius="md"
        shadow="md"
      >
        {isGoogleLogin ? (
          // Google Login Button
          <Box width="full">
            <Button
              onClick={handleGoogleLogin}
              width="full"
              bg="green.400"
              color="black"
              borderRadius="md"
              fontSize="lg"
              fontWeight="bold"
              _hover={{ bg: "green.500" }}
              isLoading={isLoading}
            >
              Log In with Google
            </Button>
            <Heading size="2xl" fontWeight="bold" mb={4}></Heading>
            <Link to={"/signup"}>
              <Text as="span" color={"blue.500"} _hover={{ textDecoration: "underline" }}>
                Sign up?
              </Text>
            </Link>
          </Box>
        ) : (
          // Regular Login Form
          <VStack spacing={4} width="100%">
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              bg="green.400"
              color="white"
              borderRadius="md"
              _placeholder={{ color: "black" }}
              required
            />
            <Input
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              type="password"
              bg="green.400"
              color="black"
              borderRadius="md"
              _placeholder={{ color: "black" }}
              required
            />

            {/* Error Message */}
            {error && <Text color="red.500">{error}</Text>}

            <Link to={"/ForgotPassword"}>
              <Text fontSize="sm" color="gray.400" _hover={{ textDecoration: "underline" }}>
                Forgot password?
              </Text>
            </Link>
            <Link to={"/signup"}>
              <Text as="span" color={"blue.500"} _hover={{ textDecoration: "underline" }}>
                Sign up?
              </Text>
            </Link>
        
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
              ENTER
            </Button>
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default LoginPage;
