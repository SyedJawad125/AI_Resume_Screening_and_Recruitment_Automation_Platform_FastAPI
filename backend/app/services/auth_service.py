"""
app/services/auth_service.py
──────────────────────────────
Auth business logic extracted from route handlers.
Keeps api/v1/auth.py thin — just HTTP in/out.
"""
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from app.core.exceptions import UnauthorizedError, ValidationError
from app.models.user import User, UserToken, Company
from app.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)
MAX_LOGIN_ATTEMPTS = 5


class AuthService:

    async def register(self, first_name: str, last_name: str, email: str,
                       password: str, company_name: str | None, db: AsyncSession) -> User:
        repo = UserRepository(db)

        if await repo.get_by_email(email):
            raise ValidationError('An account with this email already exists.')

        company = None
        if company_name:
            from python_slugify import slugify
            company = await repo.create_company(
                name=company_name.strip().title(),
                slug=slugify(company_name),
            )

        user = await repo.create(
            username      = email,
            email         = email,
            first_name    = first_name.strip().title(),
            last_name     = last_name.strip().title(),
            full_name     = f'{first_name.strip().title()} {last_name.strip().title()}',
            password_hash = hash_password(password),
            company_id    = str(company.id) if company else None,
            is_active     = True,
            is_verified   = True,
        )
        await db.commit()
        logger.info(f'[Auth] Registered: {email}')
        return user

    async def login(self, email: str, password: str, db: AsyncSession) -> tuple[User, str, str]:
        repo = UserRepository(db)
        user = await repo.get_by_email(email)

        if not user:
            raise UnauthorizedError('Invalid email or password.')
        if user.is_blocked:
            raise UnauthorizedError('Account is blocked. Contact support.')

        if not verify_password(password, user.password_hash or ''):
            user.login_attempts = (user.login_attempts or 0) + 1
            if user.login_attempts >= MAX_LOGIN_ATTEMPTS:
                user.is_blocked = True
                logger.warning(f'[Auth] Account blocked after {MAX_LOGIN_ATTEMPTS} attempts: {email}')
            await db.commit()
            raise UnauthorizedError('Invalid email or password.')

        user.login_attempts = 0
        user.last_login     = datetime.now(timezone.utc)
        await db.commit()

        data          = {'sub': str(user.id)}
        access_token  = create_access_token(data)
        refresh_token = create_refresh_token(data)

        token = UserToken(
            user_id    = user.id,
            token_hash = hash_password(refresh_token),
            expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        db.add(token)
        await db.commit()

        logger.info(f'[Auth] Login: {email}')
        return user, access_token, refresh_token


auth_service = AuthService()