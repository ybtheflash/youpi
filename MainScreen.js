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
import { SafeAreaView } from "react-native";

// const { width, height } = Dimensions.get("window");
function MainScreen() {
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [showResetAnimation, setShowResetAnimation] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [showPayeeNameInput, setShowPayeeNameInput] = useState(false);
  const [fontsLoaded] = useFonts({
    Comfortaa_300Light,
  });
  const [isLoading, setIsLoading] = useState(false);
  const loadingOpacity = useRef(new Animated.Value(0)).current; // Initial opacity is 0 (hidden)
  const viewShotRef = useRef(null);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const amountInputOpacity = useRef(new Animated.Value(0)).current; // Initial opacity is 0 (hidden)
  const payeeNameInputOpacity = useRef(new Animated.Value(0)).current; // Initial opacity is 0 (hidden)
  const toggleAmountInputVisibility = () => {
    Animated.timing(amountInputOpacity, {
      toValue: showAmountInput ? 0 : 1, // Animate to 1 (visible) or back to 0 (hidden)
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowAmountInput(!showAmountInput); // Update state to keep track of visibility
  };

  const togglePayeeNameInputVisibility = () => {
    Animated.timing(payeeNameInputOpacity, {
      toValue: showPayeeNameInput ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowPayeeNameInput(!showPayeeNameInput); // Update state to keep track of visibility
  };
  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };
  const toggleAboutModal = () => {
    setIsAboutModalVisible(!isAboutModalVisible);
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
      // Show loading animation
      setIsLoading(true);
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Simulate QR code generation delay
      setTimeout(() => {
        let upiLink = `upi://pay?pa=${upiId}`;
        if (amount.trim() !== "") {
          upiLink += `&am=${amount}`;
        }
        if (payeeName.trim() !== "") {
          upiLink += `&pn=${encodeURIComponent(payeeName)}`;
        }
        setQrValue(upiLink);

        // Fade out loading animation and show QR code
        Animated.timing(loadingOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setIsLoading(false); // Hide loading animation
        });
      }, 2000); // Assume QR code generation takes 2 seconds
    }
  };

  const handlePress = () => {
    Keyboard.dismiss();
  };

  const resetForm = () => {
    setShowResetAnimation(true);

    setUpiId("");
    setAmount("");
    setPayeeName("");
    setQrValue("");

    setShowAmountInput(false);
    setShowPayeeNameInput(false);

    Animated.timing(amountInputOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(payeeNameInputOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    fadeAnim.setValue(1);
    setTimeout(() => {
      setShowResetAnimation(false);
    }, 2000);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.fullScreen}>
          <ImageBackground
            source={backgroundImage}
            style={styles.backgroundImage}
            blurRadius={5}
          >
            {isLoading && (
              <Animated.View
                style={[styles.loadingContainer, { opacity: loadingOpacity }]}
              >
                <LottieView
                  source={require("./assets/loading.json")} // Path to your Lottie loading animation file
                  autoPlay
                  loop
                  style={styles.loadingAnimation}
                />
              </Animated.View>
            )}
            {showResetAnimation && (
              <Animated.View style={styles.fullScreenAnimation}>
                <LottieView
                  source={require("./assets/resetAnimation.json")} // Path to your Lottie reset animation file
                  autoPlay
                  loop={false}
                  onAnimationFinish={() => {
                    // Optionally handle animation finish event
                    setShowResetAnimation(false);
                  }}
                  style={{
                    width: 200,
                    height: 200,
                  }}
                />
              </Animated.View>
            )}
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
                    required
                  />
                  <Animated.View style={{ opacity: amountInputOpacity }}>
                    {showAmountInput && (
                      <TextInput
                        style={styles.input}
                        onChangeText={setAmount}
                        value={amount}
                        placeholder="Enter Amount"
                        placeholderTextColor="#A9A9A9"
                        keyboardType="numeric"
                      />
                    )}
                  </Animated.View>

                  <Animated.View style={{ opacity: payeeNameInputOpacity }}>
                    {showPayeeNameInput && (
                      <TextInput
                        style={styles.input}
                        onChangeText={setPayeeName}
                        value={payeeName}
                        placeholder="Enter Payee Name"
                        placeholderTextColor="#A9A9A9"
                      />
                    )}
                  </Animated.View>
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
                          <TouchableOpacity onPress={toggleAboutModal}>
                            <LottieView
                              source={require("./assets/aboutIcon.json")}
                              autoPlay
                              loop={false}
                              style={styles.lottieIcon}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={shareQRCode}>
                            <LottieView
                              source={require("./assets/shareIcon.json")}
                              autoPlay
                              loop={false}
                              style={styles.lottieIcon}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={toggleAmountInputVisibility}
                          >
                            <LottieView
                              source={require("./assets/amountIcon.json")}
                              autoPlay
                              loop={false}
                              style={styles.lottieIcon}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={togglePayeeNameInputVisibility}
                          >
                            <LottieView
                              source={require("./assets/payeeNameIcon.json")}
                              autoPlay
                              loop={false}
                              style={styles.lottieIcon}
                            />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                    <Modal
                      animationType="slide"
                      transparent={true}
                      visible={isAboutModalVisible}
                      onRequestClose={toggleAboutModal}
                    >
                      <TouchableWithoutFeedback onPress={toggleAboutModal}>
                        <View style={styles.centeredView}>
                          <View style={styles.aboutModalView}>
                            <Text style={styles.modalText}>
                              App Name: Youpi
                            </Text>
                            <Text style={styles.modalText}>
                              Developer: Siesta
                            </Text>
                            <Text style={styles.modalText}>
                              Contact: ybtheflash@gmail.com
                            </Text>
                            <Text style={styles.modalText}>
                              App Version: 1.0.0
                            </Text>
                            <Text style={styles.modalText}>
                              Year of App: 2024
                            </Text>
                            <Text style={styles.modalText}>
                              This app is not connected to UPI or NPCI in any
                              form or way. It is just a sample project.
                            </Text>
                            <TouchableOpacity
                              style={[styles.button3, styles.buttonClose]}
                              onPress={toggleAboutModal}
                            >
                              <Text style={styles.textStyle}>Close</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject, // Fill the entire screen
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 1)", // Semi-transparent background
    zIndex: 10, // Make sure it covers other content
  },
  loadingAnimation: {
    width: "50%",
    height: "50%",
  },
  fullScreenAnimation: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,1)", // Semi-transparent background
    zIndex: 100, // Ensure it's above other content
  },
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
    marginTop: 10,
  },
  resetButton: {
    paddingLeft: 25,
    marginTop: 15,
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
    marginBottom: 20,
    left: -20,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    resizeMode: "cover",
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
    borderRadius: 20,
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  aboutModalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button3: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default MainScreen;
