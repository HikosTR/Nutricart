from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'herbalife-secret-key-2025')
JWT_ALGORITHM = 'HS256'

# Models
class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminCreate(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    token: str
    token_type: str = "bearer"

class ProductVariant(BaseModel):
    name: str
    stock: int = 100
    image_url: Optional[str] = None
    is_available: bool = True

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    image_url: str
    category: str
    stock: int = 100
    is_package: bool = False
    has_variants: bool = False
    variants: Optional[List[ProductVariant]] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    category: str
    stock: int = 100
    is_package: bool = False
    has_variants: bool = False
    variants: Optional[List[ProductVariant]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    is_package: Optional[bool] = None
    has_variants: Optional[bool] = None
    variants: Optional[List[ProductVariant]] = None

class Slide(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    media_type: str = "video"  # "video" or "image"
    youtube_url: Optional[str] = None
    image_url: Optional[str] = None
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SlideCreate(BaseModel):
    title: str
    media_type: str = "video"
    youtube_url: Optional[str] = None
    image_url: Optional[str] = None
    order: int = 0
    active: bool = True

class SlideUpdate(BaseModel):
    title: Optional[str] = None
    media_type: Optional[str] = None
    youtube_url: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None
    active: Optional[bool] = None

# Keep Video for backward compatibility
class Video(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    youtube_url: str
    media_type: str = "video"
    image_url: Optional[str] = None
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VideoCreate(BaseModel):
    title: str
    youtube_url: Optional[str] = None
    media_type: str = "video"
    image_url: Optional[str] = None
    order: int = 0
    active: bool = True

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    youtube_url: Optional[str] = None
    media_type: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None
    active: Optional[bool] = None

class Banner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image_url: str
    link_url: Optional[str] = None
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BannerCreate(BaseModel):
    title: str
    description: str
    image_url: str
    link_url: Optional[str] = None
    active: bool = True

class BannerUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    active: Optional[bool] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    variant: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_code: str = Field(default_factory=lambda: f"HRB-{uuid.uuid4().hex[:6].upper()}")
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    customer_address: str
    receipt_file_url: Optional[str] = None
    items: List[OrderItem]
    total_amount: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    customer_address: str
    receipt_file_url: Optional[str] = None
    items: List[OrderItem]
    total_amount: float

class OrderUpdate(BaseModel):
    status: str

class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_image: Optional[str] = None
    rating: int
    comment: str
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TestimonialCreate(BaseModel):
    customer_name: str
    customer_image: Optional[str] = None
    rating: int
    comment: str
    active: bool = True

class TestimonialUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_image: Optional[str] = None
    rating: Optional[int] = None
    comment: Optional[str] = None
    active: Optional[bool] = None

class PaymentSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "payment_settings"
    account_holder_name: str
    iban: str
    bank_name: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentSettingsUpdate(BaseModel):
    account_holder_name: str
    iban: str
    bank_name: Optional[str] = None

class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    logo_url: str = "https://customer-assets.emergentagent.com/job_herbalife-shop-3/artifacts/51go848j_Ekran%20Resmi%202026-01-18%2004.46.44.png"
    topbar_message: str = "🚚 Kargo Ücretsizdir!"
    footer_about: str = "Sağlıklı yaşamınız için doğru adres"
    footer_phone: str = "+90 542 140 07 55"
    footer_email: str = "info@herbalife.com"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SiteSettingsUpdate(BaseModel):
    logo_url: str
    topbar_message: Optional[str] = None
    footer_about: Optional[str] = None
    footer_phone: Optional[str] = None
    footer_email: Optional[str] = None

# Auth helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(email: str) -> str:
    payload = {
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get('email')
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        admin = await db.admins.find_one({"email": email}, {"_id": 0})
        if not admin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin not found")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Auth Routes
@api_router.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_admin(input: AdminCreate):
    existing = await db.admins.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    admin = Admin(email=input.email, password_hash=hash_password(input.password))
    doc = admin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.admins.insert_one(doc)
    
    token = create_token(input.email)
    return Token(token=token)

@api_router.post("/auth/login", response_model=Token)
async def login_admin(input: AdminLogin):
    admin = await db.admins.find_one({"email": input.email}, {"_id": 0})
    if not admin or not verify_password(input.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(input.email)
    return Token(token=token)

# Product Routes
@api_router.get("/products", response_model=List[Product])
async def get_products(is_package: Optional[bool] = None):
    query = {} if is_package is None else {"is_package": is_package}
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

@api_router.post("/products", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(input: ProductCreate, admin: dict = Depends(get_current_admin)):
    product = Product(**input.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, input: ProductUpdate, admin: dict = Depends(get_current_admin)):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if update_data:
        await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# Video Routes
@api_router.get("/videos", response_model=List[Video])
async def get_videos():
    videos = await db.videos.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(1000)
    for v in videos:
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return videos

@api_router.post("/videos", response_model=Video, status_code=status.HTTP_201_CREATED)
async def create_video(input: VideoCreate, admin: dict = Depends(get_current_admin)):
    video = Video(**input.model_dump())
    doc = video.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.videos.insert_one(doc)
    return video

@api_router.put("/videos/{video_id}", response_model=Video)
async def update_video(video_id: str, input: VideoUpdate, admin: dict = Depends(get_current_admin)):
    existing = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Video not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if update_data:
        await db.videos.update_one({"id": video_id}, {"$set": update_data})
    
    updated = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.videos.delete_one({"id": video_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"message": "Video deleted"}

# Banner Routes
@api_router.get("/banners", response_model=List[Banner])
async def get_banners():
    banners = await db.banners.find({"active": True}, {"_id": 0}).to_list(1000)
    for b in banners:
        if isinstance(b.get('created_at'), str):
            b['created_at'] = datetime.fromisoformat(b['created_at'])
    return banners

@api_router.post("/banners", response_model=Banner, status_code=status.HTTP_201_CREATED)
async def create_banner(input: BannerCreate, admin: dict = Depends(get_current_admin)):
    banner = Banner(**input.model_dump())
    doc = banner.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.banners.insert_one(doc)
    return banner

@api_router.put("/banners/{banner_id}", response_model=Banner)
async def update_banner(banner_id: str, input: BannerUpdate, admin: dict = Depends(get_current_admin)):
    existing = await db.banners.find_one({"id": banner_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if update_data:
        await db.banners.update_one({"id": banner_id}, {"$set": update_data})
    
    updated = await db.banners.find_one({"id": banner_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/banners/{banner_id}")
async def delete_banner(banner_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.banners.delete_one({"id": banner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Banner deleted"}

# Order Routes
@api_router.post("/orders", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(input: OrderCreate):
    order = Order(**input.model_dump())
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['items'] = [item.model_dump() for item in order.items]
    await db.orders.insert_one(doc)
    return order

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({
        "$or": [
            {"id": order_id},
            {"order_code": order_id.upper()}
        ]
    }, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(admin: dict = Depends(get_current_admin)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for o in orders:
        if isinstance(o.get('created_at'), str):
            o['created_at'] = datetime.fromisoformat(o['created_at'])
    return orders

@api_router.put("/orders/{order_id}", response_model=Order)
async def update_order(order_id: str, input: OrderUpdate, admin: dict = Depends(get_current_admin)):
    existing = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.orders.update_one({"id": order_id}, {"$set": {"status": input.status}})
    
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

# Testimonial Routes
@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials():
    testimonials = await db.testimonials.find({"active": True}, {"_id": 0}).to_list(1000)
    for t in testimonials:
        if isinstance(t.get('created_at'), str):
            t['created_at'] = datetime.fromisoformat(t['created_at'])
    return testimonials

@api_router.post("/testimonials", response_model=Testimonial, status_code=status.HTTP_201_CREATED)
async def create_testimonial(input: TestimonialCreate, admin: dict = Depends(get_current_admin)):
    testimonial = Testimonial(**input.model_dump())
    doc = testimonial.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.testimonials.insert_one(doc)
    return testimonial

@api_router.put("/testimonials/{testimonial_id}", response_model=Testimonial)
async def update_testimonial(testimonial_id: str, input: TestimonialUpdate, admin: dict = Depends(get_current_admin)):
    existing = await db.testimonials.find_one({"id": testimonial_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if update_data:
        await db.testimonials.update_one({"id": testimonial_id}, {"$set": update_data})
    
    updated = await db.testimonials.find_one({"id": testimonial_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted"}

# Payment Settings Routes
@api_router.get("/payment-settings", response_model=PaymentSettings)
async def get_payment_settings():
    settings = await db.payment_settings.find_one({"id": "payment_settings"}, {"_id": 0})
    if not settings:
        default_settings = PaymentSettings(
            account_holder_name="Herbalife Türkiye",
            iban="TR00 0000 0000 0000 0000 0000 00",
            bank_name="Banka Adı"
        )
        doc = default_settings.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.payment_settings.insert_one(doc)
        return default_settings
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return settings

@api_router.put("/payment-settings", response_model=PaymentSettings)
async def update_payment_settings(input: PaymentSettingsUpdate, admin: dict = Depends(get_current_admin)):
    settings = PaymentSettings(**input.model_dump(), id="payment_settings")
    doc = settings.model_dump()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.payment_settings.update_one(
        {"id": "payment_settings"},
        {"$set": doc},
        upsert=True
    )
    
    updated = await db.payment_settings.find_one({"id": "payment_settings"}, {"_id": 0})
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return updated

# Site Settings Routes
@api_router.get("/site-settings", response_model=SiteSettings)
async def get_site_settings():
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        default_settings = SiteSettings()
        doc = default_settings.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.site_settings.insert_one(doc)
        return default_settings
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return settings

@api_router.put("/site-settings", response_model=SiteSettings)
async def update_site_settings(input: SiteSettingsUpdate, admin: dict = Depends(get_current_admin)):
    settings = SiteSettings(**input.model_dump(), id="site_settings")
    doc = settings.model_dump()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.site_settings.update_one(
        {"id": "site_settings"},
        {"$set": doc},
        upsert=True
    )
    
    updated = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return updated

# File Upload Route
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Sadece JPG, PNG ve PDF dosyaları yüklenebilir")
        
        max_size = 5 * 1024 * 1024  # 5MB
        contents = await file.read()
        if len(contents) > max_size:
            raise HTTPException(status_code=400, detail="Dosya boyutu 5MB'dan küçük olmalıdır")
        
        file_id = str(uuid.uuid4())
        file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        file_name = f"{file_id}.{file_ext}"
        
        upload_dir = Path("/app/uploads")
        upload_dir.mkdir(exist_ok=True)
        
        file_path = upload_dir / file_name
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        base_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
        file_url = f"{base_url}/uploads/{file_name}"
        
        return {"file_url": file_url, "file_name": file_name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dosya yükleme hatası: {str(e)}")

app.include_router(api_router)

# Mount uploads directory for static file serving
upload_dir = Path("/app/uploads")
upload_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()