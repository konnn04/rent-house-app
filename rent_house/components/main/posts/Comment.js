import './Comment.css';

export const Comment = ({ comment }) => {
  return (
    <div className="comment">
      <img 
        src={comment.author.avatar || 'https://via.placeholder.com/30'} 
        alt={comment.author.name} 
        className="comment-avatar" 
      />
      <div className="comment-content">
        <div className="comment-header">
          <h5 className="comment-author">{comment.author.name}</h5>
          <span className="comment-time">{comment.createdAt}</span>
        </div>
        <p className="comment-text">{comment.text}</p>
      </div>
    </div>
  );
}