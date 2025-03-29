import random
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q
from django.contrib.auth.hashers import make_password
from rent_house.models import (
    User, House, Room, Post, Comment, Interaction, Follow, 
    Notification, BoxChat, Message, Rate, Image, 
    Role, HouseType, PostType, InteractionType, NotificationType
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
                
                # Create box chats and messages
                self.create_chats_and_messages()
                
                # Create rates
                self.create_rates()
                
            self.stdout.write(self.style.SUCCESS('Successfully populated database!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error populating database: {str(e)}'))

    def create_users(self):
        self.stdout.write('Creating users...')
        
        # Create admin user
        
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
        
        self.users = [moderator] + owners + renters

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
                    price=random.randint(300, 1500) * 100000,
                    is_verified=random.choice([True, False])
                )
                
                # Create images for house
                num_images = random.randint(3, 6)
                for k in range(num_images):
                    Image.objects.create(
                        url=f'https://placehold.co/800x600?text=House{house.id}Image{k+1}',
                        house=house
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
                    cur_people=cur_people
                )
                
                # Create images for room
                num_images = random.randint(2, 4)
                for j in range(num_images):
                    Image.objects.create(
                        url=f'https://placehold.co/800x600?text=Room{room.id}Image{j+1}',
                        room=room
                    )
                
                self.rooms.append(room)
                
                # Assign renters to rooms
                if cur_people > 0:
                    available_renters = User.objects.filter(role=Role.RENTER.value[0], room__isnull=True)[:cur_people]
                    for renter in available_renters:
                        renter.room = room
                        renter.save()

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
                        content = f"I have a great room available in my {house.type}. It's located at {house.address} and the price is {house.price} VND per month. Contact me for more details!"
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
            
            # Create images for post
            num_images = random.randint(0, 3)
            for j in range(num_images):
                Image.objects.create(
                    url=f'https://placehold.co/800x600?text=Post{post.id}Image{j+1}',
                    post=post
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
                
                # Add image to some comments
                if random.random() < 0.2:  # 20% chance
                    Image.objects.create(
                        url=f'https://placehold.co/800x600?text=Comment{comment.id}Image',
                        comment=comment
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
        
        # Create some box chats between users
        for i in range(20):
            user_pair = random.sample(users, 2)
            user1, user2 = user_pair
            # Check if box chat already exists
            if not BoxChat.objects.filter(
                (Q(user1=user1) & Q(user2=user2)) | 
                (Q(user1=user2) & Q(user2=user1))
            ).exists():
                box_chat = BoxChat.objects.create(
                    user1=user1,
                    user2=user2
                )
                
                # Create messages in the box chat
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
                        boxchat=box_chat,
                        sender=sender,
                        content=message_content
                    )
                    
                    # Add attachment to some messages
                    if random.random() < 0.2:  # 20% chance
                        message.attachment = f'https://placehold.co/800x600?text=Message{message.id}Attachment'
                        message.save()

    def create_rates(self):
        self.stdout.write('Creating rates...')
        
        users = User.objects.filter(role=Role.RENTER.value[0])
        houses = House.objects.all()
        
        for house in houses:
            num_ratings = random.randint(0, 5)
            raters = random.sample(list(users), min(num_ratings, users.count()))
            
            for user in raters:
                # Check if rating already exists
                if not Rate.objects.filter(user=user, house=house).exists():
                    Rate.objects.create(
                        user=user,
                        house=house,
                        star=random.randint(1, 5)
                    )