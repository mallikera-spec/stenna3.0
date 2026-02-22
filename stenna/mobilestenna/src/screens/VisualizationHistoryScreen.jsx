import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Sparkle, ImageOff, ChevronRight } from 'lucide-react-native';
import { visualizerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const VisualizationHistoryScreen = ({ navigation }) => {
    const { user, token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        if (!user) return;
        try {
            const response = await visualizerApi.getHistory(token);
            setHistory(response.data);
        } catch (error) {
            console.error('Fetch visualizer history error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderHistoryItem = ({ item }) => (
        <View style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            </View>

            <View style={styles.imageGrid}>
                <View style={styles.imageWrapper}>
                    <Text style={styles.imageLabel}>BEFORE</Text>
                    <Image
                        source={{ uri: item.original_image_url }}
                        style={styles.previewImage}
                    />
                </View>
                <View style={styles.imageWrapper}>
                    <Text style={styles.imageLabel}>AFTER</Text>
                    <Image
                        source={{ uri: item.result_image_url }}
                        style={styles.previewImage}
                    />
                </View>
            </View>

            {item.wallpaper && (
                <TouchableOpacity
                    style={styles.wallpaperInfo}
                    onPress={() => navigation.navigate('WallpaperDetail', { slug: item.wallpaper.slug })}
                >
                    <View style={styles.wallpaperRow}>
                        <Text style={styles.wallpaperName}>{item.wallpaper.name?.toUpperCase()}</Text>
                        <ChevronRight size={16} color="#000" />
                    </View>
                    <Text style={styles.designCode}>{item.wallpaper.design_code}</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color="#000" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={history}
                renderItem={renderHistoryItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={history.length > 0 ? styles.listContent : styles.emptyContent}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListHeaderComponent={history.length > 0 ? (
                    <Text style={styles.listHeader}>VISUALIZATION HISTORY</Text>
                ) : null}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Sparkle size={48} color="#eee" strokeWidth={1} />
                        <Text style={styles.emptyTitle}>NO HISTORY YET</Text>
                        <Text style={styles.emptySubtitle}>Your AI generated room visualizations will appear here.</Text>
                        <TouchableOpacity
                            style={styles.browseBtn}
                            onPress={() => navigation.navigate('Visualizer')}
                        >
                            <Text style={styles.browseBtnText}>TRY VISUALIZER</Text>
                        </TouchableOpacity>
                    </View>
                }
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
    },
    listContent: {
        padding: 20,
    },
    emptyContent: {
        flexGrow: 1,
    },
    listHeader: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 3,
        marginBottom: 25,
        color: '#000',
    },
    historyCard: {
        marginBottom: 40,
        backgroundColor: '#fff',
    },
    cardHeader: {
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        marginBottom: 20,
    },
    dateText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#999',
        letterSpacing: 0.5,
    },
    imageGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    imageWrapper: {
        flex: 1,
    },
    imageLabel: {
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 8,
        color: '#999',
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 2,
        backgroundColor: '#f5f5f5',
    },
    wallpaperInfo: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 2,
    },
    wallpaperRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    wallpaperName: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#000',
    },
    designCode: {
        fontSize: 10,
        color: '#666',
        letterSpacing: 0.5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginBottom: 30,
    },
    browseBtn: {
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 25,
        paddingVertical: 12,
    },
    browseBtnText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
    }
});

export default VisualizationHistoryScreen;
