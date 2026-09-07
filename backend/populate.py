"""
populate.py
────────────
Seeds roles and users.
Fixed: async SQLAlchemy, correct imports, Windows fix.
Keeps your original 3 superuser structure.
"""
import asyncio
import sys
import os

# Windows fix
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


async def populate():
    from app.db.database import AsyncSessionLocal   # ✅ correct path
    from app.models.user import Permission, Role, User, Company
    from app.core.security import hash_password     # ✅ correct path
    from sqlalchemy import select

    print("=" * 60)
    print("🚀 Starting Database Population")
    print("=" * 60)

    async with AsyncSessionLocal() as db:

        # ── Step 1: Super Role ─────────────────────────────────────
        print("\n📋 Step 1: Creating Super Role...")
        existing_super = (await db.execute(
            select(Role).where(Role.code_name == 'admin')
        )).scalar_one_or_none()

        if not existing_super:
            all_perms = (await db.execute(select(Permission))).scalars().all()
            super_role = Role(
                name        = 'Super',
                code_name   = 'admin',
                description = 'Super Admin role with all permissions',
            )
            super_role.permissions = list(all_perms)
            db.add(super_role)
            await db.flush()
            print(f'✅ Super role created with {len(all_perms)} permissions')
        else:
            super_role = existing_super
            print('⏭  Super role already exists')

        # ── Step 2: Employee Role ──────────────────────────────────
        print("\n📋 Step 2: Creating Employee Role...")
        existing_emp = (await db.execute(
            select(Role).where(Role.code_name == 'user')
        )).scalar_one_or_none()

        if not existing_emp:
            emp_codes = [
                'can_upload_document', 'can_view_documents',
                'can_delete_document', 'can_search',
                'can_chat', 'can_summarize', 'can_download_report',
            ]
            emp_perms = (await db.execute(
                select(Permission).where(Permission.code_name.in_(emp_codes))
            )).scalars().all()
            emp_role = Role(
                name        = 'Employee',
                code_name   = 'user',
                description = 'Regular employee with limited permissions',
            )
            emp_role.permissions = list(emp_perms)
            db.add(emp_role)
            print(f'✅ Employee role created with {len(emp_perms)} permissions')
        else:
            print('⏭  Employee role already exists')

        # ── Step 3: Default Company ────────────────────────────────
        print("\n📋 Step 3: Creating Default Company...")
        company = (await db.execute(
            select(Company).where(Company.slug == 'document-ai-system')
        )).scalar_one_or_none()

        if not company:
            company = Company(
                name  = 'Document AI System',
                slug  = 'document-ai-system',
                email = 'admin@documentai.com',
            )
            db.add(company)
            await db.flush()
            print('✅ Default company created')
        else:
            print('⏭  Default company already exists')

        # ── Step 4: Superuser 1 ────────────────────────────────────
        print("\n📋 Step 4: Creating Superuser 1...")
        u1 = (await db.execute(
            select(User).where(User.username == 'superuser')
        )).scalar_one_or_none()

        if not u1:
            u1 = User(
                username      = 'superuser',
                email         = 'superuser@example.com',
                first_name    = 'Super',
                last_name     = 'User',
                full_name     = 'Super User',
                password_hash = hash_password('Admin@1234'),
                is_superuser  = True,
                is_active     = True,
                is_verified   = True,
                role_id       = super_role.id,
                company_id    = company.id,
            )
            db.add(u1)
            print('✅ Superuser 1 created')
            print('   Username: superuser | Password: Admin@1234')
        else:
            u1.is_superuser  = True
            u1.is_active     = True
            u1.role_id       = super_role.id
            u1.password_hash = hash_password('Admin@1234')
            print('⏭  Superuser 1 updated')

        # ── Step 5: Superuser 2 (your email) ──────────────────────
        print("\n📋 Step 5: Creating Superuser 2...")
        u2 = (await db.execute(
            select(User).where(User.email == 'syedjawadali92@gmail.com')
        )).scalar_one_or_none()

        if not u2:
            u2 = User(
                username      = 'syedjawadali92@gmail.com',
                email         = 'syedjawadali92@gmail.com',
                first_name    = 'Syed',
                last_name     = 'Jawad',
                full_name     = 'Syed Jawad Ali',
                password_hash = hash_password('Admin@1234'),
                is_superuser  = True,
                is_active     = True,
                is_verified   = True,
                role_id       = super_role.id,
                company_id    = company.id,
            )
            db.add(u2)
            print('✅ Superuser 2 created')
            print('   Email: syedjawadali92@gmail.com | Password: Admin@1234')
        else:
            u2.is_superuser  = True
            u2.is_active     = True
            u2.role_id       = super_role.id
            u2.password_hash = hash_password('Admin@1234')
            print('⏭  Superuser 2 updated')

        # ── Step 6: Superuser 3 ────────────────────────────────────
        print("\n📋 Step 6: Creating Superuser 3...")
        u3 = (await db.execute(
            select(User).where(User.email == 'nicenick1992@gmail.com')
        )).scalar_one_or_none()

        if not u3:
            u3 = User(
                username      = 'nicenick1992@gmail.com',
                email         = 'nicenick1992@gmail.com',
                first_name    = 'Nice',
                last_name     = 'Nick',
                full_name     = 'Nice Nick',
                password_hash = hash_password('Admin@1234'),
                is_superuser  = True,
                is_active     = True,
                is_verified   = True,
                role_id       = super_role.id,
                company_id    = company.id,
            )
            db.add(u3)
            print('✅ Superuser 3 created')
            print('   Email: nicenick1992@gmail.com | Password: Admin@1234')
        else:
            u3.is_superuser  = True
            u3.is_active     = True
            u3.role_id       = super_role.id
            u3.password_hash = hash_password('Admin@1234')
            print('⏭  Superuser 3 updated')

        await db.commit()

    print("\n" + "=" * 60)
    print("✅ Database Population Completed Successfully!")
    print("=" * 60)
    print("\n📋 Login credentials:")
    print("   • superuser@example.com      / Admin@1234")
    print("   • syedjawadali92@gmail.com   / Admin@1234")
    print("   • nicenick1992@gmail.com     / Admin@1234")
    print("\n   Docs: http://localhost:8000/api/docs")


if __name__ == '__main__':
    asyncio.run(populate())