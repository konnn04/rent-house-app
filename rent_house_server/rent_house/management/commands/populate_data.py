import random
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q
from django.contrib.auth.hashers import make_password
from django.core.management import call_command
from rent_house.models import (
    User, House, Room, Post, Comment, Interaction, Follow, 
    Notification, ChatGroup, ChatMembership, Message, Rate, Media, 
    Role, HouseType, PostType, InteractionType, NotificationType, RoomRental, ContentType
)

class Command(BaseCommand):
    help = 'Tạo dữ liệu mẫu cho ứng dụng'

    def handle(self, *args, **kwargs):
        self.stdout.write('Đang tạo dữ liệu mẫu...')
        
        try:
            with transaction.atomic():
                # Create users
                self.create_users()
                
                # Create houses
                self.create_houses()
                
                # Create rooms
                self.create_rooms()
                
                # Create posts
                self.create_posts()
                
                # Create comments
                self.create_comments()
                
                # Create interactions
                self.create_interactions()
                
                # Create follows
                self.create_follows()
                
                # Create chat groups and messages
                self.create_chats_and_messages()
                
                # Create rates
                self.create_rates()
                
                # Create notifications
                self.create_notifications()

                # Create Application
                self.create_application()
                
            self.stdout.write(self.style.SUCCESS('Tạo dữ liệu mẫu thành công!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Có lỗi đã xảy ra trong quá trình: {str(e)}'))

    def create_application(self):
        call_command('create_oauth_app')    


    def create_users(self):
        self.stdout.write('[INFO] Đang tạo USER...')
        
        # Create admin user
        admin = User.objects.create(
            username='admin',
            email='admin@example.com',
            password=make_password('1'),
            first_name='Admin',
            last_name='User',
            phone_number='0909123456',
            role=Role.ADMIN.value[0],
            is_staff=True,
            is_superuser=True
        )

        owner_data = [
            {
                'username': 'blu','first_name': 'Duwong', 'last_name': 'Blu'           
            },
            {
                'username': 'lmn','first_name': 'Lý', 'last_name': 'Nhạt'           
            },
            {
                'username': 'nanh','first_name': 'Nhat', 'last_name': 'Kim Anh'           
            },
            {
                'username': 'moggu2','first_name': 'Thợ Săn', 'last_name': 'Lo Lắng',        
            },
            {
                'username': 'regiko','first_name': 'Ghe', 'last_name': 'Gi Cô'           
            },
            {
                'username': 'sleo','first_name': 'Sờ', 'last_name': 'Leo'           
            },
            {
                'username': 'taku','first_name': 'Hài', 'last_name': 'Miền Tây'           
            },
            {
                'username': 'tan','first_name': 'Quốc', 'last_name': 'Kazama'           
            }
        ]        
        # Create house owners 1->8
        owners = []
        for i, e in enumerate(owner_data):
            owner = User.objects.create(
                username=e['username'],
                email=f'{e['username']}@riikon.net',
                password=make_password(f'1'),
                first_name=e['first_name'],
                last_name=e['last_name'],
                phone_number=f'09023456{i}',
                role=Role.OWNER.value[0],
                address=f'Số {i+1}00, Đường {e['first_name']}, Quận 1, TP.HCM',
                avatar=f'https://konya007.github.io/image-library/avatar/{e['username']}.jpg'
            )
            # Create avatar Media
            if owner.avatar:
                Media.objects.create(
                    content_type=ContentType.objects.get_for_model(User),
                    object_id=owner.id,
                    url=owner.avatar,
                    media_type='image',
                    purpose='avatar'
                )
            owners.append(owner)
        
        # Create renters
        renter_data = [
            {
                'username': 'sleo2','first_name': 'Phan', 'last_name': 'Nhạt',
            },
            {
                'username': 'taku2','first_name': 'Công', 'last_name': 'Tâm Vô Lượng',
            },
            {
                'username': 'tri','first_name': 'Minh', 'last_name': 'Trí',
            },
            {
                'username': 'trieu','first_name': 'Thanh', 'last_name': 'Tều',
            },
            {
                'username': 'truc','first_name': 'Minh', 'last_name': 'Trực',
            },
            {
                'username': 'vulee','first_name': 'Vũ', 'last_name': 'Trường',
            },
            {
                'username': 'moggu','first_name': 'Mo', 'last_name': 'Gu',
            },
            {
                'username': 'quan','first_name': 'Hải', 'last_name': 'Quấn'  
            },
            {
                'username': 'nanh2','first_name': 'Haha', 'last_name': 'Aha',
            },
            {
                'username': 'trong','first_name': 'Thành', 'last_name': 'Cộc',
            }
        ]
        # Create house renters 1->10 is in renter_data, from 11->30 is random
        renters = []
        for i, e in enumerate(renter_data):
            renter = User.objects.create(
                username=e['username'] if i < len(renter_data) else f'renter{i}',
                email=f'{e['username']}@riikon.net' if i < len(renter_data) else f'example{i}@mail.com',
                password=make_password(f'1'),
                first_name=e['first_name'] if i < len(renter_data) else f'Renter',
                last_name= e['last_name'] if i < len(renter_data) else f'Anoymous{i}',
                phone_number=f'09034567{i}',
                role=Role.RENTER.value[0],
                address=f'Số {i+1}00, Đường {e['first_name']}, Quận 1, TP.HCM' if i < len(renter_data) else f'Số {i+1}00, Đường Anoymous{i}, Quận 1, TP.HCM',
                avatar=f'https://konya007.github.io/image-library/avatar/{e['username']}.jpg' if i < len(renter_data) else f'https://api.dicebear.com/7.x/micah/png?seed={i+1}'
            )
            # Create avatar Media
            if renter.avatar:
                Media.objects.create(
                    content_type=ContentType.objects.get_for_model(User),
                    object_id=renter.id,
                    url=renter.avatar,
                    media_type='image',
                    purpose='avatar'
                )
            renters.append(renter)
        
        # Create moderator user
        moderator = User.objects.create(
            username='moderator',
            email='moderator@example.com',
            password=make_password('Moderator@123'),
            first_name='Moderator',
            last_name='User',
            phone_number='0904567890',
            role=Role.MODERATOR.value[0],
            address='456 Moderator Street, City',
            avatar='https://api.dicebear.com/7.x/micah/png?seed=100',
            is_staff=True
        )
        
        # Create moderator avatar Media
        if moderator.avatar:
            Media.objects.create(
                content_type=ContentType.objects.get_for_model(User),
                object_id=moderator.id,
                url=moderator.avatar,
                media_type='image',
                purpose='avatar'
            )
        
        self.users = [admin, moderator] + owners + renters

    def create_houses(self):
        self.stdout.write('[INFO] Đang tạo HOUSE...')
        
        owners = User.objects.filter(role=Role.OWNER.value[0])
        house_types = [house_type.value[0] for house_type in HouseType]
        
        self.houses = []
        locations = [
            # Ho Chi Minh City locations with approximate lat/long
            {'address': '123 Nguyễn Huệ, Quận 1, TP.HCM', 'lat': 10.7731, 'long': 106.7030},
            {'address': '456 Lê Lợi, Quận 1, TP.HCM', 'lat': 10.7721, 'long': 106.7040},
            {'address': '789 Trần Hưng Đạo, Quận 5, TP.HCM', 'lat': 10.7520, 'long': 106.6830},
            {'address': '101 Võ Văn Tần, Quận 3, TP.HCM', 'lat': 10.7804, 'long': 106.6922},
            {'address': '202 Hai Bà Trưng, Quận 1, TP.HCM', 'lat': 10.7872, 'long': 106.7018},
            {'address': '303 Điện Biên Phủ, Bình Thạnh, TP.HCM', 'lat': 10.8012, 'long': 106.7147},
            {'address': '404 Phan Xích Long, Phú Nhuận, TP.HCM', 'lat': 10.7956, 'long': 106.6845},
            {'address': '505 Quang Trung, Gò Vấp, TP.HCM', 'lat': 10.8348, 'long': 106.6675},
            {'address': '606 Lê Văn Việt, Quận 9, TP.HCM', 'lat': 10.8457, 'long': 106.7837},
            {'address': '707 Lạc Long Quân, Tân Bình, TP.HCM', 'lat': 10.7850, 'long': 106.6503},
        ]
        
        for i, owner in enumerate(owners):
            # Create 1 house for each owner
            location = random.choice(locations)
            house_type = random.choice(house_types)
            
            house = House.objects.create(
                title=f"{owner.first_name}'s {HouseType[house_type.upper()].value[1]}",
                description=f"Đây là một {house_type} đẹp và tiện nghi, nằm ở vị trí thuận lợi.",
                address=location['address'],
                latitude=location['lat'] + random.uniform(-0.005, 0.005),
                longitude=location['long'] + random.uniform(-0.005, 0.005),
                owner=owner,
                type=house_type,
                base_price=random.randint(300, 1500) * 100000,
                is_verified=random.choice([True, False])
            )
            
            # Create Media for house
            num_images = 5
            for k in range(num_images):
                Media.objects.create(
                    content_type=ContentType.objects.get_for_model(House),
                    object_id=house.id,
                    url=f'https://konya007.github.io/image-library/houses/h{i+1}r{k+1}.jpg',
                    media_type='image',
                    purpose='gallery'
                )
            
            self.houses.append(house)

    def create_rooms(self):
        self.stdout.write('[INFO] Đang tạo ROOM...')
        
        self.rooms = []
        for i, house in enumerate(self.houses):
            num_rooms = random.randint(2, 5)
            for j in range(num_rooms):
                max_people = random.randint(1, 4)
                cur_people = random.randint(0, max_people)
                
                room = Room.objects.create(
                    house=house,
                    title=f"Phòng số {j+1} thuộc [{house.title}]",
                    description=f"Một phòng ngủ tiện nghi, sạch sẽ và thoáng mát.",
                    price=random.randint(150, 500) * 100000,
                    max_people=max_people,
                    cur_people=cur_people,
                    bedrooms=random.randint(1, 2),
                    bathrooms=random.randint(1, 2),
                    area=random.uniform(15.0, 40.0)
                )
                
                # Create Media for room
                num_images = 5
                for k in range(num_images):
                    Media.objects.create(
                        content_type=ContentType.objects.get_for_model(Room),
                        object_id=room.id,
                        url=f'https://konya007.github.io/image-library/houses/h{i+1}r{k+1}.jpg',
                        media_type='image',
                        purpose='gallery'
                    )
                
                self.rooms.append(room)
                
                # Create RoomRental entries for some rooms
                if cur_people > 0:
                    available_renters = User.objects.filter(role=Role.RENTER.value[0])[:cur_people]
                    for renter in available_renters:
                        # Create a rental agreement
                        from datetime import date, timedelta
                        start_date = date.today() - timedelta(days=random.randint(30, 180))
                        
                        RoomRental.objects.create(
                            user=renter,
                            room=room,
                            start_date=start_date,
                            end_date=start_date + timedelta(days=random.randint(180, 365)) if random.random() < 0.7 else None,
                            is_active=True,
                            price_agreed=room.price * (1 - random.uniform(0, 0.1))  # Slight discount
                        )

    def create_posts(self):
        self.stdout.write('[INFO] Đang tạo POST...')
        
        post_types = [post_type.value[0] for post_type in PostType]
        users = User.objects.all()
        
        self.posts = []
        for i in range(30):
            user = random.choice(users)
            post_type = random.choice(post_types)
            
            title = ""
            content = ""
            address = None
            latitude = None
            longitude = None
            house_link = None
            
            if post_type == PostType.RENTAL_LISTING.value[0]:
                if user.role == Role.OWNER.value[0]:
                    houses = House.objects.filter(owner=user)
                    if houses.exists():
                        house = random.choice(houses)
                        house_link = house
                        title = f"Phòng cho thuê"
                        content = f"Phòng cho thuê tại {house.address}. Giá chỉ {house.base_price} VND/tháng. Liên hệ ngay để biết thêm chi tiết!"
                        address = house.address
                        latitude = house.latitude
                        longitude = house.longitude
                    else:
                        continue
                else:
                    title = "Phòng cho thuê"
                    content = "Tôi còn dư một phòng trong căn hộ của mình. Ai có nhu cầu thuê phòng thì liên hệ với tôi nhé!"
                    address = "123 Đường ABC, Quận 1, TP.HCM"
                    
            elif post_type == PostType.SEARCH_LISTING.value[0]:
                title = "Tìm phòng trọ"
                content = "Chào mọi người! Tôi là một sinh viên đang tìm phòng trọ ở khu vực trung tâm thành phố. Mức giá khoảng 3-5 triệu/tháng. Ai có phòng trống thì liên hệ với tôi nhé!"
                
            elif post_type == PostType.ROOMMATE.value[0]:
                title = "Tìm bạn cùng phòng"
                content = f"Chào các bạn! Tôi là {user.first_name}, hiện đang tìm một bạn cùng phòng để chia sẻ chi phí thuê nhà. Ai có nhu cầu thì liên hệ với tôi nhé!"
                
            post = Post.objects.create(
                author=user,
                type=post_type,
                title=title,
                content=content,
                address=address,
                latitude=latitude,
                longitude=longitude,
                house_link=house_link,
            )
            
            # Create Media for post
            num_images = random.randint(0, 3)
            for j in range(num_images):
                seed = random.randint(1, 1000)
                Media.objects.create(
                    content_type=ContentType.objects.get_for_model(Post),
                    object_id=post.id,
                    url=f'https://picsum.photos/seed/{seed}/800/600',
                    media_type='image',
                    purpose='attachment'
                )
            
            self.posts.append(post)

    def create_comments(self):
        self.stdout.write('[INFO] Đang tạo COMMENT...')
        
        users = User.objects.all()
        
        for post in self.posts:
            num_comments = random.randint(0, 5)
            parent_comments = []
            
            for i in range(num_comments):
                user = random.choice(users)
                
                comment_content = random.choice([
                    "Phòng này trông rất tốt! Tôi quan tâm.",
                    "Vị trí chính xác ở đâu?",
                    "Phòng này còn trống không?",
                    "Giá có bao gồm tiền điện nước không?",
                    "Hiện tại có bao nhiêu người đang sống ở đó?",
                    "Có gần phương tiện giao thông công cộng không?",
                    "Bạn có cho phép nuôi thú cưng không?",
                    "Tôi sẽ gửi tin nhắn riêng để biết thêm chi tiết.",
                    "Khi nào tôi có thể đến xem phòng?",
                    "Có thể cho tôi biết thêm về các tiện ích không?",
                    "Có yêu cầu đặt cọc không?",
                    "Có thể thương lượng giá không?",
                    "Có thể cho tôi biết thêm về khu vực này không?",
                    "Có thể cho tôi biết thêm về chủ nhà không?",
                    "Có thể cho tôi biết thêm về các quy định không?",
                ])
                
                comment = Comment.objects.create(
                    post=post,
                    author=user,
                    content=comment_content,
                    parent=None
                )
                
                parent_comments.append(comment)
                
                # Add Media to some comments
                if random.random() < 0.2:  # 20% chance
                    Media.objects.create(
                        content_type=ContentType.objects.get_for_model(Comment),
                        object_id=comment.id,
                        url=f'https://picsum.photos/seed/{comment.id+100}/800/600',
                        media_type='image',
                        purpose='attachment'
                    )
            
            # Create some replies
            for parent_comment in parent_comments:
                if random.random() < 0.3:  # 30% chance of having a reply
                    user = random.choice(users)
                    if user != parent_comment.author:  # Don't reply to yourself
                        reply_content = random.choice([
                            "Cảm ơn bạn đã quan tâm!",
                            "Vâng, phòng vẫn còn trống.",
                            "Giá đã bao gồm tiền nước và điện.",
                            "Cách trạm xe buýt khoảng 5 phút đi bộ.",
                            "Xin lỗi, không cho phép nuôi thú cưng.",
                            "Bạn có thể đến xem phòng vào cuối tuần này nếu muốn.",
                            "Vâng, cần đặt cọc 1 tháng tiền nhà.",
                            "Tôi sẽ gửi thêm chi tiết qua tin nhắn riêng.",
                            "Khu vực này rất an ninh và yên tĩnh.",
                            "Phòng rất thoáng và có ánh sáng tự nhiên tốt.",
                            "Có nhiều tiện ích xung quanh như siêu thị, quán ăn.",
                            "Chủ nhà rất thân thiện và dễ tính.",
                            "Mình có thể thương lượng giá nếu bạn ở dài hạn.",
                            "Phòng đã được trang bị nội thất cơ bản.",
                            "Có chỗ để xe miễn phí.",
                            "WiFi tốc độ cao miễn phí."
                        ])
                        
                        Comment.objects.create(
                            post=post,
                            author=user,
                            content=reply_content,
                            parent=parent_comment
                        )

    def create_interactions(self):
        self.stdout.write('[INFO] Đang tạo INTERACTION...')
        
        users = User.objects.all()
        interaction_types = [interaction_type.value[0] for interaction_type in InteractionType]
        
        for post in self.posts:
            num_interactions = random.randint(0, 25)
            for _ in range(num_interactions):
                user = random.choice(users)
                interaction_type = random.choice(interaction_types)
                
                # Check if interaction already exists
                if not Interaction.objects.filter(user=user, post=post).exists():
                    Interaction.objects.get_or_create(
                        user=user,
                        post=post,
                        type=interaction_type
                    )

    def create_follows(self):
        self.stdout.write('[INFO] Đang tạo FOLLOW...')
        
        users = list(User.objects.all())
        
        for user in users:
            # Each user follows 1-5 other users
            num_follows = random.randint(1, 5)
            potential_followees = [u for u in users if u != user]
            followees = random.sample(potential_followees, min(num_follows, len(potential_followees)))
            
            for followee in followees:
                if not Follow.objects.filter(follower=user, followee=followee).exists():
                    Follow.objects.create(
                        follower=user,
                        followee=followee,
                        is_following=True
                    )

    def create_chats_and_messages(self):
        self.stdout.write('[INFO] Đang tạo CHAT và MESSAGE...')
        
        users = list(User.objects.all())
        
        # Create some chat groups between users
        for i in range(20):
            # Create direct chats (1-1)
            user_pair = random.sample(users, 2)
            user1, user2 = user_pair
            
            # Check if chat group already exists
            existing_chat = ChatGroup.objects.filter(
                is_group=False,
                members=user1
            ).filter(
                members=user2
            ).first()
            
            if not existing_chat:
                # Create new chat group
                chat_group = ChatGroup.objects.create(
                    name=None,  # Direct chats don't need a name
                    description=None,
                    is_group=False,
                    created_by=user1
                )
                
                # Add members
                ChatMembership.objects.create(
                    chat_group=chat_group,
                    user=user1,
                    is_admin=True
                )
                
                ChatMembership.objects.create(
                    chat_group=chat_group,
                    user=user2,
                    is_admin=False
                )
                
                # Create messages in the chat
                num_messages = random.randint(3, 10)
                for j in range(num_messages):
                    sender = random.choice(user_pair)
                    
                    message_content = random.choice([
                        "Xin chào, bạn khoẻ không?",
                        "Tôi quan tâm đến phòng cho thuê của bạn.",
                        "Phòng còn trống không?",
                        "Khi nào tôi có thể đến xem phòng?",
                        "Địa chỉ chính xác ở đâu vậy?",
                        "Bạn có cho phép nuôi thú cưng không?",
                        "Giá có thể thương lượng không?",
                        "Đã bao gồm tiền điện nước chưa?",
                        "Có cần đặt cọc không?",
                        "Khoảng cách đến phương tiện công cộng bao xa?",
                        "Xin chào, tôi thấy bài đăng của bạn rất thú vị.",
                        "Phòng có máy lạnh không?",
                        "Khu vực này có an toàn không?",
                        "Có chỗ để xe máy không?",
                        "Chi phí thuê hàng tháng bao nhiêu?",
                        "Phòng có sẵn nội thất không?",
                        "Tôi có thể dọn vào ở ngay không?",
                        "Internet có tính phí không?",
                        "Tôi cần ở dài hạn, có ưu đãi gì không?",
                        "Khu vực xung quanh có tiện ích gì không?",
                        "Láng giềng có ồn ào không?",
                        "Bạn cho thuê tối thiểu bao lâu?",
                        "Có quy định gì đặc biệt không?",
                        "Tôi có thể thỏa thuận thanh toán theo quý không?",
                        "Cảm ơn bạn đã phản hồi nhanh chóng!"
                    ])
                    
                    message = Message.objects.create(
                        chat_group=chat_group,
                        sender=sender,
                        content=message_content
                    )
                    
                    # Add Media to some messages
                    if random.random() < 0.2:  # 20% chance
                        Media.objects.create(
                            content_type=ContentType.objects.get_for_model(Message),
                            object_id=message.id,
                            url=f'https://picsum.photos/seed/{message.id+200}/800/600',
                            media_type='image',
                            purpose='attachment'
                        )
        
        # Create a few group chats
        for i in range(5):
            # Select 3-6 random users for each group chat
            chat_members = random.sample(users, random.randint(3, 6))
            creator = chat_members[0]
            
            group_chat = ChatGroup.objects.create(
                name=f"Nhóm chat {i+1}",
                description=f"Một nhóm chat thú vị về nhà ở.",
                is_group=True,
                created_by=creator
            )
            
            # Add members
            for idx, user in enumerate(chat_members):
                ChatMembership.objects.create(
                    chat_group=group_chat,
                    user=user,
                    is_admin=(idx == 0)  # First user is admin
                )
            
            # Create group messages
            num_messages = random.randint(5, 15)
            for j in range(num_messages):
                sender = random.choice(chat_members)
                
                message_content = random.choice([
                    "Chào cả nhóm!",
                    "Có ai tìm được chỗ ở tốt chưa?",
                    "Tôi đang tìm bạn cùng phòng ở Quận 1.",
                    "Ai biết môi giới nhà tốt không?",
                    "Giá nhà ở khu vực này cứ tăng mãi!",
                    "Tôi vừa tìm được một chỗ rất tốt, nhưng đã có người thuê mất rồi.",
                    "Cuối tuần này gặp nhau bàn về lựa chọn nhà ở nhé.",
                    "Có ai từng ở khu vực này chưa?",
                    "Có ai biết chỗ nào giá cả phải chăng không?",
                    "Giá hợp lý cho căn hộ 2 phòng ngủ ở khu vực này là bao nhiêu?",
                    "Có ai biết khu vực nào an ninh tốt không?",
                    "Tôi mới chuyển đến TP.HCM, cần tìm phòng gấp!",
                    "Có ai đang ở trọ gần đại học không?",
                    "Nhà trọ nào có wifi tốt nhỉ?",
                    "Làm sao để tránh bị chủ nhà tăng giá đột ngột?",
                    "Có ai biết khu nào không bị ngập khi mưa không?",
                    "Chỗ nào có bãi giữ xe máy an toàn nhỉ?",
                    "Ở đây có tiệm tạp hóa gần không?",
                    "Tôi cần tìm nhà gần tuyến xe buýt.",
                    "Có ai biết chỗ nào cho thuê ngắn hạn không?"
                ])
                
                Message.objects.create(
                    chat_group=group_chat,
                    sender=sender,
                    content=message_content
                )

    def create_rates(self):
        self.stdout.write('[INFO] Đang tạo RATE...')
        
        users = list(User.objects.filter(role=Role.RENTER.value[0]))
        houses = list(House.objects.all())
        
        if not users or not houses:
            self.stdout.write(self.style.WARNING("No users or houses to create ratings"))
            return
        
        for house in houses:
            num_ratings = random.randint(0, min(5, len(users)))
            if num_ratings == 0:
                continue
                
            raters = random.sample(users, num_ratings)
            
            for user in raters:
                # Check if rating already exists
                if not Rate.objects.filter(user=user, house=house).exists():
                    stars = random.randint(1, 5)
                    comments = [
                        f"Nhà ở đáng yêu và tiện nghi. {stars}/5.",
                        f"Vị trí thuận tiện, gần chợ và trường học. {stars}/5.",
                        f"Giá cả hợp lý với chất lượng phòng. {stars}/5.",
                        f"Chủ nhà rất thân thiện và nhiệt tình hỗ trợ. {stars}/5.",
                        f"Phòng sạch sẽ và thoải mái. {stars}/5.",
                        f"Khu vực an ninh tốt, yên tĩnh về đêm. {stars}/5.",
                        f"Tiện ích xung quanh đầy đủ, thuận tiện sinh hoạt. {stars}/5.",
                        f"Phòng tắm mới và sạch sẽ. {stars}/5.",
                        f"Không gian thoáng mát, có nhiều cửa sổ. {stars}/5.",
                        f"Nội thất đầy đủ và chất lượng tốt. {stars}/5.",
                        f"Hàng xóm thân thiện và yên tĩnh. {stars}/5.",
                        f"Chủ nhà giải quyết vấn đề nhanh chóng. {stars}/5.",
                        None  # Some ratings might not have comments
                    ]
                    
                    comment = random.choice(comments)
                    
                    rate = Rate.objects.create(
                        user=user,
                        house=house,
                        star=stars,
                        comment=comment
                    )
                    
                    # Add Media to some ratings (photos of the house)
                    if comment and random.random() < 0.3:  # 30% chance
                        Media.objects.create(
                            content_type=ContentType.objects.get_for_model(Rate),
                            object_id=rate.id,
                            url=f'https://picsum.photos/seed/{rate.id+300}/800/600',
                            media_type='image',
                            purpose='attachment'
                        )

    def create_notifications(self):
        self.stdout.write('[INFO] Đang tạo NOTIFICATION...')
        
        users = User.objects.all()
        notification_types = [notification_type.value[0] for notification_type in NotificationType]
        
        # Create a few random notifications for each user
        for user in users:
            num_notifications = random.randint(3, 30)
            
            for i in range(num_notifications):
                notification_type = random.choice(notification_types)
                other_users = [u for u in users if u != user]
                if not other_users:
                    continue  # Skip if there are no other users
                    
                sender = random.choice(other_users)
                
                try:
                    # Set appropriate content based on notification type
                    if notification_type == NotificationType.NEW_POST.value[0]:
                        sender_posts = list(Post.objects.filter(author=sender))
                        if not sender_posts:
                            continue  # Skip if sender has no posts
                            
                        post = random.choice(sender_posts)
                        content = f"{sender.first_name} đã đăng một bài viết mới: {post.title}"
                        url = f"/posts/{post.id}/"
                        related_object_type = ContentType.objects.get_for_model(Post)
                        related_object_id = post.id
                    
                    elif notification_type == NotificationType.COMMENT.value[0]:
                        # Find a post by the user
                        user_posts = list(Post.objects.filter(author=user))
                        if not user_posts:
                            continue  # Skip if user has no posts
                            
                        post = random.choice(user_posts)
                        content = f"{sender.first_name} đã bình luận về bài viết của bạn: {post.title}"
                        url = f"/posts/{post.id}/"
                        related_object_type = ContentType.objects.get_for_model(Comment)
                        related_object_id = None
                    
                    elif notification_type == NotificationType.FOLLOW.value[0]:
                        content = f"{sender.first_name} đã theo dõi bạn."
                        url = f"/users/{sender.id}/"
                        related_object_type = ContentType.objects.get_for_model(User)
                        related_object_id = sender.id
                    
                    elif notification_type == NotificationType.INTERACTION.value[0]:
                        # Find a post by the user
                        user_posts = list(Post.objects.filter(author=user))
                        if not user_posts:
                            continue  # Skip if user has no posts
                            
                        post = random.choice(user_posts)
                        interaction_types = [t.value[1] for t in InteractionType]
                        if not interaction_types:
                            continue  # Skip if no interaction types
                            
                        interaction_type = random.choice(interaction_types)
                        content = f"{sender.first_name} {interaction_type.lower()} bài viết của bạn: {post.title}"
                        url = f"/posts/{post.id}/"
                        related_object_type = ContentType.objects.get_for_model(Post)
                        related_object_id = post.id
                    
                    elif notification_type == NotificationType.MESSAGE.value[0]:
                        content = f"Bạn có tin nhắn mới từ {sender.first_name}."
                        url = "/messages/"
                        related_object_type = ContentType.objects.get_for_model(User)
                        related_object_id = sender.id
                    else:
                        continue  # Skip unknown notification types
                    
                    # Create the notification
                    Notification.objects.create(
                        user=user,
                        content=content,
                        url=url,
                        type=notification_type,
                        is_read=random.choice([True, False]),
                        sender=sender,
                        related_object_type=related_object_type,
                        related_object_id=related_object_id
                    )
                except Exception as e:
                    # Log error but continue with other notifications
                    self.stdout.write(self.style.WARNING(f"Error creating notification: {str(e)}"))
                    continue