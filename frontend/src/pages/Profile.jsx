import React, { useEffect } from "react";
import { Box, VStack, Heading, Text, Image, Grid, GridItem, SimpleGrid } from "@chakra-ui/react";
import { useUserStore } from "../creator/user"; // Import your Zustand store

const UserProfilePage = ({ userId }) => {
  const { user, getUser, error, loading } = useUserStore(); // Access Zustand store methods and states

  useEffect(() => {
    if (userId) {
      getUser(userId); // Fetch the user when component mounts (pass the userId)
    }
  }, [userId, getUser]); // Dependency array to re-run the effect if userId changes

  if (loading) {
    return <Text>Loading...</Text>; // Show a loading message while user data is being fetched
  }

  if (error) {
    return <Text color="red.500">{error}</Text>; // Show error message if any
  }

  if (!user) {
    return <Text>User not found</Text>; // Show a message if no user was found
  }

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
        src={user.profilePicture || "/images/profile-placeholder.png"} // Use user profile picture if available
        alt="Profile Picture"
        borderRadius="full"
        boxSize="120px"
        mb={4}
      />

      {/* Username */}
      <Heading size="lg">{user.username}</Heading>

      {/* User Stats Grid (2 Columns) */}
      <SimpleGrid columns={2} spacing={4} mt={3}>
        <Box>
          <Text fontSize="lg" color="gray.400">User Level: {user.level || "N/A"}</Text>
          <Text fontSize="lg" color="gray.400">Spots Visited: {user.spotsVisited || 0}</Text>
        </Box>
        <Box>
          <Text fontSize="lg" color="gray.400">Streak: {user.streak || 0} Days</Text>
          <Text fontSize="lg" color="gray.400">Member Since: {user.memberSince || "Jan 2024"}</Text>
        </Box>
      </SimpleGrid>

      {/* Pet Section */}
      <Box mt={6}>
        <Heading size="md" mb={2}>Your Pet</Heading>
        <Image
          src={user.petImage || "/images/pet-placeholder.png"} // Use user pet image if available
          alt="Pet"
          borderRadius="md"
          boxSize="100px"
        />
      </Box>

      {/* 3-Wide Grid of Pictures */}
      <Box mt={6} w="100%" maxW="500px">
        <Heading size="md" mb={2}>Your Photos</Heading>
        <Grid templateColumns="repeat(3, 1fr)" gap={3}>
          {user.photos?.map((photo, index) => (
            <GridItem key={index} w="100%">
              <Image src={photo} alt={`Photo ${index + 1}`} borderRadius="md" />
            </GridItem>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default UserProfilePage;
