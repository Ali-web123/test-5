from fastapi import FastAPI, APIRouter, Depends, Request, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import os
import logging
import jwt
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Add session middleware for OAuth
app.add_middleware(SessionMiddleware, secret_key=os.environ.get('SECRET_KEY'))

# OAuth configuration
config = Config(ROOT_DIR / '.env')
oauth = OAuth(config)
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# User Models
class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    google_id: str
    email: str
    name: str
    picture: str = ""
    about_me: str = ""
    age: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: datetime = Field(default_factory=datetime.utcnow)

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    about_me: Optional[str] = None
    age: Optional[int] = None

# Badge Models
class Badge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: int
    course_title: str
    course_category: str  # masterclasses, careerpaths, crashcourses
    badge_name: str
    badge_description: str
    earned_at: datetime = Field(default_factory=datetime.utcnow)
    quiz_score: int

class BadgeCreate(BaseModel):
    course_id: int
    course_category: str
    quiz_score: int

# Course Models
class CourseSession(BaseModel):
    id: int
    title: str
    duration: str
    description: str
    video_url: Optional[str] = ""

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct: int

class Quiz(BaseModel):
    questions: List[QuizQuestion]

class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    duration: str
    instructor: str
    level: str  # Beginner, Intermediate, Advanced, Expert, All Levels
    category: str  # masterclasses, careerpaths, crashcourses
    tags: List[str]
    sessions: List[CourseSession]
    quiz: Quiz
    created_by: str  # user_id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    published: bool = False
    views: int = 0

class CourseCreate(BaseModel):
    title: str
    description: str
    duration: str
    level: str
    category: str
    tags: List[str]
    sessions: List[CourseSession]
    quiz: Quiz

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# JWT Token functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.environ.get("SECRET_KEY"), algorithm="HS256")
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, os.environ.get("SECRET_KEY"), algorithms=["HS256"])
        return payload
    except jwt.exceptions.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (jwt.exceptions.DecodeError, jwt.exceptions.InvalidTokenError):
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    google_id = payload.get("sub")
    
    user = await db.users.find_one({"google_id": google_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserProfile(**user)

# Authentication routes
@api_router.get("/auth/login/google")
async def google_login(request: Request):
    # Get the frontend URL from environment or use default
    frontend_url = os.environ.get('FRONTEND_URL', 'https://dfe70bfd-0f3f-4410-b7d9-a3ddbd0a6aab.preview.emergentagent.com')
    redirect_uri = f"{request.base_url}api/auth/google"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@api_router.get("/auth/google")
async def google_auth(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
        # Create or update user in MongoDB
        user_data = {
            "id": str(uuid.uuid4()),
            "google_id": user_info["sub"],
            "email": user_info["email"],
            "name": user_info["name"],
            "picture": user_info.get("picture", ""),
            "about_me": "",
            "age": None,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow()
        }
        
        # Update if exists, insert if new
        await db.users.update_one(
            {"google_id": user_info["sub"]},
            {"$set": user_data},
            upsert=True
        )
        
        # Create JWT token
        access_token = create_access_token(data={
            "sub": user_info["sub"],
            "email": user_info["email"],
            "name": user_info["name"]
        })
        
        # Redirect to frontend with token
        frontend_url = os.environ.get('FRONTEND_URL', 'https://dfe70bfd-0f3f-4410-b7d9-a3ddbd0a6aab.preview.emergentagent.com')
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={access_token}")
        
    except Exception as e:
        frontend_url = os.environ.get('FRONTEND_URL', 'https://dfe70bfd-0f3f-4410-b7d9-a3ddbd0a6aab.preview.emergentagent.com')
        return RedirectResponse(url=f"{frontend_url}/auth/error?message={str(e)}")

@api_router.get("/auth/me", response_model=UserProfile)
async def get_current_user_profile(current_user: UserProfile = Depends(get_current_user)):
    return current_user

@api_router.put("/auth/profile", response_model=UserProfile)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    update_data = profile_update.dict(exclude_unset=True)
    if update_data:
        await db.users.update_one(
            {"google_id": current_user.google_id},
            {"$set": update_data}
        )
        
        # Fetch updated user
        updated_user = await db.users.find_one({"google_id": current_user.google_id})
        return UserProfile(**updated_user)
    
    return current_user

@api_router.post("/auth/logout")
async def logout():
    return {"message": "Logged out successfully"}

# Badge endpoints
@api_router.post("/badges", response_model=Badge)
async def create_badge(
    badge_data: BadgeCreate,
    current_user: UserProfile = Depends(get_current_user)
):
    # Check if badge already exists for this user and course
    existing_badge = await db.badges.find_one({
        "user_id": current_user.id,
        "course_id": badge_data.course_id,
        "course_category": badge_data.course_category
    })
    
    if existing_badge:
        raise HTTPException(status_code=400, detail="Badge already earned for this course")
    
    # Create badge name and description based on course
    badge_name = f"{badge_data.course_category.title()} Completion"
    badge_description = f"Successfully completed course with {badge_data.quiz_score}% score"
    
    badge = Badge(
        user_id=current_user.id,
        course_id=badge_data.course_id,
        course_title="",  # Will be filled by frontend
        course_category=badge_data.course_category,
        badge_name=badge_name,
        badge_description=badge_description,
        quiz_score=badge_data.quiz_score
    )
    
    await db.badges.insert_one(badge.dict())
    return badge

@api_router.get("/badges/me", response_model=List[Badge])
async def get_my_badges(current_user: UserProfile = Depends(get_current_user)):
    badges = await db.badges.find({"user_id": current_user.id}).to_list(1000)
    return [Badge(**badge) for badge in badges]

@api_router.get("/badges/user/{user_id}", response_model=List[Badge])
async def get_user_badges(user_id: str):
    badges = await db.badges.find({"user_id": user_id}).to_list(1000)
    return [Badge(**badge) for badge in badges]

@api_router.put("/badges/{badge_id}", response_model=Badge)
async def update_badge_course_title(
    badge_id: str,
    course_title: str,
    current_user: UserProfile = Depends(get_current_user)
):
    # Update badge with course title
    await db.badges.update_one(
        {"id": badge_id, "user_id": current_user.id},
        {"$set": {"course_title": course_title}}
    )
    
    updated_badge = await db.badges.find_one({"id": badge_id})
    if not updated_badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    
    return Badge(**updated_badge)

# Existing routes
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
