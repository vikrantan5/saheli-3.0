import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Video, X, Play } from 'lucide-react-native';
import { useTheme } from '@/utils/useTheme';
import LoadingScreen from '@/components/LoadingScreen';
import TopNavbar from '@/components/TopNavbar';
import YouTubePlayer from '@/components/YouTubePlayer';
import { getAllVideos } from '@/services/videosService';

export default function VideosScreen() {
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
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
      Alert.alert('Error', 'Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
    setShowPlayer(true);
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setSelectedVideo(null);
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />
      
      {/* Top Navbar */}
      <TopNavbar title="Safety Videos" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
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
            Safety Tutorials
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: theme.colors.textSecondary,
            }}
          >
            Learn essential safety tips and self-defense techniques
          </Text>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.text} />
          </View>
        )}

        {/* Videos List */}
        {!loading && videos.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 48,
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.colors.buttonBackground,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Video size={28} color={theme.colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 18,
                color: theme.colors.text,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              No videos available
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.colors.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              Check back later for safety tutorials and tips
            </Text>
          </View>
        )}

        {!loading && videos.length > 0 && (
          <View style={{ paddingHorizontal: 24 }}>
            {videos.map((video, index) => (
              <TouchableOpacity
                key={video.id}
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  marginBottom: 16,
                  overflow: 'hidden',
                }}
                onPress={() => handlePlayVideo(video)}
                activeOpacity={0.8}
                data-testid={`video-item-${index}`}
              >
                {/* Thumbnail */}
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: video.thumbnailUrl }}
                    style={{
                      width: '100%',
                      height: 200,
                      backgroundColor: theme.colors.buttonBackground,
                    }}
                    resizeMode="cover"
                  />
                  {/* Play Button Overlay */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: theme.colors.emergency,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
                    </View>
                  </View>
                </View>

                {/* Video Info */}
                <View style={{ padding: 16 }}>
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
                        lineHeight: 20,
                      }}
                      numberOfLines={2}
                    >
                      {video.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Video Player Modal */}
      <Modal
        visible={showPlayer}
        animationType="slide"
        onRequestClose={closePlayer}
      >
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <StatusBar style={theme.colors.statusBar} />
          
          {/* Header */}
          <View
            style={{
              backgroundColor: theme.colors.background,
              paddingTop: insets.top + 8,
              paddingBottom: 12,
              paddingHorizontal: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.divider,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 18,
                color: theme.colors.text,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {selectedVideo?.title}
            </Text>
            <TouchableOpacity
              onPress={closePlayer}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.elevated,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 12,
              }}
            >
              <X size={20} color={theme.colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Video Player */}
          {selectedVideo && (
            <YouTubePlayer
              youtubeUrl={selectedVideo.youtubeUrl}
              style={{ width: '100%', height: 250 }}
              onError={(error) => {
                console.error('Error playing video:', error);
                Alert.alert('Error', 'Failed to load video. Please try again.');
              }}
            />
          )}

          {/* Video Description */}
          {selectedVideo?.description && (
            <View
              style={{
                backgroundColor: theme.colors.elevated,
                padding: 24,
                paddingBottom: insets.bottom + 24,
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
                About this video
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  lineHeight: 20,
                }}
              >
                {selectedVideo.description}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
