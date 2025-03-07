import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Image, SimpleGrid } from "@chakra-ui/react";
import { useUserStore } from "../creator/user";
import { getAuth } from "firebase/auth"; // Ensure you're importing the Firebase Auth for UID

const UserProfilePage = () => {
  const { users, getUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  const auth = getAuth();
  const currentUser = users[0];  // Assuming the first user is the current user
  const uid = auth.currentUser ? auth.currentUser.uid : null; // Get UID from Firebase Authentication

  useEffect(() => {
    if (uid && !currentUser) {
      getUser(uid).then(() => setIsLoading(false)); // Fetch user if UID is available and user is not loaded
    } else {
      setIsLoading(false); // No need to fetch if user already exists
    }
  }, [currentUser, getUser, uid]);

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
        src={currentUser?.photoURL || "/images/default-avatar.png"} // Use Google photoURL or fallback to default image
        alt="Profile Picture"
        borderRadius="full"
        boxSize="120px"
        mb={4}
      />

      {/* Email */}
      <Heading size="lg">
        {isLoading ? "Loading..." : currentUser ? currentUser.email : "No User Found"}
      </Heading>

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
        <SimpleGrid columns={3} spacing={3}>
          <Image src="/images/photo-placeholder.png" alt="Photo" borderRadius="md" />
          <Image src="/images/photo-placeholder.png" alt="Photo" borderRadius="md" />
          <Image src="/images/photo-placeholder.png" alt="Photo" borderRadius="md" />
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default UserProfilePage;
