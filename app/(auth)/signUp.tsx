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
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";
import { signUp, verifyEmail, resendOtp } from "../../actions/auth.actions";
import { SafeAreaView } from "react-native-safe-area-context";
import { userSignUpSchema } from "@/models/auth.model";
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type FormData = {
	email: string;
	username: string;
	first_name: string;
	last_name: string;
	password: string;
};

const { width } = Dimensions.get('window');

export default function SignUp() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [isVerificationMode, setIsVerificationMode] = useState(false);
	const [isVerificationEmailMode, setIsVerificationEmailMode] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const { saveAuthData } = useAuth();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(userSignUpSchema),
		defaultValues: {
			email: "",
			username: "",
			first_name: "",
			last_name: "",
			password: "",
		},
	});

	const onSubmit = async (data: FormData) => {
		try {
			setIsLoading(true);
			setError("");

			const response = await signUp(data);

			if (response && "user" in response) {
				setEmail(data.email);
				setPassword(data.password);

				setIsVerificationMode(true);
			} else {
				throw new Error("Invalid response format");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const onVerifyEmail = async () => {
		try {
			setIsLoading(true);
			setError("");

			const verifiedUser = await verifyEmail(email, otp);
			if (!verifiedUser) {
				console.error("Email verification failed");
			}
			await saveAuthData(verifiedUser);

			router.replace("/(tabs)/home");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const onVerifyExistingEmail = async () => {
		try {
			setIsLoading(true);
			setError("");

			const verifiedUser = await resendOtp(email);
			if (!verifiedUser) {
				console.error("Email verification failed");
			}
			setIsVerificationEmailMode(false);
			setIsVerificationMode(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	if (isVerificationMode || isVerificationEmailMode) {
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
							showsVerticalScrollIndicator={false}
						>
							<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
								<View style={styles.innerContainer}>
									<View style={styles.header}>
										<View style={styles.logoContainer}>
											<Ionicons name="ticket-outline" size={48} color="#ffffff" />
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
											{isVerificationMode && (
												<Text style={styles.infoText}>
													We've sent a verification code to {email}. Please enter the code below to verify your account.
												</Text>
											)}

											{/* OTP Input Field */}
											{isVerificationMode && (
												<View style={styles.inputContainer}>
													<Text style={styles.label}>Verification Code</Text>
													<View style={styles.inputWrapper}>
														<Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
														<TextInput
															style={styles.input}
															placeholder="Enter verification code"
															placeholderTextColor="#999"
															keyboardType="numeric"
															autoCapitalize="none"
															value={otp}
															onChangeText={setOtp}
														/>
													</View>
												</View>
											)}
											{isVerificationEmailMode && (
												<View style={styles.inputContainer}>
													<Text style={styles.label}>Email</Text>
													<View style={styles.inputWrapper}>
														<Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
														<TextInput
															style={styles.input}
															placeholder="Enter your email"
															placeholderTextColor="#999"
															keyboardType="email-address"
															autoCapitalize="none"
															value={email}
															onChangeText={setEmail}
														/>
													</View>
												</View>
											)}

											{error !== "" && (
												<View style={styles.errorContainer}>
													<Ionicons name="alert-circle" size={18} color="#ff4444" />
													<Text style={styles.errorText}>{error}</Text>
												</View>
											)}

											<Pressable
												style={[styles.button, isLoading && styles.buttonDisabled]}
												onPress={isVerificationMode ? onVerifyEmail : onVerifyExistingEmail}
												disabled={isLoading}
											>
												{isLoading ? (
													<ActivityIndicator color="#fff" />
												) : (
													<>
														<Text style={styles.buttonText}>
															{isVerificationMode ? "Verify Code" : "Send Verification Code"}
														</Text>
														<Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
													</>
												)}
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
						showsVerticalScrollIndicator={false}
					>
						<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
							<View style={styles.innerContainer}>
								<View style={styles.header}>
									<View style={styles.logoContainer}>
										<Ionicons name="ticket-outline" size={48} color="#ffffff" />
									</View>
									<Text style={styles.appName}>Pulcity</Text>
									<Text style={styles.subtitle}>Join the Community</Text>
								</View>

								<View style={styles.formContainer}>
									<View style={styles.formHeader}>
										<Text style={styles.formTitle}>Create Account</Text>
										<Text style={styles.formSubtitle}>Sign up to get started</Text>
									</View>

									<View style={styles.form}>
										<Controller
											control={control}
											name="email"
											render={({ field: { onChange, value, onBlur } }) => (
												<View style={styles.inputContainer}>
													<Text style={styles.label}>Email</Text>
													<View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
														<Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
														<TextInput
															style={styles.input}
															placeholder="Enter your email"
															placeholderTextColor="#999"
															keyboardType="email-address"
															autoCapitalize="none"
															value={value}
															onChangeText={onChange}
															onBlur={onBlur}
														/>
													</View>
													{errors.email && (
														<Text style={styles.errorText}>{errors.email.message}</Text>
													)}
												</View>
											)}
										/>

										<Controller
											control={control}
											name="username"
											render={({ field: { onChange, value, onBlur } }) => (
												<View style={styles.inputContainer}>
													<Text style={styles.label}>Username</Text>
													<View style={[styles.inputWrapper, errors.username && styles.inputWrapperError]}>
														<Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
														<TextInput
															style={styles.input}
															placeholder="Choose a username"
															placeholderTextColor="#999"
															autoCapitalize="none"
															value={value}
															onChangeText={onChange}
															onBlur={onBlur}
														/>
													</View>
													{errors.username && (
														<Text style={styles.errorText}>{errors.username.message}</Text>
													)}
												</View>
											)}
										/>

										<View style={styles.nameRow}>
											<Controller
												control={control}
												name="first_name"
												render={({ field: { onChange, value, onBlur } }) => (
													<View style={[styles.inputContainer, styles.nameInput]}>
														<Text style={styles.label}>First Name</Text>
														<View style={[styles.inputWrapper, errors.first_name && styles.inputWrapperError]}>
															<Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
															<TextInput
																style={styles.input}
																placeholder="First name"
																placeholderTextColor="#999"
																autoCapitalize="words"
																value={value}
																onChangeText={onChange}
																onBlur={onBlur}
															/>
														</View>
														{errors.first_name && (
															<Text style={styles.errorText}>{errors.first_name.message}</Text>
														)}
													</View>
												)}
											/>

											<Controller
												control={control}
												name="last_name"
												render={({ field: { onChange, value, onBlur } }) => (
													<View style={[styles.inputContainer, styles.nameInput]}>
														<Text style={styles.label}>Last Name</Text>
														<View style={[styles.inputWrapper, errors.last_name && styles.inputWrapperError]}>
															<Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
															<TextInput
																style={styles.input}
																placeholder="Last name"
																placeholderTextColor="#999"
																autoCapitalize="words"
																value={value}
																onChangeText={onChange}
																onBlur={onBlur}
															/>
														</View>
														{errors.last_name && (
															<Text style={styles.errorText}>{errors.last_name.message}</Text>
														)}
													</View>
												)}
											/>
										</View>

										<Controller
											control={control}
											name="password"
											render={({ field: { onChange, value, onBlur } }) => (
												<View style={styles.inputContainer}>
													<Text style={styles.label}>Password</Text>
													<View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
														<Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
														<TextInput
															style={styles.input}
															placeholder="Create a password"
															placeholderTextColor="#999"
															secureTextEntry={!showPassword}
															autoCapitalize="none"
															value={value}
															onChangeText={onChange}
															onBlur={onBlur}
														/>
														<Pressable 
															onPress={() => setShowPassword(!showPassword)}
															style={styles.passwordToggle}
														>
															<Ionicons 
																name={showPassword ? "eye-off-outline" : "eye-outline"} 
																size={20} 
																color="#666" 
															/>
														</Pressable>
													</View>
													{errors.password && (
														<Text style={styles.errorText}>{errors.password.message}</Text>
													)}
												</View>
											)}
										/>

										{error !== "" && (
											<View style={styles.errorContainer}>
												<Ionicons name="alert-circle" size={18} color="#ff4444" />
												<Text style={styles.errorText}>{error}</Text>
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
													<Text style={styles.buttonText}>Create Account</Text>
													<Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
												</>
											)}
										</Pressable>

										<View style={styles.divider}>
											<View style={styles.dividerLine} />
											<Text style={styles.dividerText}>OR</Text>
											<View style={styles.dividerLine} />
										</View>

										<Pressable
											onPress={() => router.push("/(auth)/login")}
											style={styles.secondaryButton}
										>
											<Text style={styles.secondaryButtonText}>Sign In Instead</Text>
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
	nameRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	nameInput: {
		flex: 0.48,
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
	passwordToggle: {
		padding: 8,
	},
	infoText: {
		fontSize: 16,
		color: '#666',
		textAlign: "center",
		lineHeight: 22,
		marginBottom: 12,
	},
	errorText: {
		color: '#ff4444',
		fontSize: 13,
		marginLeft: 4,
		marginTop: 4,
	},
	errorContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFE5E5',
		padding: 10,
		borderRadius: 8,
		marginBottom: 10,
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
	divider: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 16,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: '#e0e0e0',
	},
	dividerText: {
		color: '#666',
		fontSize: 14,
		marginHorizontal: 12,
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
