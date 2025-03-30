import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';

// Import screens
import HomeScreen from './screens/HomeScreen';
import PetProfileScreen from './screens/PetProfileScreen';
import LoginScreen from './screens/LoginScreen';
import UserManagementScreen from './screens/UserManagementScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import PetProfileCreationScreen from './screens/PetProfileCreationScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import OwnerCodeVerificationScreen from './screens/OwnerCodeVerificationScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import ViewPetsScreen from './screens/ViewPetsScreen';
import BrowseDogsScreen from './screens/BrowseDogsScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Request permissions for notifications
    const requestPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'You need to allow notifications to use this feature.');
      }
    };
    requestPermission();

    // Listen for foreground notifications
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      Alert.alert('Notification Received', notification.request.content.body);
    });

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="OwnerCodeVerification" component={OwnerCodeVerificationScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PetProfile" component={PetProfileScreen} />
        <Stack.Screen name="PetProfileCreation" component={PetProfileCreationScreen} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        <Stack.Screen name="ViewPetsScreen" component={ViewPetsScreen} />
        <Stack.Screen name="BrowseDogs" component={BrowseDogsScreen} />
        <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
