"""
Authentication router - Register, Login, and Profile endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.models.user import User, UserRole
from app.models.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=UserRole(user_data.role),
    )
    db.add(new_user)
    await db.flush()
    await db.refresh(new_user)

    # Generate token
    access_token = create_access_token(data={"sub": str(new_user.id)})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse.model_validate(current_user)
