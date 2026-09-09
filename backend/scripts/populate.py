"""
scripts/populate.py
────────────────────────
Seeds roles, a default company, and test superusers for local development.

Run in this order:
    python -m scripts.add_permissions
    python -m scripts.populate

Idempotent — safe to run multiple times (checks for existing rows first,
updates password/flags on existing users rather than erroring).

⚠️  The credentials below are for LOCAL DEVELOPMENT ONLY. Never deploy
this script's default passwords to a real environment — change them or
delete the test users before going anywhere near production.
"""
import asyncio
import sys
import os

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DEFAULT_PASSWORD = "Admin@1234"

# Permission code_names (must match scripts/add_permissions.py) granted to
# the RECRUITER role — day-to-day operator of the platform.
RECRUITER_PERMISSIONS = [
    "can_create_job", "can_view_jobs", "can_update_job", "can_screen_candidates",
    "can_upload_resume", "can_view_resume_status",
    "can_view_candidates", "can_view_candidate_score", "can_compare_candidates",
    "can_search_candidates",
    "can_create_interview", "can_submit_interview_answers", "can_evaluate_interview",
]

# HIRING_MANAGER: read-only over jobs/candidates + interview evaluation —
# reviews results, doesn't create jobs or upload resumes.
HIRING_MANAGER_PERMISSIONS = [
    "can_view_jobs", "can_view_candidates", "can_view_candidate_score",
    "can_compare_candidates", "can_evaluate_interview",
]


