import { Route, Routes } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';
import SignUpPage from './pages/SignUp';
import LoginPage from './pages/LogIn';
import WelcomePage from './pages/Welcome';

console.log("App component is rendering...");

function App() {
    const { colorMode } = useColorMode();

    return (
        <Box minH="100vh" bg={colorMode === "light" ? "gray.200" : "gray.800"}>
            <Routes>
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<WelcomePage />} />
            </Routes>
        </Box>
    );
}

export default App;
