import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";

import ProjectScreen from "../screens/project/ProjectScreen";

import TowerScreen from "../screens/flats/TowerScreen";
import FloorScreen from "../screens/flats/FloorScreen";
import FlatListScreen from "../screens/flats/FlatListScreen";
import FlatDetailsScreen from "../screens/flats/FlatDetailsScreen";

import ApplicantDetailsScreen from "../screens/bookings/ApplicantDetailsScreen";
import SecondApplicantScreen from "../screens/SecondApplicantScreen";
import PaymentPlanScreen from "../screens/bookings/PaymentPlanScreen";
import BookingSummaryScreen from "../screens/bookings/BookingSummaryScreen";
import ApplicationSubmittedScreen from "../screens/bookings/ApplicationSubmittedScreen";

import MyBookingScreen from "../screens/booking-status/MyBookingScreen";

import PaymentsScreen from "../screens/payments/PaymentsScreen";
import PaymentDetailsScreen from "../screens/payments/PaymentDetailsScreen";

import DocumentsScreen from "../screens/documents/DocumentsScreen";
import ApiConfigScreen from "../screens/ApiConfigScreen";

import { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />

        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />

        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        <Stack.Screen name="Project" component={ProjectScreen} />

        <Stack.Screen name="Tower" component={TowerScreen} />
        <Stack.Screen name="Floor" component={FloorScreen} />
        <Stack.Screen name="FlatList" component={FlatListScreen} />
        <Stack.Screen name="FlatDetails" component={FlatDetailsScreen} />

        <Stack.Screen
          name="ApplicantDetails"
          component={ApplicantDetailsScreen}
        />

        <Stack.Screen
          name="SecondApplicant"
          component={SecondApplicantScreen}
        />

        <Stack.Screen
          name="PaymentPlan"
          component={PaymentPlanScreen}
        />

        <Stack.Screen
          name="BookingSummary"
          component={BookingSummaryScreen}
        />

      
        <Stack.Screen
          name="ApplicationSubmitted"
          component={ApplicationSubmittedScreen}
        />

        <Stack.Screen
          name="MyBooking"
          component={MyBookingScreen}
        />

        <Stack.Screen
          name="Payments"
          component={PaymentsScreen}
        />

        <Stack.Screen
          name="PaymentDetails"
          component={PaymentDetailsScreen}
        />

        <Stack.Screen
          name="Documents"
          component={DocumentsScreen}
        />

        <Stack.Screen
          name="ApiConfig"
          component={ApiConfigScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;