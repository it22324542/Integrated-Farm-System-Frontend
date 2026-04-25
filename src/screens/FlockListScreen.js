import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';
import { useTheme } from '../context/ThemeContext';
import { TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const FlockListScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlocks();
  }, []);

  const fetchFlocks = async () => {
    try {
      const response = await axios.get(`${API_URL}/flocks`);
      if (response.data.success) {
        setFlocks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching flocks:', error);
      Alert.alert('Error', 'Failed to load flocks');
    } finally {
      setLoading(false);
    }
  };

  const renderFlockCard = ({ item }) => {
    const lastUpdated = new Date(item.updatedAt).toLocaleDateString();
    const lastPrediction = item.lastPredictionDate 
      ? new Date(item.lastPredictionDate).toLocaleDateString()
      : null;
    
    return (
      <View style={{maxWidth: 800, width: '100%', alignSelf: 'center', paddingHorizontal: 20}}>
        <TouchableOpacity
          style={{backgroundColor: colors.card, borderRadius: BORDER_RADIUS.lg, padding: 20, marginBottom: 16, ...SHADOWS.md}}
          onPress={() => navigation.navigate('FlockDetail', { flockId: item._id, flockData: item })}
          activeOpacity={0.7}
        >
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 8}}>
                🐔 {item.name}
              </Text>
              <View style={{flexDirection: 'row', marginBottom: 6}}>
                <Text style={{color: colors.textSecondary, fontSize: 14, marginRight: 16}}>
                  🐓 {item.breed}
                </Text>
                <Text style={{color: colors.textSecondary, fontSize: 14}}>
                  📊 {item.currentCount} birds
                </Text>
              </View>
              <Text style={{color: colors.textSecondary, fontSize: 13, marginBottom: 4}}>
                📅 Updated: {lastUpdated}
              </Text>
              {lastPrediction && (
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                  <Text style={{color: colors.success || '#10B981', fontSize: 13, fontWeight: '500'}}>
                    🔍 Last Prediction: {lastPrediction}
                  </Text>
                  {item.totalPredictions > 0 && (
                    <View style={{backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8}}>
                      <Text style={{color: '#fff', fontSize: 11, fontWeight: 'bold'}}>
                        {item.totalPredictions} total
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            <View style={{alignItems: 'center', marginLeft: 16}}>
              <View style={{backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8}}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 13}}>
                  {item.ageInWeeks}w
                </Text>
              </View>
              <Text style={{color: colors.textSecondary, fontSize: 11, marginTop: 4}}>Age</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background}}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{marginTop: 16, color: colors.textSecondary, fontSize: 16}}>Loading flocks...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <FlatList
        data={flocks}
        renderItem={renderFlockCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{flexGrow: 1, paddingBottom: 40}}
        ListHeaderComponent={() => (
          <View style={{maxWidth: 800, width: '100%', alignSelf: 'center', paddingTop: 20, paddingHorizontal: 20}}>
            {/* Header */}
            <View style={{marginBottom: 24}}>
              <Text style={{fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8}}>
                📋 Flock Profiles
              </Text>
              <Text style={{color: colors.textSecondary, fontSize: 16}}>
                Manage and monitor all your flocks
              </Text>
            </View>

            {/* Create New Flock Button */}
            <TouchableOpacity
              style={{backgroundColor: colors.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: 14, alignItems: 'center', marginBottom: 20, ...SHADOWS.md}}
              onPress={() => navigation.navigate('FlockCreation')}
            >
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
                ➕ Create New Flock
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{maxWidth: 800, width: '100%', alignSelf: 'center', paddingHorizontal: 20}}>
            <View style={{backgroundColor: colors.card, borderRadius: BORDER_RADIUS.lg, padding: 40, alignItems: 'center', ...SHADOWS.md}}>
              <Text style={{fontSize: 48, marginBottom: 16}}>🐔</Text>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 8}}>
                No Flocks Yet
              </Text>
              <Text style={{color: colors.textSecondary, textAlign: 'center'}}>
                Create your first flock to start monitoring chicken growth
              </Text>
            </View>
          </View>
        )}
        style={{flex: 1}}
      />
    </View>
  );
};

export default FlockListScreen;
