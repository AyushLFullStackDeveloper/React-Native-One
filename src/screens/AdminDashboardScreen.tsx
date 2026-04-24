import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import DashboardCard from '../components/DashboardCard';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/useTheme';

// Icons
const menuIcon = require('../assets/icons/menu-icon.png');
const logoutIcon = require('../assets/icons/logout-icon.png');
const appLogo = require('../assets/logos/logo-black.png');

type DashboardRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

// Main Landing Dashboard after successful authentication and role selection
const AdminDashboardScreen = () => {
    const { colors, isDark } = useTheme();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const route = useRoute<DashboardRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    
    /**
     * DATA CONSUMPTION
     * user: Profile data of the logged-in user
     * institute: The specific institute context for this session
     * role: The specific role (Admin/Teacher/Student) active for this session
     */
    const { user, institute, role } = route.params;

    // Generate initials for the profile avatar (e.g., "John Doe" -> "JD")
    const displayName = user.full_name || user.name || 'User';
    const userInitials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    
    // Safety logout: returns the user to the Login screen and clears the navigation stack
    const handleLogout = () => {
        navigation.replace('Login');
    };
    const renderHeader = () => (
        <View style={[styles.header, { borderBottomColor: colors.border }, isTablet && styles.tabletHeader]}>
            <View style={styles.headerLeft}>
                <TouchableOpacity>
                    <Image source={menuIcon} style={[styles.menuIconStyle, { tintColor: colors.text }]} />
                </TouchableOpacity>
                <Image
                    source={appLogo}
                    style={[styles.logoIconSmall, isDark && { tintColor: '#FFF' }]}
                    resizeMode="contain"
                />
            </View>
            
            <Text style={[styles.instituteLabel, { color: colors.textSecondary }]} numberOfLines={1}>{institute.institute_name || institute.name}</Text>

            <View style={styles.headerRight}>
                <View style={[styles.profileCircle, { backgroundColor: colors.success }]}>
                  <Text style={styles.avatarInitialText}>{userInitials}</Text>
                </View>
                <TouchableOpacity style={[styles.logoutBtn, { borderColor: isDark ? colors.error : '#FECACA', backgroundColor: isDark ? '#1F1111' : '#FFF5F5' }]} onPress={handleLogout}>
                    <Image source={logoutIcon} style={[styles.logoutIconStyle, { tintColor: colors.error }]} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderGreeting = () => (
        <View style={styles.greetingSection}>
            <Text style={[styles.greetingHeading, { color: colors.text }]}>Hey {(user.full_name || user.name || 'User').split(' ')[0]} 👋</Text>
            <Text style={[styles.greetingSub, { color: colors.text }]}>Welcome to SchoolCoreOS {role.role_name || (role as any).name} Panel!</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View style={[styles.mainContent, isTablet && styles.tabletMainWrapper]}>
                {renderHeader()}
                
                <ScrollView 
                    contentContainerStyle={[styles.scrollContainer, isTablet && styles.tabletScrollContainer]}
                    showsVerticalScrollIndicator={false}
                >
                    {renderGreeting()}

                    <View style={[styles.cardList, isTablet && styles.tabletCardGrid]}>
                        <View style={isTablet ? styles.tabletCardItem : null}>
                            <DashboardCard 
                                title="08"
                                subtitle="Active Institutes"
                                description="Institutes actively operating and using the platform for daily management"
                                backgroundColor={isDark ? '#051933' : '#F0F7FF'}
                                accentColor={isDark ? '#60A5FA' : '#2563EB'}
                            />
                        </View>
                        
                        <View style={isTablet ? styles.tabletCardItem : null}>
                            <DashboardCard 
                                title="03"
                                subtitle="Inactive Institutes"
                                description="Institutes currently inactive and not participating in system operations"
                                backgroundColor={isDark ? '#062016' : '#F0FDF4'}
                                accentColor={isDark ? '#4ADE80' : '#16A34A'}
                            />
                        </View>
                        
                        <View style={isTablet ? styles.tabletCardItem : null}>
                            <DashboardCard 
                                title="15+"
                                subtitle="Total Modules"
                                description="Complete set of features enabling academic and administrative workflows"
                                backgroundColor={isDark ? '#2A1205' : '#FFF7ED'}
                                accentColor={isDark ? '#FB923C' : '#EA580C'}
                            />
                        </View>
                        
                        <View style={isTablet ? styles.tabletCardItem : null}>
                            <DashboardCard 
                                title="50+"
                                subtitle="Total Users"
                                description="Total number of students, teachers, and staff members registered in the system"
                                backgroundColor={isDark ? '#1E1B4B' : '#F5F3FF'}
                                accentColor={isDark ? '#A78BFA' : '#7C3AED'}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
    },
    tabletMainWrapper: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    tabletHeader: {
        paddingHorizontal: 40,
        paddingVertical: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuIconStyle: {
        width: 20,
        height: 20,
    },
    logoIconSmall: {
        width: 24,
        height: 24,
    },
    instituteLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    profileCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitialText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    logoutBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutIconStyle: {
        width: 18,
        height: 18,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    tabletScrollContainer: {
        paddingHorizontal: 40,
    },
    greetingSection: {
        marginTop: 40,
        marginBottom: 32,
        alignItems: 'center',
    },
    greetingHeading: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    greetingSub: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        maxWidth: '80%',
    },
    cardList: {
        gap: 12,
    },
    tabletCardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 20,
    },
    tabletCardItem: {
        width: '48%',
    },
});
