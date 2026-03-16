import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Oswald_400Regular, Oswald_500Medium, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import SignInScreen from './src/screens/SignInScreen';
import RecommendationsScreen from './src/screens/RecommendationsScreen';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>LA CINE</Text>
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>The Dude abides...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is signed in
          <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
        ) : (
          // User is not signed in
          <Stack.Screen name="SignIn" component={SignInScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0c0c0c',
  },
  loadingLogo: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 48,
    color: '#e50914',
    letterSpacing: 4,
    marginBottom: 20,
  },
  loadingText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 16,
    color: '#808080',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
