import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Button,
  Text,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Share,
} from "react-native";
import LottieView from "lottie-react-native";
import QRCode from "react-native-qrcode-svg";
import backgroundImage from "./assets/main.jpg";
import cardbackgroundImage from "./assets/card-bg.jpg";
import { useFonts, Comfortaa_300Light } from "@expo-google-fonts/comfortaa";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
// import RNFS from "react-native-fs";

const { width, height } = Dimensions.get("window");

function MainScreen() {
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [qrValue, setQrValue] = useState("");

  const fadeAnim = useState(new Animated.Value(1))[0];

  const [fontsLoaded] = useFonts({
    Comfortaa_300Light,
  });
  const viewShotRef = useRef(null);

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const advancedIconRef = useRef(null);
  const resetIconRef = useRef(null);

  const shareQRCode = async () => {
    try {
      // Capture the QR code view as an image
      const uri = await viewShotRef.current.capture();

      // On Android, copy the file to a shareable location
      const newUri = FileSystem.cacheDirectory + "qrCode.jpg";
      await FileSystem.copyAsync({ from: uri, to: newUri });

      // Prepare the message to share
      let message = `Here's my UPI QR Code:`;
      if (upiId) {
        message += `\nUPI ID: ${upiId}`;
      }
      if (amount) {
        message += `\nAmount: ${amount}`;
      }
      if (payeeName) {
        message += `\nPayee Name: ${payeeName}`;
      }

      // Use Sharing.shareAsync to share the image along with the message
      await Sharing.shareAsync(newUri, {
        mimeType: "image/jpg", // Android requires a mimeType for sharing
        dialogTitle: "Share QR Code",
        UTI: "public.jpeg", // iOS requires a UTI (Uniform Type Identifier) for sharing
        // Include the message with the shared image
        message: message,
      });
    } catch (error) {
      console.error("Failed to share QR code", error);
    }
  };

  useEffect(() => {
    if (qrValue) {
      // Fade out the text when QR code is generated
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade to opacity 0
        duration: 0, // Duration 500ms
        useNativeDriver: true, // Use native driver for better performance
      }).start();
    } else {
      // Reset fadeAnim to 1 when QR code is not present
      fadeAnim.setValue(1);
    }
  }, [qrValue]); // Depend on qrValue

  const generateQR = () => {
    if (upiId.trim() !== "") {
      let upiLink = `upi://pay?pa=${upiId}`;
      if (amount.trim() !== "") {
        upiLink += `&am=${amount}`;
      }
      if (payeeName.trim() !== "") {
        upiLink += `&pn=${encodeURIComponent(payeeName)}`;
      }
      setQrValue(upiLink);
      if (advancedIconRef.current) {
        advancedIconRef.current.reset();
        advancedIconRef.current.play();
      }
      if (resetIconRef.current) {
        resetIconRef.current.reset();
        resetIconRef.current.play();
      }
    }
  };

  const handlePress = () => {
    Keyboard.dismiss();
  };

  // const saveQRCodeToDevice = () => {
  //   viewShotRef.current.capture().then((uri) => {
  //     const destPath = `${RNFS.DocumentDirectoryPath}/MyQRCode.jpg`;
  //     RNFS.moveFile(uri, destPath)
  //       .then(() => {
  //         console.log("QR Code saved to", destPath);
  //         // You might want to use react-native-photo or similar to save to the gallery
  //       })
  //       .catch((error) => console.error("Failed to save QR Code", error));
  //   });
  // };

  const resetForm = () => {
    setUpiId("");
    setAmount("");
    setPayeeName("");
    setQrValue("");
    fadeAnim.setValue(1);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.fullScreen}>
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
          blurRadius={5}
        >
          <View style={styles.overlay}>
            <View style={styles.card}>
              <ImageBackground
                source={cardbackgroundImage}
                style={styles.cardbackgroundImage}
                blurRadius={5}
                borderRadius={20}
              >
                <ViewShot
                  ref={viewShotRef}
                  options={{ format: "jpg", quality: 0.9 }}
                >
                  <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.fadeText}>youpi</Text>
                    <Image
                      source={require("./assets/icon.png")}
                      style={styles.customIconBefore}
                    />
                  </Animated.View>
                  {qrValue ? (
                    <View style={styles.qrContainer}>
                      <Text style={styles.branding}>youpi</Text>
                      <Image
                        source={require("./assets/icon.png")}
                        style={styles.customIcon}
                      />

                      <QRCode
                        value={qrValue}
                        size={200}
                        color="white"
                        backgroundColor="transparent"
                      />
                      {payeeName ? (
                        <Text style={styles.payeeName}>{payeeName}</Text>
                      ) : null}
                    </View>
                  ) : null}
                </ViewShot>
                <TextInput
                  style={styles.input}
                  onChangeText={setUpiId}
                  value={upiId}
                  placeholder="Enter UPI ID"
                  placeholderTextColor="#A9A9A9"
                />
                <TextInput
                  style={styles.input}
                  onChangeText={setAmount}
                  value={amount}
                  placeholder="Enter Amount"
                  placeholderTextColor="#A9A9A9"
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  onChangeText={setPayeeName}
                  value={payeeName}
                  placeholder="Enter Payee Name"
                  placeholderTextColor="#A9A9A9"
                />
                <View style={styles.buttonContainer}>
                  {qrValue && (
                    <TouchableOpacity
                      onPress={toggleMenu}
                      style={styles.advancedButton}
                    >
                      <LottieView
                        ref={advancedIconRef}
                        source={require("./assets/advancedIcon.json")}
                        autoPlay
                        loop={false}
                        style={styles.lottieIcon}
                      />
                    </TouchableOpacity>
                  )}
                  <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isMenuVisible}
                    onRequestClose={toggleMenu}
                  >
                    <TouchableOpacity
                      style={styles.modalOverlay}
                      activeOpacity={1}
                      onPressOut={toggleMenu}
                    >
                      <View style={styles.floatingMenu}>
                        <TouchableOpacity
                          onPress={() => console.log("About pressed")}
                        >
                          <LottieView
                            source={require("./assets/aboutIcon.json")}
                            autoPlay
                            loop={false}
                            style={styles.lottieIcon}
                          />
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={saveQRCodeToDevice}>
                          <LottieView
                            source={require("./assets/saveIcon.json")}
                            autoPlay
                            loop={false}
                            style={styles.lottieIcon}
                          />
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={shareQRCode}>
                          <LottieView
                            source={require("./assets/shareIcon.json")}
                            autoPlay
                            loop={false}
                            style={styles.lottieIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </Modal>
                  <TouchableOpacity
                    onPress={() => {
                      generateQR();
                      handlePress();
                    }}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Generate QR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={resetForm}
                    style={styles.resetButton}
                  >
                    <LottieView
                      ref={resetIconRef}
                      source={require("./assets/resetIcon.json")}
                      autoPlay
                      loop={false}
                      style={styles.lottieIcon}
                    />
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>
          </View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  floatingMenu: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 40,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "80%",
    marginBottom: "14%",
  },
  buttonContainer: {
    flexDirection: "row", // Align children horizontally
    alignItems: "center", // Center children vertically in the container
    justifyContent: "center", // Center the container content horizontally
    marginTop: 20,
  },
  button: {
    backgroundColor: "#6C63FF",
    borderRadius: 25,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 0, // Add some space between the button and the reset icon
  },
  resetButton: {
    paddingLeft: 25,
    marginTop: 20,
  },
  advancedButton: {
    paddingRight: 25,
    marginTop: 20,
  },
  lottieIcon: {
    width: 50,
    height: 50,
  },
  fullScreen: {
    flex: 1, // This ensures the View fills the entire screen
    width: "100%",
    height: "100%",
  },
  fadeText: {
    zIndex: 1,
    fontWeight: "bold",
    fontSize: 30,
    color: "white",
    fontFamily: "Comfortaa_300Light",
    marginBottom: 40,
    left: -20,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
    alignItems: "center",
    justifyContent: "center",
  },
  cardbackgroundImage: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    // backgroundImage: `url("./assets/card-bg.jpg")`,
    borderRadius: 20,
    // borderStyle: "solid",
    // borderColor: "#078142",
    // padding: 20,
    // paddingTop: 90,
    // alignItems: "center",
    // justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  qrContainer: {
    marginBottom: 20,
    backgroundColor: "rgba(248, 248, 248, 0)",
    padding: 10,
    borderRadius: 10,
  },
  branding: {
    zIndex: 1,
    position: "absolute",
    top: -60,
    left: 60,
    fontWeight: "bold",
    fontSize: 30,
    color: "white", // Nature green text color
    fontFamily: "Comfortaa_300Light",
  },
  input: {
    width: 300,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#6C63FF",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  payeeName: {
    color: "#fff",
    fontSize: 25,
    textAlign: "center",
    paddingTop: 20,
  },
  customIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    position: "absolute",
    right: 50,
    top: -60,
  },
  customIconBefore: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    position: "absolute",
    right: -20,
  },
});

export default MainScreen;
