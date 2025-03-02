import { Box, Button, Input, Text, VStack, Heading, Icon } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

const LoginPage = () => {
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
      <Icon as={FaStar} boxSize={10} mt={3} />

      {/* Login Form */}
      <Box 
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
            placeholder="Email" 
            bg="green.400" 
            color="black" 
            borderRadius="md"
            _placeholder={{ color: "black" }}
          />
          <Input 
            placeholder="Username" 
            bg="green.400" 
            color="black" 
            borderRadius="md"
            _placeholder={{ color: "black" }}
          />
          <Input 
            placeholder="Password" 
            type="password" 
            bg="green.400" 
            color="black" 
            borderRadius="md"
            _placeholder={{ color: "black" }}
          />
          <Text fontSize="sm" color="gray.400">
            forgot password?
          </Text>
          <Link to={"/signup"}>
            <Text as='span' color={"blue.500"} _hover={{ textDecoration: 'underline' }}>
                Sign up?
            </Text>
          </Link>
          <Button 
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
