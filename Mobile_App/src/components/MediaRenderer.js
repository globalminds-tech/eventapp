import React, { useState, useRef } from 'react';
import { Image, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const MediaRenderer = ({ src, type, style, alt = "media" }) => {
  const [hasError, setHasError] = useState(false);
  
  // Check if it's a video based on type or file extension
  const isVideo = type === 'video' || (typeof src === 'string' && src.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/));

  // Fallback API to replace SVG data URI
  const fallbackImage = "https://placehold.co/400x300/1e293b/64748b.png?text=No+Media";

  const player = useVideoPlayer(isVideo ? src : null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  if (isVideo) {
    return (
      <VideoView
        player={player}
        style={[styles.media, style]}
        contentFit="cover"
        nativeControls={false}
      />
    );
  }

  return (
    <Image 
      source={{ uri: hasError ? fallbackImage : src }} 
      style={[styles.media, style]}
      accessibilityLabel={alt}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
};

const styles = StyleSheet.create({
  media: {
    width: '100%',
    height: '100%',
  }
});

export default MediaRenderer;
