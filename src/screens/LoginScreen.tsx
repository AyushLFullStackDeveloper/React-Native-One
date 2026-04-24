import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    Image,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import BrandingHeader from '../components/BrandingHeader';
import FeatherIcon from 'react-native-vector-icons/Feather';
import BottomSetupCard from '../components/BottomSetupCard';
import { api, Institute, User, Role, BASE_URL } from '../services/api';
import { ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../theme/useTheme';

// Icons
const scannerIcon = require('../assets/images/scanner.png');


type ViewMode = 'DEFAULT' | 'PHONE' | 'EMAIL_OPTIONS' | 'OTP' | 'PASSWORD';

// Main Login Screen supporting Phone, Email, OTP, and Password authentication paths
const LoginScreen = () => {
    const { colors, isDark, toggleTheme } = useTheme();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    
    // Navigation hook for stack navigation
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    /**
     * STATE MANAGEMENT
     * viewMode: Controls which UI flow is visible (DEFAULT, PHONE, OTP, etc.)
     * inputValue: Stores the raw text from the main input (Email or Phone)
     * otp: Array of 6 digits for the verification code
     */
    const [viewMode, setViewMode] = useState<ViewMode>('DEFAULT');
    const [inputValue, setInputValue] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    // References for OTP input boxes for auto-focusing
    const otpInputs = useRef<Array<TextInput | null>>([]);

    const [isInputFocused, setIsInputFocused] = useState(false);

    /**
     * LOGIC HANDLERS
     */

    // Dynamic view switcher based on whether user types numbers (Phone) or text (Email)
    const handleTextChange = (text: string) => {
        setInputValue(text);

        if (text.length === 0) {
            setViewMode('DEFAULT');
        } else if (/^\d+$/.test(text)) {
            setViewMode('PHONE');
        } else {
            setViewMode('EMAIL_OPTIONS');
        }
    };

    // Handles digit entry and auto-focusing for OTP inputs
    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    // Handles backspacing in OTP fields
    const handleOtpKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    /**
     * AUTHENTICATION LOGIC (2-Step Flow)
     * STEP 1: Call /auth/login for token and basic user profile
     * STEP 2: Call /auth/my-institutes-roles for context (institutes/roles)
     */
    const handleLogin = async () => {
        if (!inputValue || !password) {
            Alert.alert("Error", "Please enter both Email/Phone and Password");
            return;
        }

        setIsLoading(true);
        setLoadingText('');
        console.log('--- STARTING 2-STEP AUTH FLOW ---');

        const executeLogin = async (isRetry = false) => {
            console.log(isRetry ? 'STEP 1: Retrying Login...' : 'STEP 1: Initiating Login...');
            return await api.login(inputValue.trim().toLowerCase(), password);
        };

        try {
            // -- STEP 1: Get Token & User --
            let authResponse;
            try {
                authResponse = await executeLogin(false);
            } catch (err: any) {
                if (err.message.includes('Network request failed') || err.message.includes('waking up') || err.message.includes('timeout')) {
                    console.log("Server might be sleeping. Retrying...");
                    setLoadingText('Waking up server...');
                    await new Promise<void>(res => setTimeout(res, 3000));
                    authResponse = await executeLogin(true);
                } else {
                    throw err;
                }
            }
            console.log('STEP 1 SUCCESS. Logged in as:', authResponse.data.user.full_name);

            const { token, user } = authResponse.data;

            // -- STEP 2: Fetch Institutes & Roles --
            console.log('STEP 2: Fetching user context (Institutes & Roles)...');
            const contextResponse = await api.getMyInstitutesRoles(token);
            const institutes = contextResponse.data || [];

            console.log('CONTEXT FETCHED. Total Institutes:', institutes.length);
            // Detailed log of specific fields to check for mapping issues
            if (institutes.length > 0) {
                console.log('First Institute Mapping Check:', {
                    id: institutes[0].institute_id,
                    name: institutes[0].institute_name,
                    location: institutes[0].location,
                    rolesCount: institutes[0].roles?.length
                });
            }

            // -- STEP 3: BRANCHING LOGIC --

            // CASE 1: No institutes assigned
            if (institutes.length === 0) {
                console.log('BRANCH: No Access (0 Institutes)');
                Alert.alert("No Access", "No institute assigned to this user");
                setIsLoading(false);
                return;
            }

            // CASE 2: Single institute
            if (institutes.length === 1) {
                const institute = institutes[0];

                // USER REQUESTED LOGS: Verify Logo URL resolution
                console.log("LOGO URL:", institute.logo || 'N/A');

                const roles = institute.roles || [];

                if (roles.length === 1) {
                    console.log("BRANCH: Dashboard (1 Inst, 1 Role)");
                    navigation.navigate("Dashboard", {
                        user,
                        institute,
                        role: roles[0]
                    });
                } else {
                    console.log("BRANCH: RoleSelection (1 Inst, Multi-Role)");
                    navigation.navigate("RoleSelection", {
                        user,
                        institute,
                        roles,
                        institutes
                    });
                }
            }
            // CASE 3: Multiple institutes
            else {
                console.log("BRANCH: InstituteSelection (Multi-Inst)");
                navigation.navigate("InstituteSelection", {
                    user,
                    institutes
                });
            }

        } catch (error: any) {
            console.log("Auth Flow Error:", error.message);
            Alert.alert("Login Failed", error.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
            setLoadingText('');
            console.log('--- AUTH FLOW END ---');
        }
    };

    // 3. Render
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <ScrollView
                contentContainerStyle={[styles.scrollContent, isTablet && styles.tabletScrollContent]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {!isTablet && <BrandingHeader />}

                {/* Tablet Header Buttons - Positioned Top Right of Screen */}
                {isTablet && (
                    <View style={styles.tabletHeaderButtons}>
                        <TouchableOpacity 
                            style={[styles.tabletHeaderIconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => console.log('Report pressed')}
                        >
                            <Image
                                source={require('../assets/icons/report-icon.png')}
                                style={[styles.headerIcon, { tintColor: colors.text }]}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.tabletHeaderIconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => toggleTheme()}
                        >
                            <Image
                                source={require('../assets/logos/dark-mode.png')}
                                style={[styles.headerIcon, { tintColor: colors.text }]}
                            />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[styles.mainContainer, isTablet && styles.tabletMainContainer]}>
                    <View style={[
                        styles.content, 
                        isTablet && { 
                            backgroundColor: colors.card, 
                            borderRadius: 20, 
                            padding: 32, 
                            marginTop: isTablet ? 60 : 40,
                            elevation: 4, 
                            shadowColor: '#000', 
                            shadowOffset: { width: 0, height: 10 }, 
                            shadowOpacity: 0.1, 
                            shadowRadius: 20, 
                            borderColor: colors.border, 
                            borderWidth: 1 
                        }
                    ]}>
                        {isTablet && (
                            <View style={styles.tabletBranding}>
                                <Image
                                    source={isDark ? require('../assets/logos/logo-white.png') : require('../assets/logos/logo-black.png')}
                                    style={styles.tabletLogo}
                                    resizeMode="contain"
                                />
                                <Text style={[styles.tabletTitle, { color: colors.text }]}>
                                    Mentrix<Text style={{ color: '#2563eb' }}>OS</Text>
                                </Text>
                                <View style={styles.tabletSubtitleContainer}>
                                    <Text style={[styles.tabletSubtitle, { color: colors.text }]}>
                                        MentrixOS = <Text style={styles.orange}>Mentor</Text> + Matrix +{' '}
                                        <Text style={styles.purple}>Metrics</Text>
                                    </Text>
                                    <Text style={[styles.tabletDesc, { color: colors.textSecondary }]}>
                                        combined into one Operating System for your institute
                                    </Text>
                                </View>
                                <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 24, height: 1, width: '100%' }]} />
                            </View>
                        )}
                        {/* --- DYNAMIC INPUT AREA --- */}

                        {/* MODE 1: DEFAULT (Phone or Email) */}
                        {viewMode === 'DEFAULT' && (
                            <View style={styles.inputArea}>
                                <TextInput
                                    placeholder="Phone or Email"
                                    placeholderTextColor={colors.placeholder}
                                    style={[
                                        styles.singleInput, 
                                        { 
                                            backgroundColor: colors.inputBackground, 
                                            borderColor: isInputFocused ? '#3B82F6' : (isDark ? colors.border : colors.inputBorder), 
                                            borderWidth: isInputFocused ? 1.5 : 1,
                                            color: colors.text 
                                        }
                                    ]}
                                    value={inputValue}
                                    onChangeText={handleTextChange}
                                    onFocus={() => setIsInputFocused(true)}
                                    onBlur={() => setIsInputFocused(false)}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                <View style={styles.orContainer}>
                                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                                    <Text style={[styles.orText, { color: colors.textSecondary }]}>OR</Text>
                                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                                </View>
                                <TouchableOpacity style={[styles.joinBtn, { backgroundColor: isTablet ? colors.inputBackground : colors.card, borderColor: colors.border }]}>
                                    <Text style={[styles.joinText, { color: colors.text }]}>
                                        <Image source={scannerIcon} style={[styles.btnIcon, { tintColor: colors.text }]} /> Join Institute
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* MODE 2: PHONE INPUT */}
                        {viewMode === 'PHONE' && (
                            <View style={styles.inputArea}>
                                <View style={styles.phoneInputRow}>
                                    <View style={[styles.countryPicker, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                                        <Text style={styles.flag}>🇮🇳</Text>
                                        <Text style={[styles.countryCode, { color: colors.text }]}>+91</Text>
                                    </View>
                                    <TextInput
                                        placeholder="Enter phone number"
                                        placeholderTextColor={colors.placeholder}
                                        style={[
                                            styles.flexInput, 
                                            { 
                                                backgroundColor: colors.inputBackground, 
                                                borderColor: isInputFocused ? '#3B82F6' : (isDark ? colors.border : colors.inputBorder), 
                                                borderWidth: isInputFocused ? 1.5 : 1,
                                                color: colors.text 
                                            }
                                        ]}
                                        keyboardType="phone-pad"
                                        value={inputValue}
                                        onChangeText={handleTextChange}
                                        onFocus={() => setIsInputFocused(true)}
                                        onBlur={() => setIsInputFocused(false)}
                                        autoFocus
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.tealBtn, { backgroundColor: colors.success }]}
                                    onPress={() => setViewMode('OTP')}
                                >
                                    <Text style={styles.btnText}>Send Code</Text>
                                </TouchableOpacity>
                                <View style={styles.orContainer}>
                                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                                    <Text style={[styles.orText, { color: colors.textSecondary }]}>OR</Text>
                                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                                </View>
                                <TouchableOpacity style={[styles.joinBtn, { backgroundColor: isTablet ? colors.inputBackground : colors.card, borderColor: colors.border }]}>
                                    <Text style={[styles.joinText, { color: colors.text }]}>
                                        <Image source={scannerIcon} style={[styles.btnIcon, { tintColor: colors.text }]} /> Join Institute
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* MODE 3: EMAIL OPTIONS */}
                        {viewMode === 'EMAIL_OPTIONS' && (
                            <View style={styles.inputArea}>
                                <TextInput
                                    placeholder="Phone or Email"
                                    placeholderTextColor={colors.placeholder}
                                    style={[
                                        styles.singleInput, 
                                        { 
                                            backgroundColor: colors.inputBackground, 
                                            borderColor: isInputFocused ? '#3B82F6' : (isDark ? colors.border : colors.inputBorder), 
                                            borderWidth: isInputFocused ? 1.5 : 1,
                                            color: colors.text 
                                        }
                                    ]}
                                    value={inputValue}
                                    onChangeText={handleTextChange}
                                    onFocus={() => setIsInputFocused(true)}
                                    onBlur={() => setIsInputFocused(false)}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.halfTealBtn, { backgroundColor: colors.success }]}
                                        onPress={() => setViewMode('OTP')}
                                    >
                                        <Text style={styles.btnTextThin}>Send Code</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.halfTealBtn, { backgroundColor: colors.success }]}
                                        onPress={() => setViewMode('PASSWORD')}
                                    >
                                        <Text style={styles.btnTextThin}>Use Password</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.orContainer}>
                                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                                    <Text style={[styles.orText, { color: colors.textSecondary }]}>OR</Text>
                                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                                </View>
                                <TouchableOpacity style={[styles.joinBtn, { backgroundColor: isTablet ? colors.inputBackground : colors.card, borderColor: colors.border }]}>
                                    <Text style={[styles.joinText, { color: colors.text }]}>
                                        <Image source={scannerIcon} style={[styles.btnIcon, { tintColor: colors.text }]} /> Join Institute
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* MODE 4: OTP INPUT (Shared) */}
                        {viewMode === 'OTP' && (
                            <View style={styles.inputArea}>
                                {inputValue && /^\d+$/.test(inputValue) ? (
                                    <View style={styles.phoneInputRow}>
                                        <View style={[styles.countryPickerSubtle, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                                            <Text style={styles.flag}>🇮🇳</Text>
                                            <Text style={[styles.countryCode, { color: colors.text }]}>+91</Text>
                                        </View>
                                        <TextInput
                                            style={[styles.flexInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                                            value={inputValue}
                                            onChangeText={handleTextChange}
                                            keyboardType="phone-pad"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                ) : (
                                    <TextInput
                                        style={[styles.singleInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                                        value={inputValue}
                                        onChangeText={handleTextChange}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                )}

                                <Text style={[styles.otpTitle, { color: colors.text }]}>Enter 6-digit code</Text>
                                <View style={styles.otpContainer}>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            style={[styles.otpBox, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                                            value={digit}
                                            onChangeText={(val) => handleOtpChange(val, index)}
                                            onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            autoFocus={index === 0}
                                            ref={(ref) => { otpInputs.current[index] = ref; }}
                                        />
                                    ))}
                                </View>

                                <View style={styles.resendRow}>
                                    <Text style={[styles.resendLabel, { color: colors.textSecondary }]}>Didn't get Code? </Text>
                                    <TouchableOpacity>
                                        <Text style={[styles.resendLink, { color: colors.primary }]}>Resend Code</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[styles.tealBtn, { backgroundColor: colors.success }]}
                                    onPress={() => {
                                        // Note: In real flow, this would be triggered after OTP API success
                                        // For now, providing placeholder to satisfy TypeScript
                                        navigation.navigate('InstituteSelection', {
                                            user: {
                                                id: 'placeholder',
                                                full_name: 'User',
                                                email: inputValue
                                            },
                                            institutes: []
                                        });
                                    }}
                                >
                                    <Text style={styles.btnText}>Continue</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* MODE 5: PASSWORD INPUT */}
                        {viewMode === 'PASSWORD' && (
                            <View style={styles.inputArea}>
                                <TextInput
                                    style={[styles.singleInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                                    value={inputValue}
                                    onChangeText={handleTextChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor={colors.placeholder}
                                    style={[
                                        styles.singleInput, 
                                        { 
                                            backgroundColor: colors.inputBackground, 
                                            borderColor: isInputFocused ? '#3B82F6' : (isDark ? colors.border : colors.inputBorder), 
                                            borderWidth: isInputFocused ? 1.5 : 1,
                                            color: colors.text 
                                        }
                                    ]}
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setIsInputFocused(true)}
                                    onBlur={() => setIsInputFocused(false)}
                                    secureTextEntry
                                    autoFocus
                                />
                                <TouchableOpacity style={styles.forgotPassword}>
                                    <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.tealBtn, { backgroundColor: colors.success }, isLoading && { opacity: 0.7 }]}
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <ActivityIndicator color="#FFF" />
                                            {loadingText ? <Text style={styles.btnText}>{loadingText}</Text> : null}
                                        </View>
                                    ) : (
                                        <Text style={styles.btnText}>Continue</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                <BottomSetupCard />
            </ScrollView>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    tabletScrollContent: {
        alignItems: 'center',
        paddingHorizontal: 40,
        justifyContent: 'center',
    },
    mainContainer: {
        width: '100%',
    },
    tabletMainContainer: {
        maxWidth: 480,
        alignSelf: 'center',
    },
    content: {
        width: '100%',
        marginTop: 10,
    },
    tabletBranding: {
        alignItems: 'center',
        marginBottom: 8,
    },
    tabletHeaderButtons: {
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        right: 0,
        gap: 12,
        padding: 20,
        zIndex: 100,
    },
    tabletHeaderIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    headerIcon: {
        width: 20,
        height: 20,
    },
    tabletLogo: {
        width: 60,
        height: 60,
        marginBottom: 12,
    },
    tabletTitle: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    tabletSubtitleContainer: {
        alignItems: 'center',
    },
    tabletSubtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    tabletDesc: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
        opacity: 0.8,
    },
    orange: {
        color: '#F97316',
        fontWeight: '700',
    },
    purple: {
        color: '#8B5CF6',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        width: '100%',
    },
    inputArea: {
        width: '100%',
    },
    singleInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        marginBottom: 12,
        height: 50,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
    },
    singleInputDisabled: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 18,
        fontSize: 15,
        marginBottom: 12,
    },
    phoneInputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        marginTop: 4,
    },
    countryPicker: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
    },
    countryPickerSubtle: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: 0.8,
    },
    flag: {
        fontSize: 20,
    },
    countryCode: {
        fontSize: 15,
        fontWeight: '600',
    },
    flexInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        height: 50,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
    },
    flexInputDisabled: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 18,
        fontSize: 15,
    },
    tealBtn: {
        borderRadius: 10,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    halfTealBtn: {
        flex: 1,
        borderRadius: 10,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    btnText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
    btnTextThin: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    line: {
        flex: 1,
        height: 1,
    },
    orText: {
        marginHorizontal: 12,
        fontSize: 12,
        fontWeight: '700',
    },
    joinBtn: {
        borderRadius: 10,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    joinText: {
        fontSize: 17,
        fontWeight: '600',
    },
    btnIcon: {
        width: 18,
        height: 18,
    },
    otpTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    otpBox: {
        width: '14%',
        aspectRatio: 1,
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    resendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    resendLabel: {
        fontSize: 15,
    },
    resendLink: {
        fontSize: 15,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
