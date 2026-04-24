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
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import BrandingHeader from '../components/BrandingHeader';
import BottomSetupCard from '../components/BottomSetupCard';
import { useTheme } from '../theme/useTheme';

type OtpScreenRouteProp = RouteProp<RootStackParamList, 'Otp'>;

// Specialized Screen for Phone Number Verification via 6-digit OTP code
const OtpScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const route = useRoute<OtpScreenRouteProp>();
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Extract number from navigation params (passed from Login screen)
  const { phoneNumber } = route.params;

  // State for the 6-digit code, initialized as empty strings
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // References to individual input boxes to manage manual focus transitions
  const inputs = useRef<Array<TextInput | null>>([]);

  /**
   * HANDLERS
   */

  // Updates the specific digit in the OTP array and shifts focus to the next field
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus logic: Move to the right if a digit was entered
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  // Logic for backspacing: Move focus to the previous field if current field is empty
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isTablet && styles.tabletScrollContent]}
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
          {/* OTP Section */}
          <View style={[
            styles.otpSection, 
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
            {/* Phone Display */}
            <View style={styles.phoneDisplay}>
              <View style={[styles.flagContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={[styles.countryCode, { color: colors.text }]}>+91</Text>
              </View>
              <TextInput
                style={[styles.disabledInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.placeholder }]}
                value={phoneNumber.replace('+91 ', '')}
                editable={false}
              />
            </View>

            <Text style={[styles.otpTitle, { color: colors.text }]}>Enter 6-digit code</Text>

            <View style={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={[
                    styles.otpBox, 
                    { 
                      backgroundColor: colors.inputBackground, 
                      borderColor: isInputFocused ? '#3B82F6' : colors.inputBorder, 
                      borderWidth: isInputFocused ? 1.5 : 1,
                      color: colors.text 
                    }
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  keyboardType="number-pad"
                  maxLength={1}
                  ref={(ref) => { inputs.current[index] = ref; }}
                />
              ))}
            </View>

            <View style={styles.resendContainer}>
              <Text style={[styles.resendLabel, { color: colors.textSecondary }]}>Didn't get Code? </Text>
              <TouchableOpacity>
                <Text style={[styles.resendLink, { color: colors.primary }]}>Resend Code</Text>
              </TouchableOpacity>
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={[styles.continueBtn, { backgroundColor: colors.success }]}>
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>

        <BottomSetupCard />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OtpScreen;

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
  otpSection: {
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
  phoneDisplay: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  flagContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
  },
  disabledInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 15,
  },
  otpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  otpInputContainer: {
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
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  resendContainer: {
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
  continueBtn: {
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
  continueText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
});
