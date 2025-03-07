import { Route, Routes } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';
import SignUpPage from './pages/SignUp';
import LoginPage from './pages/LogIn';
import WelcomePage from './pages/Welcome';
import ForgotPassword from './pages/ForgotPassword';
import CreateProfile from './pages/CreateProfile';
import ChoosePet from './pages/ChoosePet';
import ProfileCreationCompletePage from './pages/ProfileComplete';
import UserProfilePage from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import {useState} from "react";

console.log("App component is rendering...");

function App() {
    const { colorMode } = useColorMode();
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Maintain authentication state

    return (
        <Box minH="100vh" bg={colorMode === "light" ? "gray.200" : "gray.800"}>
            <Routes>
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/" element={<WelcomePage />} />
                <Route path="/ForgotPassword" element={<ForgotPassword />} />
                
                {/* Private routes */}
                <Route
                    path="/create-profile"
                    element={<PrivateRoute isAuthenticated={isAuthenticated} element={<CreateProfile />} />}
                />
                <Route
                    path="/choose-pet"
                    element={<PrivateRoute isAuthenticated={isAuthenticated} element={<ChoosePet />} />}
                />
                <Route
                    path="/Profile-complete"
                    element={<PrivateRoute isAuthenticated={isAuthenticated} element={<ProfileCreationCompletePage />} />}
                />
                <Route
                    path="/User-Profile"
                    element={<PrivateRoute isAuthenticated={isAuthenticated} element={<UserProfilePage />} />}
                />
            </Routes>
        </Box>
    );
}

export default App;
