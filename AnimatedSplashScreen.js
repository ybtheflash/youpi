import React, { useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const AnimatedSplashScreen = ({ navigation }) => {
  useEffect(() => {
    if (navigation) {
      setTimeout(() => {
        navigation.replace("Main"); // Replace 'Main' with the name of your main screen
      }, 1500); // Adjust the timing based on your animation
    }
  }, [navigation]);

  return (
    <View style={styles.animationContainer}>
      <LottieView
        style={{
          width: 400,
          height: 400,
        }}
        source={require("./assets/splashloader3.json")} // Path to your Lottie JSON file
        autoPlay
        loop
        speed={2}
        //speed={0.9} // Adjust the speed here, lower value slows down the animation
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff", // Adjust the background color as needed
  },
});

export default AnimatedSplashScreen;
