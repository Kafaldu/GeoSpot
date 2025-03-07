import { useState } from "react";
import { Box, Button, Input, Text, VStack, Heading, useToast } from "@chakra-ui/react";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";

const LoginPage = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Firebase authentication with email & password
      await signInWithEmailAndPassword(auth, formData.email, formData.password);

      // Update authentication state
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");

      toast({
        title: "Success",
        description: "Logged in successfully.",
        status: "success",
        isClosable: true,
      });

      navigate("/User-Profile"); // Redirect to Profile Page after login
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        isClosable: true,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Update authentication state
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");

      toast({
        title: "Success",
        description: "Logged in with Google successfully.",
        status: "success",
        isClosable: true,
      });

      navigate("/User-Profile"); // Redirect to Profile Page after login
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.800" color="green.300" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Heading size="2xl" fontWeight="bold" mb={10}>Login</Heading>
      <FaUser size={50} color="green.300" mb={8} />
      <Heading size="2xl" fontWeight="bold" mb={10}></Heading>
      <Box display="flex" justifyContent="center" mb={4}>
        <Button onClick={() => setIsGoogleLogin(false)} colorScheme={!isGoogleLogin ? "green" : "gray"}>Password Login</Button>
        <Button onClick={() => setIsGoogleLogin(true)} colorScheme={isGoogleLogin ? "green" : "gray"} ml={4}>Google Login</Button>
      </Box>

      <Box as="form" onSubmit={handleSubmit} w="90%" maxW="400px" p={5} bg="gray.700" borderRadius="md" shadow="md">
        {isGoogleLogin ? (
          <Button onClick={handleGoogleLogin} width="full" bg="green.400" color="black" borderRadius="md" _hover={{ bg: "green.500" }}>Log In with Google</Button>
        ) : (
          <VStack spacing={4} width="100%">
            <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" bg="green.400" />
            <Input name="password" value={formData.password} onChange={handleChange} placeholder="Password" type="password" bg="green.400" />
            {error && <Text color="red.500">{error}</Text>}
            <Link to={"/ForgotPassword"}><Text fontSize="sm" color="gray.400" _hover={{ textDecoration: "underline" }}>Forgot password?</Text></Link>
            <Link to={"/signup"}><Text as="span" color={"blue.500"} _hover={{ textDecoration: "underline" }}>Sign up?</Text></Link>
            <Button type="submit" width="full" bg="green.400" color="black" borderRadius="md" _hover={{ bg: "green.500" }}>ENTER</Button>
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default LoginPage;