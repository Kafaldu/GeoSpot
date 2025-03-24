import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
          <ChakraProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ChakraProvider>
        </BrowserRouter>
    </React.StrictMode>
)