// Sample data for posts
export const generateMockPosts = (count = 20) => {
    const posts = [];
    
    const locations = [
      'Cầu Giấy, Hà Nội',
      'Đống Đa, Hà Nội',
      'Hai Bà Trưng, Hà Nội',
      'Hoàn Kiếm, Hà Nội',
      'Thanh Xuân, Hà Nội',
      'Ba Đình, Hà Nội',
      'Tây Hồ, Hà Nội',
      'Long Biên, Hà Nội',
      'Hà Đông, Hà Nội',
      'Hoàng Mai, Hà Nội',
    ];
    
    const avatars = [
      'https://randomuser.me/api/portraits/men/1.jpg',
      'https://randomuser.me/api/portraits/women/2.jpg',
      'https://randomuser.me/api/portraits/men/3.jpg',
      'https://randomuser.me/api/portraits/women/4.jpg',
      'https://randomuser.me/api/portraits/men/5.jpg',
      'https://randomuser.me/api/portraits/women/6.jpg',
      'https://randomuser.me/api/portraits/men/7.jpg',
      'https://randomuser.me/api/portraits/women/8.jpg',
    ];
    
    const roomImages = [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    ];
    
    const features = [
      'Điều hòa',
      'Nóng lạnh',
      'Tủ lạnh',
      'Máy giặt',
      'Wifi miễn phí',
      'Bảo vệ 24/7',
      'Khu vực nấu ăn',
      'Chỗ để xe',
      'Ban công',
      'Nhà vệ sinh riêng',
      'Giường đôi',
      'Tủ quần áo'
    ];
    
    const timeframes = [
      '1 giờ trước',
      '2 giờ trước',
      '3 giờ trước',
      '5 giờ trước',
      '12 giờ trước',
      'Hôm qua',
      '2 ngày trước',
      '3 ngày trước',
      '1 tuần trước',
    ];
    
    const userNames = [
      'Nguyễn Văn A',
      'Trần Thị B',
      'Lê Văn C',
      'Phạm Thị D',
      'Hoàng Văn E',
      'Ngô Thị F',
      'Đỗ Văn G',
      'Vũ Thị H',
    ];
  
    const randomComments = [
      'Phòng đẹp quá! Tôi đang cần tìm phòng, có thể cho tôi thêm thông tin được không?',
      'Giá phòng này có bao gồm điện nước không bạn?',
      'Khu vực này có an ninh tốt không vậy?',
      'Đã gửi tin nhắn cho bạn, mong phản hồi sớm nhé!',
      'Phòng còn trống không? Cho mình xin địa chỉ cụ thể',
      'Có cần đặt cọc không vậy?',
      'Tôi có thể đến xem phòng vào ngày mai được không?',
      'Giá có thể thương lượng không?',
      'Phòng có chỗ để xe máy không?',
      'Phòng trọ này gần trường đại học nào vậy?',
      'Có giảm giá nếu ở dài hạn không?',
      'Xung quanh có siêu thị không?',
    ];
  
    // Function to get random items from an array
    const getRandomItems = (array, min = 1, max = 3) => {
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
  
    for (let i = 0; i < count; i++) {
      // Determine if post has room info (75% chance)
      const hasRoomInfo = Math.random() < 0.75;
      
      // Create random number of comments (0-5)
      const commentCount = Math.floor(Math.random() * 6);
      const comments = [];
      
      for (let j = 0; j < commentCount; j++) {
        comments.push({
          id: `comment-${i}-${j}`,
          author: {
            id: `user-${Math.floor(Math.random() * 100)}`,
            name: userNames[Math.floor(Math.random() * userNames.length)],
            avatar: avatars[Math.floor(Math.random() * avatars.length)],
          },
          createdAt: timeframes[Math.floor(Math.random() * timeframes.length)],
          text: randomComments[Math.floor(Math.random() * randomComments.length)],
        });
      }
  
      // Create post object
      const post = {
        id: `post-${i}`,
        author: {
          id: `user-${Math.floor(Math.random() * 100)}`,
          name: userNames[Math.floor(Math.random() * userNames.length)],
          avatar: avatars[Math.floor(Math.random() * avatars.length)],
        },
        createdAt: timeframes[Math.floor(Math.random() * timeframes.length)],
        content: hasRoomInfo
          ? `Cho thuê phòng trọ mới tại ${locations[Math.floor(Math.random() * locations.length)]}. Phòng rộng, thoáng mát, có đầy đủ tiện nghi. Liên hệ ngay để được tư vấn!`
          : `Có ai biết khu vực ${locations[Math.floor(Math.random() * locations.length)]} có phòng trọ nào tốt không? Mình đang cần tìm gấp một phòng có giá dưới 5 triệu.`,
        media: Math.random() > 0.3 ? getRandomItems(roomImages, 1, 3).map(url => ({ type: 'image', url })) : [],
        roomInfo: hasRoomInfo ? {
          title: `Phòng trọ cao cấp gần ${Math.random() > 0.5 ? 'đại học' : 'trung tâm'}`,
          address: `${Math.floor(Math.random() * 200) + 1} ${locations[Math.floor(Math.random() * locations.length)]}`,
          price: Math.floor(Math.random() * 5 + 2) * 1000000, // 2-7 million
          area: Math.floor(Math.random() * 20 + 15), // 15-35 m²
          features: getRandomItems(features, 3, 6),
        } : null,
        likes: Math.floor(Math.random() * 50),
        dislikes: Math.floor(Math.random() * 10),
        comments: comments,
      };
      
      posts.push(post);
    }
    
    return posts;
  };