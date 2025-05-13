import { useState } from 'react';
import { FaComment, FaEllipsisH, FaShare, FaThumbsDown, FaThumbsUp } from 'react-icons/fa';
import { Comment } from './Comment';
import './Post.css';

export const Post = ({ post }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  
  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };
  
  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };
  
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <div className="post-container">
      {/* Header */}
      <div className="post-header">
        <div className="post-user-info">
          <img 
            src={post.author.avatar || 'https://via.placeholder.com/40'} 
            alt={post.author.name} 
            className="user-avatar" 
          />
          <div>
            <h4 className="user-name">{post.author.name}</h4>
            <p className="post-time">{post.createdAt}</p>
          </div>
        </div>
        <div className="post-options">
          <button className="options-button" onClick={toggleOptions}>
            <FaEllipsisH />
          </button>
          {showOptions && (
            <div className="options-dropdown">
              <ul>
                <li>Ẩn bài viết</li>
                <li>Lưu bài viết</li>
                <li>Báo cáo</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="post-body">
        <p className="post-content">{post.content}</p>
        
        {/* Images or Videos */}
        {post.media && post.media.length > 0 && (
          <div className="post-media">
            {post.media.map((item, index) => (
              item.type === 'image' ? (
                <img key={index} src={item.url} alt="Post media" className="post-image" />
              ) : (
                <video key={index} controls className="post-video">
                  <source src={item.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )
            ))}
          </div>
        )}
        
        {/* Room Attachment */}
        {post.roomInfo && (
          <div className="room-attachment">
            <h3>{post.roomInfo.title}</h3>
            <div className="room-details">
              <p><strong>Địa chỉ:</strong> {post.roomInfo.address}</p>
              <p><strong>Giá:</strong> {post.roomInfo.price.toLocaleString('vi-VN')} đồng/tháng</p>
              <p><strong>Diện tích:</strong> {post.roomInfo.area} m²</p>
              {post.roomInfo.features && (
                <div className="room-features">
                  <strong>Tiện ích:</strong>
                  <ul>
                    {post.roomInfo.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="post-footer">
        <div className="interaction-bar">
          <button 
            className={`interaction-button ${liked ? 'active' : ''}`} 
            onClick={handleLike}
          >
            <FaThumbsUp /> <span>{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <button 
            className={`interaction-button ${disliked ? 'active' : ''}`} 
            onClick={handleDislike}
          >
            <FaThumbsDown /> <span>{post.dislikes + (disliked ? 1 : 0)}</span>
          </button>
          <button className="interaction-button">
            <FaComment /> <span>{post.comments.length}</span>
          </button>
          <button className="interaction-button">
            <FaShare /> <span>Chia sẻ</span>
          </button>
        </div>
        
        {/* Featured Comments */}
        <div className="featured-comments">
          <h4>Bình luận nổi bật</h4>
          {post.comments.slice(0, 3).map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
          {post.comments.length > 3 && (
            <button className="view-more-comments">
              Xem thêm {post.comments.length - 3} bình luận
            </button>
          )}
        </div>
      </div>
    </div>
  );
}