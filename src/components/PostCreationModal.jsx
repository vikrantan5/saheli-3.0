import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Image as ImageIcon, AlertTriangle, Heart, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/utils/useTheme';
import { createPost } from '@/services/communityService';
import { pickImage, uploadImage } from '@/utils/imageUpload';

export default function PostCreationModal({ visible, onClose, onPostCreated }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { 
      id: 'safety-alerts', 
      label: 'Safety Alert', 
      icon: AlertTriangle,
      color: '#EF4444',
      description: 'Report urgent safety concerns'
    },
    { 
      id: 'support', 
      label: 'Support', 
      icon: Heart,
      color: '#10B981',
      description: 'Seek or offer emotional support'
    },
    { 
      id: 'general', 
      label: 'General', 
      icon: MessageCircle,
      color: '#6B7280',
      description: 'General discussions and tips'
    },
  ];

  const handlePickImage = async () => {
    try {
      const image = await pickImage();
      if (image) {
        setSelectedImage(image);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter post content');
      return;
    }

    if (content.trim().length < 10) {
      Alert.alert('Error', 'Post content must be at least 10 characters');
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        console.log('Uploading image...');
        imageUrl = await uploadImage(selectedImage.uri, 'community_posts');
      }

      // Create post
      const postData = {
        content: content.trim(),
        category: selectedCategory,
        isAnonymous,
        imageUrl,
      };

      await createPost(postData);

      // Success - reset and close
      Alert.alert('Success', 'Post created successfully!');
      resetForm();
      onPostCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setSelectedCategory('general');
    setIsAnonymous(false);
    setSelectedImage(null);
  };

  const handleClose = () => {
    if (content.trim() || selectedImage) {
      Alert.alert(
        'Discard Post?',
        'Are you sure you want to discard this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              resetForm();
              onClose();
            }
          },
        ]
      );
    } else {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.divider,
        }}>
          <TouchableOpacity onPress={handleClose} disabled={isLoading}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 18,
            color: theme.colors.text,
          }}>
            Create Post
          </Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={isLoading || !content.trim()}
            style={{
              backgroundColor: (!content.trim() || isLoading) 
                ? theme.colors.buttonBackground 
                : theme.colors.success,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                color: '#FFFFFF',
              }}>
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
            {/* Category Selection */}
            <Text style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 16,
              color: theme.colors.text,
              marginBottom: 12,
            }}>
              Category
            </Text>
            <View style={{ gap: 12, marginBottom: 24 }}>
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isSelected ? category.color + '20' : theme.colors.elevated,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? category.color : theme.colors.divider,
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: category.color,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}>
                      <IconComponent size={20} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 16,
                        color: theme.colors.text,
                        marginBottom: 2,
                      }}>
                        {category.label}
                      </Text>
                      <Text style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                      }}>
                        {category.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Anonymous Toggle */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme.colors.elevated,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 4,
                }}>
                  Post Anonymously
                </Text>
                <Text style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                }}>
                  Your name will be hidden
                </Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: theme.colors.buttonBackground, true: theme.colors.success }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Content Input */}
            <Text style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 16,
              color: theme.colors.text,
              marginBottom: 12,
            }}>
              What's on your mind?
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                color: theme.colors.text,
                minHeight: 150,
                textAlignVertical: 'top',
                marginBottom: 16,
              }}
              placeholder="Share your thoughts, concerns, or tips..."
              placeholderTextColor={theme.colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={1000}
            />
            <Text style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: theme.colors.textTertiary,
              textAlign: 'right',
              marginBottom: 24,
            }}>
              {content.length}/1000
            </Text>

            {/* Image Attachment */}
            {selectedImage ? (
              <View style={{
                position: 'relative',
                marginBottom: 24,
              }}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 12,
                  }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: 20,
                    width: 32,
                    height: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePickImage}
                disabled={isLoading}
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderWidth: 2,
                  borderColor: theme.colors.divider,
                  borderStyle: 'dashed',
                  borderRadius: 12,
                  padding: 24,
                  alignItems: 'center',
                  marginBottom: 24,
                }}
              >
                <ImageIcon size={32} color={theme.colors.textSecondary} strokeWidth={1.5} />
                <Text style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: theme.colors.text,
                  marginTop: 8,
                }}>
                  Add Image (Optional)
                </Text>
                <Text style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginTop: 4,
                }}>
                  Tap to select from gallery
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