async def populate():
    from app.db.database import AsyncSessionLocal
    from app.models.user import Permission, Role, User, Company
    from app.core.security import hash_password
    from sqlalchemy import select

    print("=" * 60)
    print("🚀 Starting HireMind AI Database Population")
    print("=" * 60)

    async with AsyncSessionLocal() as db:

        # ── Step 1: Admin Role (all permissions) ────────────────────
        print("\n📋 Step 1: Creating Admin Role...")
        admin_role = (await db.execute(select(Role).where(Role.code_name == "admin"))).scalar_one_or_none()

        if not admin_role:
            all_perms = (await db.execute(select(Permission))).scalars().all()
            admin_role = Role(name="Admin", code_name="admin", description="Full platform access — all permissions.")
            admin_role.permissions = list(all_perms)
            db.add(admin_role)
            await db.flush()
            print(f"✅ Admin role created with {len(all_perms)} permissions")
        else:
            all_perms = (await db.execute(select(Permission))).scalars().all()
            admin_role.permissions = list(all_perms)  # keep in sync if new permissions were added later
            print(f"⏭  Admin role already exists — refreshed to {len(all_perms)} permissions")

        # ── Step 2: Recruiter Role ───────────────────────────────────
        print("\n📋 Step 2: Creating Recruiter Role...")
        recruiter_role = (await db.execute(select(Role).where(Role.code_name == "recruiter"))).scalar_one_or_none()

        recruiter_perms = (
            await db.execute(select(Permission).where(Permission.code_name.in_(RECRUITER_PERMISSIONS)))
        ).scalars().all()

        if not recruiter_role:
            recruiter_role = Role(
                name="Recruiter", code_name="recruiter",
                description="Creates jobs, uploads resumes, screens and interviews candidates.",
            )
            recruiter_role.permissions = list(recruiter_perms)
            db.add(recruiter_role)
            await db.flush()
            print(f"✅ Recruiter role created with {len(recruiter_perms)} permissions")
        else:
            recruiter_role.permissions = list(recruiter_perms)
            print(f"⏭  Recruiter role already exists — refreshed to {len(recruiter_perms)} permissions")

        # ── Step 3: Hiring Manager Role ──────────────────────────────
        print("\n📋 Step 3: Creating Hiring Manager Role...")
        hm_role = (await db.execute(select(Role).where(Role.code_name == "hiring_manager"))).scalar_one_or_none()

        hm_perms = (
            await db.execute(select(Permission).where(Permission.code_name.in_(HIRING_MANAGER_PERMISSIONS)))
        ).scalars().all()

        if not hm_role:
            hm_role = Role(
                name="Hiring Manager", code_name="hiring_manager",
                description="Reviews shortlisted candidates and interview evaluations.",
            )
            hm_role.permissions = list(hm_perms)
            db.add(hm_role)
            await db.flush()
            print(f"✅ Hiring Manager role created with {len(hm_perms)} permissions")
        else:
            hm_role.permissions = list(hm_perms)
            print(f"⏭  Hiring Manager role already exists — refreshed to {len(hm_perms)} permissions")

        # ── Step 4: Default Company ──────────────────────────────────
        print("\n📋 Step 4: Creating Default Company...")
        company = (await db.execute(select(Company).where(Company.slug == "hiremind-demo"))).scalar_one_or_none()

        if not company:
            company = Company(name="HireMind Demo Co", slug="hiremind-demo", email="admin@hiremind-demo.io")
            db.add(company)
            await db.flush()
            print("✅ Default company created")
        else:
            print("⏭  Default company already exists")

        # ── Step 5: Admin superuser ───────────────────────────────────
        print("\n📋 Step 5: Creating Admin Superuser...")
        admin_user = (await db.execute(select(User).where(User.username == "admin"))).scalar_one_or_none()

        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@hiremind-demo.io",
                first_name="Admin",
                last_name="User",
                full_name="Admin User",
                password_hash=hash_password(DEFAULT_PASSWORD),
                is_superuser=True,
                is_active=True,
                is_verified=True,
                role_id=admin_role.id,
                company_id=company.id,
            )
            db.add(admin_user)
            print("✅ Admin superuser created")
            print(f"   Username: admin | Password: {DEFAULT_PASSWORD}")
        else:
            admin_user.is_superuser = True
            admin_user.is_active = True
            admin_user.role_id = admin_role.id
            admin_user.password_hash = hash_password(DEFAULT_PASSWORD)
            print("⏭  Admin superuser updated")

        # ── Step 6: Sample Recruiter user ─────────────────────────────
        print("\n📋 Step 6: Creating Sample Recruiter...")
        recruiter_user = (
            await db.execute(select(User).where(User.email == "recruiter@hiremind-demo.io"))
        ).scalar_one_or_none()

        if not recruiter_user:
            recruiter_user = User(
                username="recruiter@hiremind-demo.io",
                email="recruiter@hiremind-demo.io",
                first_name="Riley",
                last_name="Recruiter",
                full_name="Riley Recruiter",
                password_hash=hash_password(DEFAULT_PASSWORD),
                is_superuser=False,
                is_active=True,
                is_verified=True,
                role_id=recruiter_role.id,
                company_id=company.id,
            )
            db.add(recruiter_user)
            print("✅ Sample recruiter created")
            print(f"   Email: recruiter@hiremind-demo.io | Password: {DEFAULT_PASSWORD}")
        else:
            recruiter_user.role_id = recruiter_role.id
            recruiter_user.is_active = True
            recruiter_user.password_hash = hash_password(DEFAULT_PASSWORD)
            print("⏭  Sample recruiter updated")

        # ── Step 7: Sample Hiring Manager user ─────────────────────────
        print("\n📋 Step 7: Creating Sample Hiring Manager...")
        hm_user = (
            await db.execute(select(User).where(User.email == "hiringmanager@hiremind-demo.io"))
        ).scalar_one_or_none()

        if not hm_user:
            hm_user = User(
                username="hiringmanager@hiremind-demo.io",
                email="hiringmanager@hiremind-demo.io",
                first_name="Hana",
                last_name="Manager",
                full_name="Hana Manager",
                password_hash=hash_password(DEFAULT_PASSWORD),
                is_superuser=False,
                is_active=True,
                is_verified=True,
                role_id=hm_role.id,
                company_id=company.id,
            )
            db.add(hm_user)
            print("✅ Sample hiring manager created")
            print(f"   Email: hiringmanager@hiremind-demo.io | Password: {DEFAULT_PASSWORD}")
        else:
            hm_user.role_id = hm_role.id
            hm_user.is_active = True
            hm_user.password_hash = hash_password(DEFAULT_PASSWORD)
            print("⏭  Sample hiring manager updated")

        await db.commit()

    print("\n" + "=" * 60)
    print("✅ Database Population Completed Successfully!")
    print("=" * 60)
    print("\n📋 Login credentials (LOCAL DEV ONLY — change before production):")
    print(f"   • admin@hiremind-demo.io          / {DEFAULT_PASSWORD}   (superuser, all permissions)")
    print(f"   • recruiter@hiremind-demo.io       / {DEFAULT_PASSWORD}   (recruiter role)")
    print(f"   • hiringmanager@hiremind-demo.io   / {DEFAULT_PASSWORD}   (hiring_manager role)")
    print("\n   Docs: http://localhost:8000/docs")


if __name__ == "__main__":
    asyncio.run(populate())
