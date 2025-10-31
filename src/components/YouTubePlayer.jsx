import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getYouTubeVideoId } from '@/services/videosService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function YouTubePlayer({ youtubeUrl, onReady, onError, style }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef(null);

  const videoId = getYouTubeVideoId(youtubeUrl);

  // Auto-play when component mounts
  useEffect(() => {
    if (videoId) {
      const timer = setTimeout(() => {
        setPlaying(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [videoId]);

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
    } else if (state === 'playing') {
      setPlaying(true);
      setLoading(false);
    } else if (state === 'paused') {
      setPlaying(false);
    } else if (state === 'buffering') {
      setLoading(false);
    }
  }, []);

  const handleReady = useCallback(() => {
    setLoading(false);
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  const handleError = useCallback((error) => {
    setLoading(false);
    console.error('YouTube Player Error:', error);
    if (onError) {
      onError(error);
    }
  }, [onError]);

  if (!videoId) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      )}
      <YoutubePlayer
        ref={playerRef}
        height={250}
        width={SCREEN_WIDTH}
        videoId={videoId}
        play={playing}
        onChangeState={onStateChange}
        onReady={handleReady}
        onError={handleError}
        webViewProps={{
          androidLayerType: 'hardware',
          allowsFullscreenVideo: true,
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
          javaScriptEnabled: true,
          domStorageEnabled: true,
        }}
        initialPlayerParams={{
          modestbranding: 1,
          showClosedCaptions: false,
          rel: 0,
          loop: 0,
          controls: 1,
          preventFullScreen: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
