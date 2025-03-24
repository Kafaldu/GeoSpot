import React from "react";
import { Box, VStack, Heading, Text, Image, Grid, GridItem, SimpleGrid } from "@chakra-ui/react";

const UserProfilePage = () => {
  return (
    <Box
      minH="100vh"
      bg="gray.800"
      color="green.300"
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      p={6}
    >
      {/* Profile Picture */}
      <Image
        src="/images/profile-placeholder.png" // Placeholder image
        alt="Profile Picture"
        borderRadius="full"
        boxSize="120px"
        mb={4}
      />

      {/* Username */}
      <Heading size="lg">Username</Heading>

      {/* User Stats Grid (2 Columns) */}
      <SimpleGrid columns={2} spacing={4} mt={3}>
        <Box>
          <Text fontSize="lg" color="gray.400">User Level: 1</Text>
          <Text fontSize="lg" color="gray.400">Spots Visited: 0</Text>
        </Box>
        <Box>
          <Text fontSize="lg" color="gray.400">Streak: 0 Days</Text>
          <Text fontSize="lg" color="gray.400">Member Since: Jan 2024</Text>
        </Box>
      </SimpleGrid>

      {/* Pet Section */}
      <Box mt={6}>
        <Heading size="md" mb={2}>Your Pet</Heading>
        <Image
          src="/images/pet-placeholder.png" // Placeholder pet image
          alt="Pet"
          borderRadius="md"
          boxSize="100px"
        />
      </Box>

      {/*3-Wide Grid of Pictures */}
      <Box mt={6} w="100%" maxW="500px">
        <Heading size="md" mb={2}>Your Photos</Heading>
        <Grid templateColumns="repeat(3, 1fr)" gap={3}>
          <GridItem w="100%">
            <Image src="/images/photo-placeholder.png" alt="Photo" borderRadius="md" />
          </GridItem>
          <GridItem w="100%">
            <Image src="/images/photo-placeholder.png" alt="Photo" borderRadius="md" />
          </GridItem>
          <GridItem w="100%">
            <Image src="/images/photo-placeholder.png" alt="Photo" borderRadius="md" />
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default UserProfilePage;
