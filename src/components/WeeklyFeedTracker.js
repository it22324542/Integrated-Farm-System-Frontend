import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import { API_URL } from '../config/apiConfig';
import * as ImagePicker from 'expo-image-picker';

const WeeklyFeedTracker = ({ flockId, onDataUpdate }) => {
    const [weeklyData, setWeeklyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadingDay, setUploadingDay] = useState(null);

    useEffect(() => {
        if (flockId) {
            fetchWeeklyData();
        }
    }, [flockId]);

    const fetchWeeklyData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/predictions/weekly-feed/${flockId}`);
            const data = await response.json();
            
            console.log('Weekly feed data:', data);
            
            if (data.success && data.data.weeklyTracking) {
                setWeeklyData(data.data.weeklyTracking);
                if (onDataUpdate) {
                    onDataUpdate(data.data.weeklyTracking);
                }
            } else {
                setWeeklyData(null);
            }
        } catch (error) {
            console.error('Error fetching weekly feed data:', error);
            setWeeklyData(null);
        } finally {
            setLoading(false);
        }
    };

    const requestCameraPermission = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera permission is required to take photos');
                return false;
            }
        }
        return true;
    };

    const handleImageUpload = async (dayNumber) => {
        try {
            // Check if this day already has an image
            const dailyRecords = weeklyData?.dailyRecords || [];
            if (dailyRecords.find(r => r.dayNumber === dayNumber)) {
                Alert.alert('Already Uploaded', 'This day already has a feed image');
                return;
            }

            // Request permission
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) return;

            // Show options: Camera or Gallery
            if (Platform.OS === 'web') {
                // For web, use file input
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        await uploadImage(file, dayNumber);
                    }
                };
                input.click();
            } else {
                // For mobile, show action sheet
                Alert.alert(
                    'Upload Feed Image',
                    'Choose image source',
                    [
                        {
                            text: 'Camera',
                            onPress: () => pickImage('camera', dayNumber)
                        },
                        {
                            text: 'Gallery',
                            onPress: () => pickImage('gallery', dayNumber)
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel'
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error handling image upload:', error);
            Alert.alert('Error', 'Failed to upload image');
        }
    };

    const pickImage = async (source, dayNumber) => {
        try {
            let result;
            if (source === 'camera') {
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets[0]) {
                await uploadImage(result.assets[0], dayNumber);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadImage = async (imageData, dayNumber) => {
        try {
            setUploading(true);
            setUploadingDay(dayNumber);

            const formData = new FormData();
            
            if (Platform.OS === 'web') {
                // For web (File object)
                formData.append('feedImage', imageData);
            } else {
                // For mobile (expo-image-picker result)
                const uri = imageData.uri;
                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('feedImage', {
                    uri: uri,
                    name: filename,
                    type: type
                });
            }

            console.log(`Uploading image for Day ${dayNumber}...`);

            const response = await fetch(`${API_URL}/predictions/upload-feed-image/${flockId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert(
                    'Success!',
                    `Day ${dayNumber} uploaded!\n${data.data.statusMessage}\nFeed Consumption: ${data.data.feedConsumedPercentage}%`,
                    [{ text: 'OK', onPress: () => fetchWeeklyData() }]
                );
            } else {
                Alert.alert('Error', data.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Upload Failed', 'Could not upload the image. Please try again.');
        } finally {
            setUploading(false);
            setUploadingDay(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color="#4CAF50" />
            </View>
        );
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyRecords = weeklyData?.dailyRecords || [];
    const weekNumber = weeklyData?.weekNumber || 1;
    const isWeekComplete = weeklyData?.isComplete || false;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📊 Weekly Feed Consumption Tracker</Text>
            <Text style={styles.subtitle}>
                Week {weekNumber} - Day {dailyRecords.length} of 7
            </Text>

            {!isWeekComplete && (
                <Text style={styles.instructionText}>
                    📸 Tap on empty boxes to upload daily feed images
                </Text>
            )}

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.daysContainer}
                contentContainerStyle={styles.daysContentContainer}
            >
                {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                    const record = dailyRecords.find(r => r.dayNumber === dayNum);
                    const dayName = days[dayNum - 1];
                    const isUploading = uploadingDay === dayNum;

                    return (
                        <View key={dayNum} style={styles.dayBox}>
                            <Text style={styles.dayLabel}>{dayName}</Text>
                            <Text style={styles.dayNumber}>Day {dayNum}</Text>
                            
                            {record ? (
                                <View style={styles.recordContainer}>
                                    <Image
                                        source={{ uri: `${API_URL}${record.imageUrl}` }}
                                        style={styles.feedImage}
                                        resizeMode="cover"
                                        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                                    />
                                    <View style={[
                                        styles.percentageBadge,
                                        { backgroundColor: getPercentageColor(record.feedConsumedPercentage) }
                                    ]}>
                                        <Text style={styles.percentageText}>
                                            {record.feedConsumedPercentage}%
                                        </Text>
                                    </View>
                                    <Text style={styles.dateText}>
                                        {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.emptyBox, isUploading && styles.uploadingBox]}
                                    onPress={() => !uploading && !isWeekComplete && handleImageUpload(dayNum)}
                                    disabled={uploading || isWeekComplete}
                                >
                                    {isUploading ? (
                                        <ActivityIndicator size="small" color="#4CAF50" />
                                    ) : (
                                        <>
                                            <Text style={styles.uploadIcon}>📷</Text>
                                            <Text style={styles.uploadText}>Tap to{'\n'}Upload</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </ScrollView>

            {isWeekComplete && weeklyData.overallAnalysis && (
                <View style={[
                    styles.analysisContainer,
                    { backgroundColor: getStatusColor(weeklyData.overallAnalysis.status) }
                ]}>
                    <Text style={styles.analysisTitle}>📊 Week {weekNumber} Summary</Text>
                    <Text style={styles.analysisText}>
                        {weeklyData.overallAnalysis.message}
                    </Text>
                    <Text style={styles.averageText}>
                        Average Consumption: {weeklyData.overallAnalysis.averageConsumption}%
                    </Text>
                </View>
            )}

            {isWeekComplete && (
                <Text style={styles.completedText}>
                    ✅ This week is complete. New predictions will start a new week.
                </Text>
            )}
        </View>
    );
};

// Helper function to get color based on percentage
const getPercentageColor = (percentage) => {
    if (percentage >= 75) return '#4CAF50'; // Green
    if (percentage >= 50) return '#8BC34A'; // Light Green
    if (percentage >= 25) return '#FF9800'; // Orange
    return '#F44336'; // Red
};

// Helper function to get status color
const getStatusColor = (status) => {
    switch (status) {
        case 'Good':
            return '#E8F5E9'; // Light Green
        case 'Needs Attention':
            return '#FFF3E0'; // Light Orange
        case 'Critical':
            return '#FFEBEE'; // Light Red
        default:
            return '#F5F5F5';
    }
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 13,
        color: '#4CAF50',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
    daysContainer: {
        marginTop: 8,
    },
    daysContentContainer: {
        paddingRight: 8,
    },
    dayBox: {
        width: 90,
        marginRight: 12,
        alignItems: 'center',
    },
    dayLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 2,
    },
    dayNumber: {
        fontSize: 10,
        color: '#999',
        marginBottom: 6,
    },
    recordContainer: {
        alignItems: 'center',
    },
    feedImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    emptyBox: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadingBox: {
        backgroundColor: '#f0f8f0',
        borderColor: '#4CAF50',
    },
    uploadIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    uploadText: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        lineHeight: 12,
    },
    emptyBoxText: {
        fontSize: 24,
        color: '#ccc',
        fontWeight: '300',
    },
    percentageBadge: {
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 45,
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#fff',
    },
    dateText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
    },
    analysisContainer: {
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
    },
    analysisTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    analysisText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    averageText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    completedText: {
        fontSize: 13,
        color: '#4CAF50',
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
});

export default WeeklyFeedTracker;
