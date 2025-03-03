import { useState } from "react";
import { Box, Button, Input, Text, VStack, Heading, Icon } from "@chakra-ui/react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Attempt:", formData);
    // Add authentication logic here (API call to backend)
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
        GeoSpot
      </Heading>

      {/* Icon */}
      <Icon as={FaMapMarkerAlt} boxSize={10} mt={3} />

      {/* Login Form */}
      <Box 
        as="form"
        onSubmit={handleSubmit} // ✅ Form submission handling
        w="90%" 
        maxW="400px" 
        mt={5} 
        p={5} 
        display="flex" 
        flexDirection="column" 
        alignItems="center"
      >
        <VStack spacing={4} width="100%">
          <Input 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email" 
            bg="green.400" 
            color="black" 
            borderRadius="md"
            _placeholder={{ color: "black" }}
            aria-label="Email Address"
          />
          <Input 
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username" 
            bg="green.400" 
            color="black" 
            borderRadius="md"
            _placeholder={{ color: "black" }}
            aria-label="Username"
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
            aria-label="Password"
          />
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
      </Box>
    </Box>
  );
};

export default LoginPage;
