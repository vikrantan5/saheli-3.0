import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Video, Plus, Trash2, Edit, Save, X } from 'lucide-react-native';
import { useTheme } from '@/utils/useTheme';
import LoadingScreen from '@/components/LoadingScreen';
import {
  getAllVideos,
  addVideo,
  updateVideo,
  deleteVideo,
  getYouTubeThumbnail,
} from '@/services/videosService';

export default function AdminVideosScreen() {
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
  });
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const fetchedVideos = await getAllVideos();
      setVideos(fetchedVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
      Alert.alert('Error', 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async () => {
    if (!formData.title.trim() || !formData.youtubeUrl.trim()) {
      Alert.alert('Error', 'Please enter title and YouTube URL');
      return;
    }

    try {
      await addVideo({
        title: formData.title.trim(),
        description: formData.description.trim(),
        youtubeUrl: formData.youtubeUrl.trim(),
        thumbnailUrl: getYouTubeThumbnail(formData.youtubeUrl.trim()),
      });

      Alert.alert('Success', 'Video added successfully');
      setFormData({ title: '', description: '', youtubeUrl: '' });
      setShowAddForm(false);
      loadVideos();
    } catch (error) {
      console.error('Error adding video:', error);
      Alert.alert('Error', 'Failed to add video');
    }
  };

  const handleUpdateVideo = async () => {
    if (!formData.title.trim() || !formData.youtubeUrl.trim()) {
      Alert.alert('Error', 'Please enter title and YouTube URL');
      return;
    }

    try {
      await updateVideo(editingId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        youtubeUrl: formData.youtubeUrl.trim(),
        thumbnailUrl: getYouTubeThumbnail(formData.youtubeUrl.trim()),
      });

      Alert.alert('Success', 'Video updated successfully');
      setFormData({ title: '', description: '', youtubeUrl: '' });
      setEditingId(null);
      loadVideos();
    } catch (error) {
      console.error('Error updating video:', error);
      Alert.alert('Error', 'Failed to update video');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVideo(videoId);
              Alert.alert('Success', 'Video deleted successfully');
              loadVideos();
            } catch (error) {
              console.error('Error deleting video:', error);
              Alert.alert('Error', 'Failed to delete video');
            }
          },
        },
      ]
    );
  };

  const handleEditVideo = (video) => {
    setFormData({
      title: video.title,
      description: video.description || '',
      youtubeUrl: video.youtubeUrl,
    });
    setEditingId(video.id);
    setShowAddForm(true);
  };

  const cancelForm = () => {
    setFormData({ title: '', description: '', youtubeUrl: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 24,
              color: theme.colors.text,
              marginBottom: 4,
            }}
          >
            Manage Safety Videos
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: theme.colors.textSecondary,
            }}
          >
            Add and manage safety tutorial videos
          </Text>
        </View>

        {/* Add Video Button */}
        {!showAddForm && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.success,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setShowAddForm(true)}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2} />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: '#FFFFFF',
                  marginLeft: 8,
                }}
              >
                Add New Video
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <View
            style={{
              backgroundColor: theme.colors.elevated,
              borderRadius: 12,
              padding: 20,
              marginHorizontal: 24,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 18,
                color: theme.colors.text,
                marginBottom: 16,
              }}
            >
              {editingId ? 'Edit Video' : 'Add New Video'}
            </Text>

            {/* Title Input */}
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Title *
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                padding: 12,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 16,
              }}
              placeholder="e.g., Self Defense Tips for Women"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            {/* YouTube URL Input */}
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              YouTube URL *
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                padding: 12,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 16,
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.youtubeUrl}
              onChangeText={(text) => setFormData({ ...formData, youtubeUrl: text })}
              autoCapitalize="none"
            />

            {/* Description Input */}
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Description
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                padding: 12,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 20,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder="Brief description of the video content"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.buttonBackground,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
                onPress={cancelForm}
              >
                <X size={16} color={theme.colors.text} strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 14,
                    color: theme.colors.text,
                    marginLeft: 6,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.success,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
                onPress={editingId ? handleUpdateVideo : handleAddVideo}
              >
                <Save size={16} color="#FFFFFF" strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginLeft: 6,
                  }}
                >
                  {editingId ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Videos List */}
        {loading ? (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.text} />
          </View>
        ) : videos.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 48,
              paddingHorizontal: 24,
            }}
          >
            <Video size={48} color={theme.colors.textSecondary} strokeWidth={1.5} />
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: theme.colors.text,
                marginTop: 16,
              }}
            >
              No videos added yet
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 24 }}>
            {videos.map((video) => (
              <View
                key={video.id}
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  {video.title}
                </Text>
                {video.description && (
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      marginBottom: 12,
                      lineHeight: 20,
                    }}
                    numberOfLines={2}
                  >
                    {video.description}
                  </Text>
                )}

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.buttonBackground,
                      borderRadius: 8,
                      padding: 10,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                    onPress={() => handleEditVideo(video)}
                  >
                    <Edit size={16} color={theme.colors.text} strokeWidth={1.5} />
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 12,
                        color: theme.colors.text,
                        marginLeft: 6,
                      }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.error,
                      borderRadius: 8,
                      padding: 10,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                    onPress={() => handleDeleteVideo(video.id)}
                  >
                    <Trash2 size={16} color="#FFFFFF" strokeWidth={1.5} />
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 12,
                        color: '#FFFFFF',
                        marginLeft: 6,
                      }}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
