import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Role, User, Institute } from '../services/api';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme/useTheme';

// Icons
const locationIcon = require('../assets/icons/location-icon.png');
const arrowIcon = require('../assets/icons/arow-icon.png');
const backIcon = require('../assets/icons/back-icon.png');
const verifiedIcon = require('../assets/icons/verified-icon.png');
const appLogo = require('../assets/logos/logo-black.png');

// Local Logo Imports
import gni from '../assets/images/gni-logo.png';
import jd from '../assets/images/jd-logo.png';
import raisoni from '../assets/images/raisoni-logo.png';
import run from '../assets/images/run-logo.png';
import ycce from '../assets/images/ycce-logo.png';

// Role Logos
import adminLogo from '../assets/images/admin-logo.png';
import studentLogo from '../assets/images/student-logo.png';
import trainerLogo from '../assets/images/trainer-logo.png';

type RoleSelectionRouteProp = RouteProp<RootStackParamList, 'RoleSelection'>;

// Screen for selecting a specific role within a chosen institute (e.g., Admin vs Teacher)
const RoleSelectionScreen = () => {
    const { colors, isDark } = useTheme();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RoleSelectionRouteProp>();
    
    /**
     * EXTRACT DATA
     * user: Current logged in user profile
     * institute: The institute selected in the previous screen
     * roles: A pre-filtered list of roles for the specific institute selected
     * institutes: The full list of institutes the user has access to (for backtracking)
     */
    const { user, institute, roles, institutes } = route.params;

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Image
                    source={appLogo}
                    style={[styles.logo, isDark && { tintColor: '#FFF' }]}
                    resizeMode="contain"
                />
                <Text style={[styles.appName, { color: colors.text }]}>
                    SchoolCore<Text style={{ color: '#2563eb' }}>OS</Text>
                </Text>
            </View>
            <View style={[styles.avatarCircle, { backgroundColor: colors.card }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>
                    {(user.full_name || user.name || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
            </View>
        </View>
    );

    /**
     * LOCAL LOGO MAPPING
     * Maps keywords found in institute names to local static assets
     */
    const getLogoSource = (name: string) => {
        const lowerName = (name || '').toLowerCase();
        if (lowerName.includes('gniet') || lowerName.includes('gni')) return gni;
        if (lowerName.includes('rcoem') || lowerName.includes('run')) return run;
        if (lowerName.includes('ycce')) return ycce;
        if (lowerName.includes('jd')) return jd;
        if (lowerName.includes('raisoni')) return raisoni;
        return null;
    };

    /**
     * LOGO RENDERING COMPONENT
     * Uses local assets for instant rendering and offline stability
     */
    const InstituteLogo = ({ name }: { name: string }) => {
        const logoSource = getLogoSource(name);

        if (!logoSource) {
            return (
                <View style={styles.instituteLogoBg}>
                    <MaterialIcon name="school" size={24} color={colors.text} />
                </View>
            );
        }

        return (
            <View style={styles.instituteLogoBg}>
                <Image
                    source={logoSource}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </View>
        );
    };

    const renderSelectedInstitute = () => (
        <View style={styles.selectedSection}>
            {institutes.length > 1 && (
                <TouchableOpacity 
                    style={[styles.changeInstBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.navigate('InstituteSelection', { user, institutes })}
                >
                    <Text style={[styles.changeInstText, { color: colors.text }]}>
                        <Image source={backIcon} style={[styles.backIcon, { tintColor: colors.text }]} /> Change Institute
                    </Text>
                </TouchableOpacity>
            )}

            <View style={[styles.selectedCard, { backgroundColor: isDark ? colors.tealLight : '#E0ECFF', borderColor: isDark ? colors.teal : '#BFDBFE' }]}>
                <View style={styles.cardLeft}>
                    <InstituteLogo name={institute.institute_name || institute.name || ''} />
                </View>
                <View style={styles.cardCenter}>
                    <Text style={[styles.instituteName, { color: isDark ? '#FFF' : '#1e1b4b' }]}>{institute.institute_name || institute.name}</Text>
                    <View style={styles.locationRow}>
                        <Image source={locationIcon} style={[styles.locIcon, { tintColor: isDark ? '#CBD5E1' : '#94a3b8' }]} />
                        <Text style={[styles.locationText, { color: isDark ? '#CBD5E1' : '#64748b' }]}>{institute.location}</Text>
                    </View>
                </View>
                <Image source={verifiedIcon} style={styles.verifiedIconStyle} />
            </View>
        </View>
    );

    const renderTitle = () => {
        const instName = institute?.institute_name || institute?.name || "the Institute";
        return (
            <View style={styles.titleSection}>
                <Text style={[styles.titleText, { color: colors.text }]}>Choose Your Role</Text>
                <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
                    Select how you'd like to access {instName}
                </Text>
            </View>
        );
    };

    const getRoleLogo = (roleName: string) => {
        const lowerName = (roleName || '').toLowerCase();
        if (lowerName.includes('admin')) return adminLogo;
        if (lowerName.includes('student')) return studentLogo;
        if (
            lowerName.includes('teacher') || 
            lowerName.includes('faculty') || 
            lowerName.includes('lecturer') || 
            lowerName.includes('professor') || 
            lowerName.includes('tutor') ||
            lowerName.includes('staff') ||
            lowerName.includes('trainer') ||
            lowerName.includes('instructor')
        ) return trainerLogo;
        
        console.log(`[Role Mapping] No local icon found for: "${roleName}"`);
        return null;
    };

    const renderRoleItem = ({ item }: { item: Role }) => {
        const name = item?.role_name || (item as any)?.name || "User";
        const description = item?.description || "Select to enter dashboard";
        const roleLogo = getRoleLogo(name);

        return (
            <TouchableOpacity 
                style={[styles.roleCard, { backgroundColor: colors.card }]}
                onPress={() => {
                    navigation.navigate('Dashboard', {
                        user,
                        institute,
                        role: item
                    });
                }}
            >
                <View style={styles.roleIconContainer}>
                    {roleLogo ? (
                        <Image source={roleLogo} style={styles.roleLogoImage} resizeMode="contain" />
                    ) : (
                        <FeatherIcon name={(item.icon || 'user') as any} size={20} color={item.accentColor || colors.primary} />
                    )}
                </View>
                <View style={styles.roleContent}>
                    <Text style={[styles.roleName, { color: colors.text }]}>{name}</Text>
                    <Text style={[styles.roleDesc, { color: colors.textSecondary }]}>{description}</Text>
                </View>
                <View style={[styles.arrowBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                    <Image source={arrowIcon} style={[styles.arrowIcon, { tintColor: colors.text }]} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View style={[styles.mainWrapper, isTablet && styles.tabletWrapper]}>
                {renderHeader()}
                
                <FlatList
                    data={roles}
                    keyExtractor={(item) => String(item.role_id || (item as any).id)}
                    renderItem={renderRoleItem}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={() => (
                        <>
                            {renderSelectedInstitute()}
                            {renderTitle()}
                        </>
                    )}
                    showsVerticalScrollIndicator={false}
                />

                {/* Footer Section */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        Can't find your role? Contact your institute administrator
                    </Text>
                    <View style={styles.footerContactRow}>
                      <Text style={[styles.footerText, { color: colors.textSecondary }]}>or email us at </Text>
                      <TouchableOpacity>
                          <Text style={[styles.footerEmail, { color: colors.primary }]}>support@schoolcoreos.com</Text>
                      </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainWrapper: {
        flex: 1,
        paddingHorizontal: 24,
    },
    tabletWrapper: {
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logo: {
        width: 32,
        height: 32,
    },
    appName: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
    },
    selectedSection: {
        marginTop: 16,
        marginBottom: 24,
    },
    changeInstBtn: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 100,
        borderWidth: 1,
        marginBottom: 20,
    },
    changeInstText: {
        fontSize: 14,
        fontWeight: '700',
    },
    backIcon: {
        width: 14,
        height: 14,
        marginRight: 6,
    },
    selectedCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    cardLeft: {
        marginRight: 16,
    },
    verifiedIconStyle: {
        width: 24,
        height: 24,
    },
    instituteLogoBg: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    logoImage: {
        width: 38,
        height: 38,
        borderRadius: 8,
    },
    cardCenter: {
        flex: 1,
        justifyContent: 'center',
    },
    instituteName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locIcon: {
        width: 12,
        height: 12,
    },
    locationText: {
        fontSize: 13,
        fontWeight: '500',
    },
    titleSection: {
        marginBottom: 24,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    roleCard: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    roleIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    roleLogoImage: {
        width: 30,
        height: 30,
    },
    roleContent: {
        flex: 1,
    },
    roleName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 2,
    },
    roleDesc: {
        fontSize: 13,
        fontWeight: '500',
    },
    arrowBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    arrowIcon: {
        width: 14,
        height: 14,
    },
    footerText: {
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '500',
    },
    footerContactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    footerEmail: {
        fontSize: 13,
        fontWeight: '600',
    },
    footer: {
        marginTop: 40,
        paddingBottom: 32,
        alignItems: 'center',
    },
});
