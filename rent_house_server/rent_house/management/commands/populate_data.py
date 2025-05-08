import random
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from rent_house.models import (
    User, House, Room, Post, Comment, Interaction, Follow, 
    Notification, ChatGroup, ChatMembership, Message, Rate, Media, 
    Role, HouseType, PostType, InteractionType, NotificationType, RoomRental, ContentType
)

class Command(BaseCommand):
    help = 'Populate the database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating database...')
        
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
                
            self.stdout.write(self.style.SUCCESS('Successfully populated database!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error populating database: {str(e)}'))

    def create_users(self):
        self.stdout.write('Creating users...')
        
        # Create admin user
        # admin = User.objects.create(
        #     username='admin',
        #     email='admin@example.com',
        #     password=make_password('Admin@123'),
        #     first_name='Admin',
        #     last_name='User',
        #     phone_number='0909123456',
        #     role=Role.ADMIN.value[0],
        #     is_staff=True,
        #     is_superuser=True
        # )
        
        # Create house owners
        owners = []
        for i in range(1, 6):
            owner = User.objects.create(
                username=f'owner{i}',
                email=f'owner{i}@example.com',
                password=make_password(f'Owner@123'),
                first_name=f'Owner',
                last_name=f'{i}',
                phone_number=f'09023456{i}',
                role=Role.OWNER.value[0],
                address=f'{i}00 Owner Street, City',
                avatar=f'https://placehold.co/400x400?text=Owner{i}'
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
        renters = []
        for i in range(1, 11):
            renter = User.objects.create(
                username=f'renter{i}',
                email=f'renter{i}@example.com',
                password=make_password(f'Renter@123'),
                first_name=f'Renter',
                last_name=f'{i}',
                phone_number=f'09034567{i}',
                role=Role.RENTER.value[0],
                address=f'{i}00 Renter Street, City',
                avatar=f'https://placehold.co/400x400?text=Renter{i}'
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
            avatar='https://placehold.co/400x400?text=Moderator',
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
        
        self.users = [ moderator] + owners + renters

    def create_houses(self):
        self.stdout.write('Creating houses...')
        
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
            num_houses = random.randint(1, 3)
            for j in range(num_houses):
                location = random.choice(locations)
                house_type = random.choice(house_types)
                
                house = House.objects.create(
                    title=f"{owner.first_name}'s {HouseType[house_type.upper()].value[1]} #{j+1}",
                    description=f"A beautiful {house_type} located in a convenient area with easy access to public transportation, shops, and restaurants.",
                    address=location['address'],
                    latitude=location['lat'] + random.uniform(-0.005, 0.005),
                    longitude=location['long'] + random.uniform(-0.005, 0.005),
                    owner=owner,
                    type=house_type,
                    base_price=random.randint(300, 1500) * 100000,
                    is_verified=random.choice([True, False])
                )
                
                # Create Media for house
                num_images = random.randint(3, 6)
                for k in range(num_images):
                    Media.objects.create(
                        content_type=ContentType.objects.get_for_model(House),
                        object_id=house.id,
                        url=f'https://placehold.co/800x600?text=House{house.id}Image{k+1}',
                        media_type='image',
                        purpose='gallery'
                    )
                
                self.houses.append(house)

    def create_rooms(self):
        self.stdout.write('Creating rooms...')
        
        self.rooms = []
        for house in self.houses:
            num_rooms = random.randint(2, 5)
            for i in range(num_rooms):
                max_people = random.randint(1, 4)
                cur_people = random.randint(0, max_people)
                
                room = Room.objects.create(
                    house=house,
                    title=f"Room {i+1} in {house.title}",
                    description=f"A spacious room with good lighting and ventilation. The room includes basic furniture.",
                    price=random.randint(150, 500) * 100000,
                    max_people=max_people,
                    cur_people=cur_people,
                    bedrooms=random.randint(1, 2),
                    bathrooms=random.randint(1, 2),
                    area=random.uniform(15.0, 40.0)
                )
                
                # Create Media for room
                num_images = random.randint(2, 4)
                for j in range(num_images):
                    Media.objects.create(
                        content_type=ContentType.objects.get_for_model(Room),
                        object_id=room.id,
                        url=f'https://placehold.co/800x600?text=Room{room.id}Image{j+1}',
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
        self.stdout.write('Creating posts...')
        
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
                        title = f"Room for rent in {house.title}"
                        content = f"I have a great room available in my {house.type}. It's located at {house.address} and the price is {house.base_price} VND per month. Contact me for more details!"
                        address = house.address
                        latitude = house.latitude
                        longitude = house.longitude
                    else:
                        continue
                else:
                    title = "Room for rent"
                    content = "I have a room for rent in my apartment. It's located in a convenient area with easy access to public transportation. The price is negotiable. Contact me for more details!"
                    
            elif post_type == PostType.SEARCH_LISTING.value[0]:
                title = "Looking for a room"
                content = f"Hi, I'm {user.first_name}. I'm looking for a room to rent in the city center area. My budget is around 3-5 million VND per month. I'm a clean and quiet person. Please contact me if you have any available rooms!"
                
            elif post_type == PostType.ROOMMATE.value[0]:
                title = "Looking for a roommate"
                content = f"Hi, I'm {user.first_name}. I'm looking for a roommate to share my apartment. The rent is 7 million VND per month (3.5 million VND each). The apartment has 2 bedrooms, 1 bathroom, and a kitchen. Please contact me if you're interested!"
                
            post = Post.objects.create(
                author=user,
                type=post_type,
                title=title,
                content=content,
                address=address,
                latitude=latitude,
                longitude=longitude,
                house_link=house_link,
                is_active=random.choice([True, True, True, False])  # 75% chance of being active
            )
            
            # Create Media for post
            num_images = random.randint(0, 3)
            for j in range(num_images):
                Media.objects.create(
                    content_type=ContentType.objects.get_for_model(Post),
                    object_id=post.id,
                    url=f'https://placehold.co/800x600?text=Post{post.id}Image{j+1}',
                    media_type='image',
                    purpose='attachment'
                )
            
            self.posts.append(post)

    def create_comments(self):
        self.stdout.write('Creating comments...')
        
        users = User.objects.all()
        
        for post in self.posts:
            num_comments = random.randint(0, 5)
            parent_comments = []
            
            for i in range(num_comments):
                user = random.choice(users)
                
                comment_content = random.choice([
                    "This looks great! I'm interested.",
                    "What's the exact location?",
                    "Is this still available?",
                    "Does the price include utilities?",
                    "How many people are currently living there?",
                    "Is it close to public transportation?",
                    "Do you allow pets?",
                    "I'll send you a private message for more details.",
                    "When can I come to see the place?",
                    "Is there any deposit required?"
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
                        url=f'https://placehold.co/800x600?text=Comment{comment.id}Image',
                        media_type='image',
                        purpose='attachment'
                    )
            
            # Create some replies
            for parent_comment in parent_comments:
                if random.random() < 0.3:  # 30% chance of having a reply
                    user = random.choice(users)
                    if user != parent_comment.author:  # Don't reply to yourself
                        reply_content = random.choice([
                            "Thanks for your interest!",
                            "Yes, it's still available.",
                            "The price includes water and electricity.",
                            "It's about 5 minutes walk to the bus station.",
                            "Sorry, no pets allowed.",
                            "You can visit this weekend if you want.",
                            "Yes, there's a 1-month deposit.",
                            "I'll send you more details via private message."
                        ])
                        
                        Comment.objects.create(
                            post=post,
                            author=user,
                            content=reply_content,
                            parent=parent_comment
                        )

    def create_interactions(self):
        self.stdout.write('Creating interactions...')
        
        users = User.objects.all()
        interaction_types = [interaction_type.value[0] for interaction_type in InteractionType]
        
        for post in self.posts:
            num_interactions = random.randint(0, 15)
            for _ in range(num_interactions):
                user = random.choice(users)
                interaction_type = random.choice(interaction_types)
                
                # Check if interaction already exists
                if not Interaction.objects.filter(user=user, post=post, type=interaction_type).exists():
                    Interaction.objects.create(
                        user=user,
                        post=post,
                        type=interaction_type,
                        is_interacted=True
                    )

    def create_follows(self):
        self.stdout.write('Creating follows...')
        
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
        self.stdout.write('Creating chats and messages...')
        
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
                        "Hi, how are you?",
                        "I'm interested in your listing.",
                        "Is the room still available?",
                        "When can I come to see the place?",
                        "What's the exact address?",
                        "Do you allow pets?",
                        "Is the price negotiable?",
                        "Are utilities included in the price?",
                        "Is there any deposit required?",
                        "How far is it from public transportation?"
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
                            url=f'https://placehold.co/800x600?text=Message{message.id}Attachment',
                            media_type='image',
                            purpose='attachment'
                        )
        
        # Create a few group chats
        for i in range(5):
            # Select 3-6 random users for each group chat
            chat_members = random.sample(users, random.randint(3, 6))
            creator = chat_members[0]
            
            group_chat = ChatGroup.objects.create(
                name=f"Group Chat {i+1}",
                description=f"A group for discussing housing in area {i+1}",
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
                    "Hello everyone!",
                    "Has anyone found a good place?",
                    "I'm looking for a roommate in District 1.",
                    "Anyone know a good agent?",
                    "Prices keep going up in this area!",
                    "I just found a great place, but it's already taken.",
                    "Let's meet up this weekend to discuss housing options.",
                    "Has anyone lived in this neighborhood before?",
                    "Any recommendations for affordable places?",
                    "What's a reasonable price for a 2-bedroom in this area?"
                ])
                
                Message.objects.create(
                    chat_group=group_chat,
                    sender=sender,
                    content=message_content
                )

    def create_rates(self):
        self.stdout.write('Creating rates...')
        
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
                        f"Great place! {stars}/5 stars.",
                        f"The location is convenient. {stars}/5.",
                        f"Good value for money. {stars}/5.",
                        f"The owner is very responsive. {stars}/5.",
                        f"Clean and comfortable. {stars}/5.",
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
                            url=f'https://placehold.co/800x600?text=Rating{rate.id}Image',
                            media_type='image',
                            purpose='attachment'
                        )

    def create_notifications(self):
        self.stdout.write('Creating notifications...')
        
        users = User.objects.all()
        notification_types = [notification_type.value[0] for notification_type in NotificationType]
        
        # Create a few random notifications for each user
        for user in users:
            num_notifications = random.randint(3, 10)
            
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
                        content = f"{sender.first_name} has published a new post: {post.title}"
                        url = f"/posts/{post.id}/"
                        related_object_type = ContentType.objects.get_for_model(Post)
                        related_object_id = post.id
                    
                    elif notification_type == NotificationType.COMMENT.value[0]:
                        # Find a post by the user
                        user_posts = list(Post.objects.filter(author=user))
                        if not user_posts:
                            continue  # Skip if user has no posts
                            
                        post = random.choice(user_posts)
                        content = f"{sender.first_name} commented on your post: {post.title}"
                        url = f"/posts/{post.id}/"
                        related_object_type = ContentType.objects.get_for_model(Comment)
                        related_object_id = None
                    
                    elif notification_type == NotificationType.FOLLOW.value[0]:
                        content = f"{sender.first_name} started following you"
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
                        content = f"{sender.first_name} {interaction_type.lower()} your post: {post.title}"
                        url = f"/posts/{post.id}/"
                        related_object_type = ContentType.objects.get_for_model(Post)
                        related_object_id = post.id
                    
                    elif notification_type == NotificationType.MESSAGE.value[0]:
                        content = f"You have a new message from {sender.first_name}"
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