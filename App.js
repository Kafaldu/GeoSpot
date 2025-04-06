import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Home from './screens/Home'; 
import ForgotPassword from './screens/ForgotPassword';
import CreateProfilePage from "./screens/CreateProfilePage";
import ChoosePetPage from './screens/ChoosePetPage';
import ProfileCreationCompletePage from "./screens/ProfileCreationCompletePage";
import UserProfilePage from "./screens/UserProfilePage"; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Login" 
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
        <Stack.Screen 
          name="SignUp" 
          component={SignUp}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="CreateProfile" component={CreateProfilePage} options={{ headerShown: false }} />
        <Stack.Screen
          name="ChoosePetPage"
          component={ChoosePetPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ProfileCreationCompletePage" component={ProfileCreationCompletePage} options={{ headerShown: false }} />
        <Stack.Screen name="UserProfilePage" component={UserProfilePage}  />
        <Stack.Screen 
          name="Home" 
          component={Home}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
