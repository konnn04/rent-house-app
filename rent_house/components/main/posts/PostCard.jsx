import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";
import { useUser } from "../../../contexts/UserContext";
import {
  deletePostService,
  interactWithPostService,
} from "../../../services/postService";
import { truncateText } from "../../../utils/Tools";
import { ImageGallery } from "../../common/ImageGallery";
import { PaperDialog } from '../../common/PaperDialog';
import { CommentsModal } from "./components/CommentsModal";
import { HouseAttachment } from "./components/HouseAttachment";

export const PostCard = ({ post, onPostDeleted, ...props }) => {
  const { colors } = useTheme();
  const [showOptions, setShowOptions] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const { userData } = useUser();

  const [interaction, setInteraction] = useState({
    like_count: post.like_count || 0,
    type: post.interaction?.type || "none", 
  });
  const route = useRoute();

  const hasDeletePermission = (userData?.id === post.author?.id || ["admin", "moderator","collaborator"].includes(userData?.role));

  const navigation = useNavigation();

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', actions: [] });

  const MAX_CONTENT_LENGTH = 1000;
  const shouldTruncate =
    post.content && post.content.length > MAX_CONTENT_LENGTH;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    setInteraction({
      like_count: post.like_count || 0,
      type: post.interaction?.type || "none",
    });
  }, [post]);

  const handleViewHouse = () => {
    if (post.house_link && post.house_link.id) {
      navigation.navigate("HouseDetail", {
        houseId: post.house_link.id,
      });
    }
  };

  const handleInteraction = async (type) => {
    try {
      const newType = interaction.type === type ? "none" : type;
      setInteraction((prev) => ({
        ...prev,
        type: newType,
      }));

      const data = await interactWithPostService(post.id, newType);

      if (data) {
        setInteraction({
          like_count: data.like_count,
          type: data.type,
        });
      }
    } catch (error) {
      console.error("Error updating interaction:", error);
      setInteraction({
        like_count: post.like_count || 0,
        type: post.interaction?.type || "none",
      });
    }
  };

  const handleDelete = async () => {
    setDialogContent({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa bài viết này?',
      actions: [
        { label: 'Hủy', onPress: () => setDialogVisible(false) },
        {
          label: 'Xóa',
          onPress: async () => {
            setDialogVisible(false);
            try {
              setIsDeleting(true);
              await deletePostService(post.id); 

              if (onPostDeleted) {
                onPostDeleted(post.id); 
              }

              if (route.name === "PostDetail") {
                navigation.goBack();
              } else {
                setDialogContent({
                  title: 'Thành công',
                  message: 'Đã xóa bài viết',
                  actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
                });
                setDialogVisible(true);
              }
            } catch (error) {
              console.error("Error deleting post:", error);
              setDialogContent({
                title: 'Lỗi',
                message: 'Không thể xóa bài viết. Vui lòng thử lại.',
                actions: [{ label: 'OK', onPress: () => setDialogVisible(false) }]
              });
              setDialogVisible(true);
            } finally {
              setIsDeleting(false);
            }
          },
          isDestructive: true
        }
      ]
    });
    setDialogVisible(true);
  };

  const handleLike = () => handleInteraction("like");
  const handleDislike = () => handleInteraction("dislike");

  const handleCommentClick = () => {
    setCommentModalVisible(true);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleImageLoadStart = (index) => {
    setImageLoading((prev) => ({ ...prev, [index]: true }));
  };

  const handleImageLoadEnd = (index) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }));
    console.error(`Failed to load image at index ${index}`);
  };

  const toggleContentExpansion = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  if (!post) {
    return null;
  }

  const displayContent =
    shouldTruncate && !isContentExpanded
      ? truncateText(post.content, MAX_CONTENT_LENGTH)
      : post.content;

  return (
    <>
      <View
        style={[
          styles.postContainer,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.postUserInfo}
            onPress={() => {
              navigation.navigate("PublicProfile", {
                username: post.author?.username,
              });
            }}
          >
            <Image
              source={
                {
                  uri: post.author?.avatar || post.author?.avatar_thumbnail,
                } || require("@assets/images/favicon.png")
              }
              onLoadStart={() => handleImageLoadStart("avatar")}
              onLoad={() => handleImageLoadEnd("avatar")}
              onError={() => handleImageError("avatar")}
              resizeMode="cover"
              style={styles.userAvatar}
            />
            {imageLoading["avatar"] && (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color={colors.accentColor} />
              </View>
            )}
            <View>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {post.author?.full_name || post.author?.username || "Anonymous"}
              </Text>
              <Text style={[styles.postTime, { color: colors.textSecondary }]}>
                {formatDate(post.created_at)}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.postOptions}>
            <TouchableOpacity
              onPress={toggleOptions}
              style={styles.optionsButton}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {showOptions && (
              <View
                style={[
                  styles.optionsDropdown,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <TouchableOpacity>
                  <Text style={{ color: colors.textPrimary, padding: 10 }}>
                    Ẩn bài viết
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={{ color: colors.textPrimary, padding: 10 }}>
                    Lưu bài viết
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={{ color: colors.textPrimary, padding: 10 }}>
                    Báo cáo bài viết
                  </Text>
                </TouchableOpacity>
                {hasDeletePermission && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setShowOptions(false);
                        navigation.navigate('CreatePost', { postId: post.id });
                      }}
                    >
                      <Text style={{ color: colors.textPrimary, padding: 10 }}>
                        Sửa bài viết
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete}>
                      <Text style={[styles.deleteButtonText, { color: colors.dangerColor }]}>
                        {isDeleting ? "Đang xóa..." : "Xóa bài viết"}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.postBody}>
          {post.title && (
            <Text style={[styles.postTitle, { color: colors.accentColor }]}>
              {post.title}
            </Text>
          )}

          <Text style={[styles.postContent, { color: colors.textPrimary }]}>
            {displayContent}
          </Text>

          {shouldTruncate && (
            <TouchableOpacity onPress={toggleContentExpansion}>
              <Text style={[styles.seeMoreButton, { color: colors.accentColor }]}>
                {isContentExpanded ? "Thu gọn" : "Xem thêm"}
              </Text>
            </TouchableOpacity>
          )}


          {post.media && post.media.length > 0 && (
            <ImageGallery mediaItems={post.media} />
          )}

          {post.address && !post.house_link && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text
                style={[styles.locationText, { color: colors.textSecondary }]}
              >
                {post.address}
              </Text>
            </View>
          )}

          {post.house_link && (
            <HouseAttachment
              house={post.house_link}
              colors={colors}
              onPress={handleViewHouse}
            />
          )}
        </View>

        <View style={styles.postFooter}>
          <View
            style={[
              styles.interactionBar,
              { borderBottomColor: colors.borderColor },
            ]}
          >
            <TouchableOpacity
              style={styles.interactionButton}
              onPress={handleLike}
            >
              <Ionicons
                name={
                  interaction.type === "like" ? "thumbs-up" : "thumbs-up-outline"
                }
                size={20}
                color={
                  interaction.type === "like"
                    ? colors.accentColor
                    : colors.textSecondary
                }
              />
              <Text
                style={{
                  color:
                    interaction.type === "like"
                      ? colors.accentColor
                      : colors.textSecondary,
                  marginLeft: 5,
                }}
              >
                {interaction.like_count || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.interactionButton}
              onPress={handleDislike}
            >
              <Ionicons
                name={
                  interaction.type === "dislike"
                    ? "thumbs-down"
                    : "thumbs-down-outline"
                }
                size={20}
                color={
                  interaction.type === "dislike"
                    ? colors.accentColor
                    : colors.textSecondary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.interactionButton}
              onPress={handleCommentClick}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={{ color: colors.textSecondary, marginLeft: 5 }}>
                {post.comment_count || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.interactionButton}>
              <Ionicons
                name="share-social-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={{ color: colors.textSecondary, marginLeft: 5 }}>
                Chia sẻ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <CommentsModal
          visible={commentModalVisible}
          onClose={() => setCommentModalVisible(false)}
          postId={post.id}
          colors={colors}
        />
      </View>

      <PaperDialog
        visible={dialogVisible}
        title={dialogContent.title}
        content={dialogContent.message}
        actions={dialogContent.actions}
        onDismiss={() => setDialogVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  postUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  avatarLoadingOverlay: {
    position: "absolute",
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  userName: {
    fontWeight: "bold",
    fontSize: 15,
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
  },
  postOptions: {
    position: "relative",
  },
  optionsButton: {
    padding: 5,
  },
  optionsDropdown: {
    position: "absolute",
    right: 0,
    top: 30,
    width: 120,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  postBody: {
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 10,
  },
  seeMoreButton: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  postMedia: {
    marginBottom: 12,
  },
  mediaContainer: {
    position: "relative",
    marginBottom: 8,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  imageLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  imageErrorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 13,
  },
  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  houseAttachment: {
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  houseAttachmentTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  houseContent: {
    flexDirection: "row",
  },
  houseThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 6,
    marginRight: 12,
  },
  houseDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  houseTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  houseInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  houseInfo: {
    fontSize: 13,
    paddingRight: 4,
  },
  viewHouseButton: {
    marginTop: 6,
    height: 32,
  },
  deleteButton: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "500",
    padding: 10,
  },
});
