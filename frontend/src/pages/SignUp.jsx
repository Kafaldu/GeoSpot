import React, { useState } from 'react';
import { Box, Container, Input, useColorModeValue, VStack, Heading, Button } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

const SignUpPage = () => {
const [newUser, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
  });

    return <Button>Sign Up</Button>;
  };

  export default SignUpPage;
