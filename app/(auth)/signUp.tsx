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
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";
import { signUp, verifyEmail, resendOtp } from "../../actions/auth.actions";
import { SafeAreaView } from "react-native-safe-area-context";
import { userSignUpSchema } from "@/models/auth.model";

type FormData = {
	email: string;
	username: string;
	first_name: string;
	last_name: string;
	password: string;
};

export default function SignUp() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [isVerificationMode, setIsVerificationMode] = useState(false);
	const [isVerificationEmailMode, setIsVerificationEmailMode] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState("");
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
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={styles.container}
				>
					<ScrollView
						contentContainerStyle={styles.scrollContent}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.header}>
							<Text style={styles.appName}>Pulcity</Text>
							<Text style={styles.subtitle}>Verify Your Email</Text>
						</View>

						<View style={styles.form}>
							{isVerificationMode && (
								<Text style={styles.infoText}>
									We’ve sent a verification email to {email}. Please enter the OTP sent
									to your email to verify your account.
								</Text>
							)}

							{/* OTP Input Field */}
							{isVerificationMode && (
								<View style={styles.inputContainer}>
									<Text style={styles.label}>OTP</Text>
									<TextInput
										style={[styles.input, error && styles.inputError]}
										placeholder="Enter OTP"
										keyboardType="numeric"
										autoCapitalize="none"
										value={otp}
										onChangeText={setOtp}
									/>
								</View>
							)}
							{isVerificationEmailMode && (
								<View style={styles.inputContainer}>
									<TextInput
										style={[styles.input, error && styles.inputError]}
										placeholder="Enter Email"
										autoCapitalize="none"
										value={email}
										onChangeText={setEmail}
									/>
								</View>
							)}

							{error !== "" && <Text style={styles.errorText}>{error}</Text>}

							<Pressable
								style={[styles.button, isLoading && styles.buttonDisabled]}
								onPress={isVerificationMode ? onVerifyEmail : onVerifyExistingEmail}
								disabled={isLoading}
							>
								{isLoading ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text style={styles.buttonText}>Verify Email</Text>
								)}
							</Pressable>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.container}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.header}>
						<Text style={styles.appName}>Pulcity</Text>
						<Text style={styles.subtitle}>Sign up to get started</Text>
					</View>

					<View style={styles.form}>
						<Controller
							control={control}
							name="email"
							render={({ field: { onChange, value, onBlur } }) => (
								<View style={styles.inputContainer}>
									<Text style={styles.label}>Email</Text>
									<TextInput
										style={[styles.input, errors.email && styles.inputError]}
										placeholder="Enter your email"
										keyboardType="email-address"
										autoCapitalize="none"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
									/>
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
									<TextInput
										style={[styles.input, errors.username && styles.inputError]}
										placeholder="Enter your username"
										autoCapitalize="none"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
									/>
									{errors.username && (
										<Text style={styles.errorText}>{errors.username.message}</Text>
									)}
								</View>
							)}
						/>

						<Controller
							control={control}
							name="first_name"
							render={({ field: { onChange, value, onBlur } }) => (
								<View style={styles.inputContainer}>
									<Text style={styles.label}>First Name</Text>
									<TextInput
										style={[styles.input, errors.first_name && styles.inputError]}
										placeholder="Enter your first name"
										autoCapitalize="words"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
									/>
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
								<View style={styles.inputContainer}>
									<Text style={styles.label}>Last Name</Text>
									<TextInput
										style={[styles.input, errors.last_name && styles.inputError]}
										placeholder="Enter your last name"
										autoCapitalize="words"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
									/>
									{errors.last_name && (
										<Text style={styles.errorText}>{errors.last_name.message}</Text>
									)}
								</View>
							)}
						/>

						<Controller
							control={control}
							name="password"
							render={({ field: { onChange, value, onBlur } }) => (
								<View style={styles.inputContainer}>
									<Text style={styles.label}>Password</Text>
									<TextInput
										style={[styles.input, errors.password && styles.inputError]}
										placeholder="Create a password"
										secureTextEntry
										autoCapitalize="none"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
									/>
									{errors.password && (
										<Text style={styles.errorText}>{errors.password.message}</Text>
									)}
								</View>
							)}
						/>

						{error !== "" && <Text style={styles.errorText}>{error}</Text>}

						<Pressable
							style={[styles.button, isLoading && styles.buttonDisabled]}
							onPress={handleSubmit(onSubmit)}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.buttonText}>Create Account</Text>
							)}
						</Pressable>

						{/* <Pressable
							onPress={() => router.push("/(auth)/login")}
							style={styles.linkButton}
						>
							<Text style={styles.linkText}>
								Already have an account? <Text style={styles.linkTextBold}>Login</Text>
							</Text>
						</Pressable> */}

						{/* Verify Email Text */}
						<Pressable
							style={styles.verifyEmailButton}
							onPress={() => setIsVerificationEmailMode(true)}
						>
							<Text style={styles.verifyEmailText}>Verify Email</Text>
						</Pressable>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	scrollContent: {
		flexGrow: 1,
	},
	header: {
		padding: 24,
		paddingTop: 60,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	appName: {
		fontSize: 30,
		fontWeight: "semibold",
		marginTop: 10,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
	},
	infoText: {
		fontSize: 14,
		color: "#333",
		textAlign: "center",
		marginBottom: 20,
	},
	form: {
		flex: 1,
		padding: 24,
		gap: 20,
	},
	inputContainer: {
		gap: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#333",
	},
	input: {
		height: 48,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 16,
		fontSize: 16,
		backgroundColor: "#f8f8f8",
	},
	inputError: {
		borderColor: "#ff4444",
	},
	errorText: {
		color: "#ff4444",
		fontSize: 12,
		marginTop: 4,
	},
	button: {
		height: 48,
		backgroundColor: "#007AFF",
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 12,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	verifyEmailButton: {
		marginTop: -10,
		alignItems: "center",
	},
	verifyEmailText: {
		color: "#007AFF",
		fontSize: 14,
		fontWeight: "500",
	},
	linkButton: {
		alignItems: "center",
		padding: 12,
	},
	linkText: {
		color: "#666",
		fontSize: 14,
	},
	linkTextBold: {
		color: "#007AFF",
		fontWeight: "600",
	},
});
