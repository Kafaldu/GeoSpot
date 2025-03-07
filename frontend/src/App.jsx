import { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import SignUpPage from "./pages/SignUp";
import LoginPage from "./pages/LogIn";
import WelcomePage from "./pages/Welcome";
import ForgotPassword from "./pages/ForgotPassword";
import CreateProfile from "./pages/CreateProfile";
import ChoosePet from "./pages/ChoosePet";
import ProfileCreationCompletePage from "./pages/ProfileComplete";
import UserProfilePage from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "false";
  });  

  useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== "/" && window.location.pathname !== "/login" && window.location.pathname !== "/signup" && window.location.pathname !== "/ForgotPassword") {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  

  return (
    <Box minH="100vh" bg={colorMode === "light" ? "gray.200" : "gray.800"}>
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/" element={<WelcomePage />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />

        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/choose-pet" element={<ChoosePet />} />
          <Route path="/Profile-complete" element={<ProfileCreationCompletePage />} />
          <Route path="/User-Profile" element={<UserProfilePage />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
