import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { Button, IconButton, Surface, Text } from 'react-native-paper';
import { PaperDialog } from '../../../../components/common/PaperDialog';
import { useTheme } from '../../../../contexts/ThemeContext';
import { sendMessageService } from '../../../../services/chatService';
import { createOptimisticMessage } from '../../../../utils/ChatUtils';

export const MessageInput = ({ chatId, onMessageSent, replyingTo, onCancelReply, userData }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', actions: [] });
  const { colors } = useTheme();
  
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setDialogContent({
          title: 'Lỗi',
          message: 'Cần quyền truy cập thư viện ảnh để chọn ảnh',
          actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
        });
        setDialogVisible(true);
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map((img) => ({
          uri: img.uri,
          name: img.uri.split('/').pop(),
          type: 'image/jpeg', 
          url: img.uri,
        }));
        
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 5)); 
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setDialogContent({
        title: 'Lỗi',
        message: 'Không thể chọn ảnh',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
    }
  };
  
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSend = async () => {
    if ((!message.trim() && selectedImages.length === 0) || sending) return;

    try {
      setSending(true);
      
      const formData = new FormData();
      
      if (message.trim()) {
        formData.append('content', message);
      }
      
      if (replyingTo) {
        formData.append('replied_to', replyingTo.id);
      }
      
      selectedImages.forEach((img, index) => {
        formData.append('medias', {
          uri: img.uri,
          name: img.name || `image${index}.jpg`,
          type: img.type || 'image/jpeg',
        });
      });

      const optimisticMessage = createOptimisticMessage(
        message, 
        userData, 
        replyingTo, 
        selectedImages
      );
      
      onMessageSent(optimisticMessage);
      
      setMessage('');
      setSelectedImages([]);
      if (replyingTo) onCancelReply();
      
      await sendMessageService(chatId, formData);
    } catch (error) {
      console.error('Error sending message:', error);
      setDialogContent({
        title: 'Lỗi',
        message: 'Không thể gửi tin nhắn. Vui lòng thử lại sau.',
        actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
      });
      setDialogVisible(true);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <>
      <Surface style={styles.inputContainer} elevation={4}>
        {selectedImages.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagePreviewScroll}
            >
              {selectedImages.map((img, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri: img.uri }} style={styles.previewImage} />
                  <IconButton
                    icon="close-circle"
                    size={20}
                    iconColor="white"
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {replyingTo && (
          <Surface style={styles.replyingToContainer} elevation={0}>
            <View style={styles.replyingToContent}>
              <Text variant="labelMedium" style={{ color: colors.textPrimary }}>
                {replyingTo.sender.full_name}
              </Text>
              <Text 
                variant="bodySmall"
                style={{ color: colors.textSecondary }}
                numberOfLines={1}
              >
                {replyingTo.content}
              </Text>
            </View>
            
            <IconButton
              icon="close"
              size={20}
              onPress={onCancelReply}
            />
          </Surface>
        )}
        
        <View style={styles.inputRow}>
          <IconButton
            icon="image"
            size={24}
            onPress={pickImage}
            iconColor={colors.accentColor}
          />
          
          <TextInput
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.backgroundSecondary }]}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          
          <Button
            mode="contained"
            onPress={handleSend}
            disabled={(!message.trim() && selectedImages.length === 0) || sending}
            loading={sending}
            style={styles.sendButton}
            contentStyle={{ height: 40 }}
            labelStyle={{ margin: 0 }}
          >
            {sending ? null : "Gửi"}
          </Button>
        </View>
      </Surface>
      <PaperDialog
        visible={dialogVisible}
        title={dialogContent.title}
        message={dialogContent.message}
        actions={dialogContent.actions}
        onDismiss={() => setDialogVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingBottom: Platform.OS === 'ios' ? 0 : 5, // Add padding on Android
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  replyingToContent: {
    flex: 1,
    marginRight: 10,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(0,0,0,0.2)',
    paddingLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12, 
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 120,
    marginRight: 8,
    textAlignVertical: 'center', // Helps with Android text alignment
  },
  sendButton: {
    borderRadius: 20,
    padding: 0,
    margin: 0,
  },
  imagePreviewContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  imagePreviewScroll: {
    paddingRight: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    margin: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  }
});
