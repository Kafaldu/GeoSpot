import { useState } from "react";
import { Box, Button, Input, Text, VStack, Heading, Icon } from "@chakra-ui/react";
import { FaUserPlus, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const SignUpPage = () => {
  const [formData, setFormData] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      console.log("Firebase User Created:", user);

      // Update the user's Firebase profile
      await updateProfile(user, { displayName: formData.username });

      // Store user in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: formData.username,
        email: formData.email,
        createdAt: new Date(),
      });

      // Send user data to backend (MongoDB storage)
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, username: formData.username, uid: user.uid }),
      });

      const data = await response.json();
      console.log("API Response (MongoDB):", data); 

      setError("");
      navigate("/"); 
    } catch (err) {
      setError(err.message);
      console.error("Signup Error:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      console.log("Google User Signed In:", user);

      // Check if user already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Store new user in Firestore
        await setDoc(userRef, {
          uid: user.uid,
          username: user.displayName,
          email: user.email,
          createdAt: new Date(),
        });

        // Send new user to MongoDB backend
        const response = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, username: user.displayName, uid: user.uid }),
        });

        const data = await response.json();
        console.log("API Response (MongoDB - Google):", data);
      }

      setError("");
      navigate("/");
    } catch (err) {
      setError(err.message);
      console.error("Google Signup Error:", err);
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
      <Heading size="2xl" fontWeight="bold">Create an Account</Heading>

      {/* Icon */}
      <Icon as={FaUserPlus} boxSize={10} mt={3} />

      {/* Sign Up Form */}
      <Box as="form" onSubmit={handleSignUp} w="90%" maxW="400px" mt={5} p={5} display="flex" flexDirection="column" alignItems="center">
        <VStack spacing={4} width="100%">
          <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" bg="green.400" color="black" borderRadius="md" _placeholder={{ color: "black" }} />
          <Input name="username" value={formData.username} onChange={handleChange} placeholder="Username" bg="green.400" color="black" borderRadius="md" _placeholder={{ color: "black" }} />
          <Input name="password" value={formData.password} onChange={handleChange} placeholder="Password" type="password" bg="green.400" color="black" borderRadius="md" _placeholder={{ color: "black" }} />
          <Input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" type="password" bg="green.400" color="black" borderRadius="md" _placeholder={{ color: "black" }} />

          {error && <Text color="red.500">{error}</Text>}

          <Button type="submit" width="full" bg="green.400" color="black" borderRadius="md" fontSize="lg" fontWeight="bold" _hover={{ bg: "green.500" }}>
            SIGN UP
          </Button>

          <Button onClick={handleGoogleSignIn} width="full" bg="red.500" color="white" leftIcon={<FaGoogle />} borderRadius="md" fontSize="lg" fontWeight="bold" _hover={{ bg: "red.600" }}>
            Sign Up with Google
          </Button>

          <Link to="/login">
            <Text as="span" color="blue.500" _hover={{ textDecoration: "underline" }}>Already have an account? Log in</Text>
          </Link>
        </VStack>
      </Box>
    </Box>
  );
};

export default SignUpPage;
