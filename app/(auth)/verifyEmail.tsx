import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { router, useLocalSearchParams } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";
import {
  verifyEmail,
  resendOtp,
} from "../../actions/auth.actions";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { saveAuthData } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: { otp: string }) => {
    try {
      setIsLoading(true);
      setError("");

      const verifiedUser = await verifyEmail(email as string, data.otp);
      if (!verifiedUser) {
        throw new Error("Verification failed");
      }

      await saveAuthData(verifiedUser);
      router.replace("/(tabs)/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await resendOtp(email as string);
      if (!response) {
        throw new Error("Failed to resend verification code");
      }

      setError("Verification code sent successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.innerContainer}>
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <Ionicons name="mail-outline" size={48} color="#ffffff" />
                  </View>
                  <Text style={styles.appName}>Pulcity</Text>
                  <Text style={styles.subtitle}>Verify Your Account</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formHeader}>
                    <Text style={styles.formTitle}>Email Verification</Text>
                    <Text style={styles.formSubtitle}>One last step to get started</Text>
                  </View>

                  <View style={styles.form}>
                    <Text style={styles.infoText}>
                      We've sent a verification code to {email}. Please enter the code below to verify your account.
                    </Text>

                    <Controller
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.inputContainer}>
                          <Text style={styles.label}>Verification Code</Text>
                          <View style={[styles.inputWrapper, errors.otp && styles.inputWrapperError]}>
                            <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder="Enter verification code"
                              placeholderTextColor="#999"
                              value={value}
                              onChangeText={onChange}
                              keyboardType="numeric"
                              autoCapitalize="none"
                            />
                          </View>
                          {errors.otp && (
                            <Text style={styles.errorText}>{errors.otp.message}</Text>
                          )}
                        </View>
                      )}
                      name="otp"
                    />

                    {error !== "" && (
                      <View style={[styles.errorContainer, error.includes("successfully") && styles.successContainer]}>
                        <Ionicons name={error.includes("successfully") ? "checkmark-circle" : "alert-circle"} size={18} color={error.includes("successfully") ? "#4CAF50" : "#ff4444"} />
                        <Text style={[styles.errorText, error.includes("successfully") && styles.successText]}>
                          {error}
                        </Text>
                      </View>
                    )}

                    <Pressable
                      style={[styles.button, isLoading && styles.buttonDisabled]}
                      onPress={handleSubmit(onSubmit)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>Verify Code</Text>
                          <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      style={styles.resendButton}
                      onPress={handleResendOtp}
                      disabled={isLoading}
                    >
                      <Text style={styles.resendText}>
                        Didn't receive the code? <Text style={styles.resendTextBold}>Resend</Text>
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => router.push("/(auth)/login")}
                    >
                      <Text style={styles.secondaryButtonText}>Back to Login</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
  },
  inputWrapperError: {
    borderColor: '#ff4444',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 8,
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    marginLeft: 8,
  },
  successText: {
    color: '#4CAF50',
  },
  button: {
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  resendButton: {
    padding: 12,
    alignItems: 'center',
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendTextBold: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  secondaryButton: {
    height: 56,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
}); 