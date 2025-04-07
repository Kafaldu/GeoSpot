import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Welcome from './screens/Welcome'; // Welcome screen
import ForgotPassword from './screens/ForgotPassword';
import CreateProfilePage from "./screens/CreateProfilePage";
import ChoosePetPage from './screens/ChoosePetPage';
import ProfileCreationCompletePage from "./screens/ProfileCreationCompletePage";
import UserProfilePage from "./screens/UserProfilePage";  // Profile page
import Home from "./screens/Home"; // Home page
import Map from "./screens/Map"; // Map page

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tabs navigation for Home and UserProfilePage
function HomeTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'UserProfilePage') {
            iconName = focused ? 'person' : 'person-outline';
          }else if(route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: '#8ACF9C',  // Dark background color for the tab bar
        },
        tabBarActiveTintColor: '#FFF',  // White active icon color
        tabBarInactiveTintColor: '#000',  // Grey inactive icon color
        tabBarLabelStyle: {fontSize: 12},
        tabBarLabel: ()=> null,
      })}
    >
      <Tab.Screen name="Map" component={Map} options={{ headerShown: false }}/>
      <Tab.Screen name="Home" component={Home} options={{ headerShown: false }}/>
      <Tab.Screen name="UserProfilePage" component={UserProfilePage} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        {/* Non-tab screens */}
        <Stack.Screen 
          name="Welcome"
          component={Welcome} 
          options={{ headerShown: false }} 
        />
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
        
        {/* HomeTabs screen with bottom navigation */}
        <Stack.Screen 
          name="HomeTabs" 
          component={HomeTabs} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
