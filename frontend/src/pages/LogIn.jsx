import { useState } from "react";
import { Box, Button, Input, Text, VStack, Heading, Icon, useToast } from "@chakra-ui/react";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig"; // Import Firebase authentication

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isGoogleLogin, setIsGoogleLogin] = useState(false); // Toggle state for Google login
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Attempt:", formData);
    // Add authentication logic here (API call to backend)

    // Example success message (replace with actual auth logic)
    if (formData.email && formData.password) {
      toast({
        title: "Success",
        description: "Logged in successfully.",
        status: "success",
        isClosable: true,
      });
    } else {
      setError("Please enter both email and password.");
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        status: "error",
        isClosable: true,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Handle user data (store, show, etc.)
      toast({
        title: "Success",
        description: "Logged in with Google successfully.",
        status: "success",
        isClosable: true,
      });
    } catch (error) {
      console.error("Error during Google login:", error);
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
