import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, ChevronLeft } from 'lucide-react-native';
import { wallpaperApi } from '../services/api';

const { width } = Dimensions.get('window');
const columnWidth = (width - 60) / 2;

const AIRecommendationScreen = ({ navigation }) => {
    const [wallpapers, setWallpapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (id) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            // Simulated AI recommendation fetch
            const response = await wallpaperApi.getAll({ limit: 20 });
            // Shuffle to simulate "AI selection"
            setWallpapers(response.data.sort(() => 0.5 - Math.random()));
        } catch (error) {
            console.error('Fetch recommendations error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (item) => {
        if (!item.images || item.images.length === 0) {
            return 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80';
        }
        const url = item.images[0].image_url;
        if (!url) return 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80';
        if (url.startsWith('http')) return url;
        return `https://jatwtohvdfvundhoigox.supabase.co/storage/v1/object/public/wallpapers/${url}`;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator color="#000" />
                <Text style={styles.loadingText}>CURATING SELECTIONS...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="#000" size={24} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Sparkles size={20} color="#000" />
                    <Text style={styles.headerTitle}>AI RECOMMENDED</Text>
                </View>
                <View style={{ width: 40 }} />
            </View> */}

            {/* <View style={styles.intro}>
                <Text style={styles.introText}>
                    Our AI has analyzed your preferences to curate this selection of architectural wall coverings that match your aesthetic.
                </Text>
            </View> */}

            <FlatList
                data={wallpapers}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('WallpaperDetail', { slug: item.slug })}
                    >
                        <Image
                            source={{
                                uri: imageErrors[item.id]
                                    ? 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80'
                                    : getImageUrl(item)
                            }}
                            style={styles.image}
                            onError={() => handleImageError(item.id)}
                        />
                        <View style={styles.cardInfo}>
                            <Text style={styles.name} numberOfLines={1}>{item.name?.toUpperCase()}</Text>
                            <Text style={styles.designCode}>{item.design_code}</Text>
                            <Text style={styles.price}>₹ {item.price}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f8f8',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '300',
        letterSpacing: 3,
    },
    intro: {
        padding: 30,
        backgroundColor: '#f9f9f9',
    },
    introText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    list: {
        padding: 20,
    },
    card: {
        width: columnWidth,
        marginBottom: 30,
        marginHorizontal: 10,
    },
    image: {
        width: '100%',
        height: columnWidth * 1.4,
        backgroundColor: '#f8f8f8',
        borderRadius: 2,
    },
    cardInfo: {
        marginTop: 12,
    },
    name: {
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    designCode: {
        fontSize: 9,
        color: '#999',
        marginBottom: 6,
    },
    price: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default AIRecommendationScreen;
