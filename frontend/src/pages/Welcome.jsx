import { Box, Button, Text, VStack, Heading, Icon } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

const WelcomePage = () => {
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
                <Link to={"/signup"}>
                    <Button bg="green.400" color="black" borderRadius="md">
                      Sign Up
                    </Button>
                </Link>
                <Link to={"/login"}>
                    <Button bg="gray.400" color="black" borderRadius="md">
                      Log In
                    </Button>
                </Link>
            </VStack>
          </Box>
        </Box>
    );
};

export default WelcomePage;
