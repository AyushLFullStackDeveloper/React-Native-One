import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    Dimensions,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Institute, User, Role } from '../services/api';
import { useTheme } from '../theme/useTheme';

// Local Assets
import gni from '../assets/images/gni-logo.png';
import jd from '../assets/images/jd-logo.png';
import raisoni from '../assets/images/raisoni-logo.png';
import run from '../assets/images/run-logo.png';
import ycce from '../assets/images/ycce-logo.png';

// Icons
const locationIcon = require('../assets/icons/location-icon.png');
const arrowIcon = require('../assets/icons/arow-icon.png');
const searchIcon = require('../assets/icons/search-icon.png');
const appLogo = require('../assets/logos/logo-black.png');

type InstituteSelectionRouteProp = RouteProp<RootStackParamList, 'InstituteSelection'>;

const InstituteSelectionScreen = () => {
    const { colors, isDark } = useTheme();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<InstituteSelectionRouteProp>();
    const { user, institutes } = route.params;
    const [searchQuery, setSearchQuery] = useState('');

    const filteredInstitutes = (institutes || []).filter((item: any) => {
        const safeName = item?.institute_name || item?.name || "Unknown Institute";
        const safeLocation = item?.location || [item?.city, item?.state].filter(Boolean).join(", ") || "Location N/A";
        const search = (searchQuery || '').toLowerCase();
        return safeName.toLowerCase().includes(search) || safeLocation.toLowerCase().includes(search);
    });

    const handleSelectInstitute = (institute: Institute) => {
        const roles = institute.roles || [];
        if (roles.length === 1) {
            navigation.navigate('Dashboard', { user, institute, role: roles[0] });
        } else {
            navigation.navigate('RoleSelection', { user, institute, roles, institutes });
        }
    };

    const getLogoSource = (name: string) => {
        const lowerName = (name || '').toLowerCase();
        if (lowerName.includes('gniet') || lowerName.includes('gni')) return gni;
        if (lowerName.includes('rcoem') || lowerName.includes('run')) return run;
        if (lowerName.includes('ycce')) return ycce;
        if (lowerName.includes('jd')) return jd;
        if (lowerName.includes('raisoni')) return raisoni;
        return null;
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Image source={appLogo} style={[styles.headerLogo, isDark && { tintColor: '#FFF' }]} resizeMode="contain" />
                <Text style={[styles.headerAppName, { color: colors.text }]}>SchoolCoreOS</Text>
            </View>
            <View style={[styles.avatarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>
                    {(user.full_name || user.name || 'AR').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
            </View>
        </View>
    );

    const renderGreeting = () => (
        <View style={styles.greetingSection}>
            <Text style={[styles.greetingTitle, { color: colors.text }]}>Hi, {(user.full_name || user.name || 'User').split(' ')[0]} ! 👋</Text>
            <Text style={[styles.greetingSubtitle, { color: colors.textSecondary }]}>
                Select your institute to access your personalized dashboard
            </Text>
        </View>
    );

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <View style={[styles.searchBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Image source={searchIcon} style={[styles.searchIcon, { tintColor: colors.placeholder }]} />
                <TextInput
                    placeholder="Search your institute..."
                    placeholderTextColor={colors.placeholder}
                    style={[styles.searchInput, { color: colors.text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>
    );

    const renderInstituteItem = ({ item }: { item: Institute }) => {
        const title = item?.institute_name || item?.name || "Unknown Institute";
        const locationText = item?.location || [item?.city, item?.state].filter(Boolean).join(", ") || "Location N/A";
        const type = item?.institute_type || "School"; // Fallback as per screenshot
        const logoSource = getLogoSource(title);

        return (
            <TouchableOpacity 
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
                onPress={() => handleSelectInstitute(item)} 
                activeOpacity={0.7}
            >
                <View style={styles.cardInner}>
                    {/* Left: Logo */}
                    <View style={[styles.logoCircle, { backgroundColor: colors.inputBackground }]}>
                        {logoSource ? (
                            <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
                        ) : (
                            <View style={[styles.fallbackLogo, { backgroundColor: colors.border }]} />
                        )}
                    </View>

                    {/* Center: Info */}
                    <View style={styles.cardCenter}>
                        <Text style={[styles.instituteName, { color: colors.text }]} numberOfLines={1}>{title}</Text>
                        <View style={styles.locationRow}>
                            <Image source={locationIcon} style={[styles.locIcon, { tintColor: colors.placeholder }]} />
                            <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>{locationText}</Text>
                        </View>
                    </View>

                    {/* Right: Type + Arrow */}
                    <View style={styles.cardRight}>
                        <Text style={[styles.typeText, { color: colors.textSecondary }]}>{type}</Text>
                        <View style={[styles.arrowButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                            <Image source={arrowIcon} style={[styles.arrowIcon, { tintColor: colors.text }]} />
                        </View>
                    </View>
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
                    data={filteredInstitutes}
                    keyExtractor={(item) => String(item.institute_id || item.id)}
                    renderItem={renderInstituteItem}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={() => (
                        <>
                            {renderGreeting()}
                            {institutes.length >= 5 && renderSearchBar()}
                        </>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.placeholder }]}>No institutes found.</Text>
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                />

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        Can't find your institute? Contact your institute administrator
                    </Text>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        or email us at <Text style={[styles.footerLink, { color: colors.primary }]}>support@schoolcoreos.com</Text>
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainWrapper: {
        flex: 1,
        paddingHorizontal: 20,
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
        paddingVertical: 12,
        marginTop: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerLogo: {
        width: 38,
        height: 38,
    },
    headerAppName: {
        fontSize: 19,
        fontWeight: '700',
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
    },
    greetingSection: {
        marginTop: 30,
        marginBottom: 20,
        alignItems: 'center',
    },
    greetingTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 10,
    },
    greetingSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
        fontWeight: '500',
    },
    searchContainer: {
        marginBottom: 24,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 52,
        borderWidth: 1,
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 40,
    },
    card: {
        borderRadius: 16,
        marginBottom: 12,
        padding: 14,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    cardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logoCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    logoImage: {
        width: 42,
        height: 42,
    },
    fallbackLogo: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    cardCenter: {
        flex: 1,
        marginLeft: 14,
    },
    instituteName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locIcon: {
        width: 14,
        height: 14,
        marginRight: 4,
    },
    locationText: {
        fontSize: 13,
        fontWeight: '500',
    },
    cardRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    typeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    arrowButton: {
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        padding: 6,
    },
    arrowIcon: {
        width: 16,
        height: 16,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
    footer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 18,
    },
    footerLink: {
        fontWeight: '600',
    },
});

export default InstituteSelectionScreen;
