"""
scripts/seed_roles.py
────────────────────────
Creates the default roles (ADMIN, RECRUITER, HIRING_MANAGER) and a
starter permission set. Run once after migrations:

    python -m scripts.seed_roles

Idempotent — safe to run multiple times.
"""

import asyncio

from app.db.database import AsyncSessionLocal
from app.models.user import Role, Permission
from sqlalchemy import select

DEFAULT_PERMISSIONS = [
    ("Create Job", "jobs.create", "jobs"),
    ("View Jobs", "jobs.view", "jobs"),
    ("Update Job", "jobs.update", "jobs"),
    ("Delete Job", "jobs.delete", "jobs"),
    ("Upload Resumes", "resumes.upload", "resumes"),
    ("View Candidates", "candidates.view", "candidates"),
    ("Screen Candidates", "candidates.screen", "candidates"),
    ("Manage Interviews", "interviews.manage", "interviews"),
]

DEFAULT_ROLES = {
    "admin": "Full platform access.",
    "recruiter": "Creates jobs, uploads resumes, screens candidates.",
    "hiring_manager": "Reviews shortlisted candidates and interview results.",
}


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        # Permissions
        code_to_permission: dict[str, Permission] = {}
        for name, code_name, module in DEFAULT_PERMISSIONS:
            existing = (
                await db.execute(select(Permission).where(Permission.code_name == code_name))
            ).scalar_one_or_none()
            if not existing:
                existing = Permission(name=name, code_name=code_name, module_name=module)
                db.add(existing)
                await db.flush()
            code_to_permission[code_name] = existing

        # Roles
        for code_name, description in DEFAULT_ROLES.items():
            role = (
                await db.execute(select(Role).where(Role.code_name == code_name))
            ).scalar_one_or_none()
            if not role:
                role = Role(name=code_name.replace("_", " ").title(), code_name=code_name, description=description)
                db.add(role)
                await db.flush()

            if code_name == "admin":
                role.permissions = list(code_to_permission.values())
            elif code_name == "recruiter":
                role.permissions = [
                    code_to_permission[c]
                    for c in ("jobs.create", "jobs.view", "jobs.update", "resumes.upload",
                              "candidates.view", "candidates.screen", "interviews.manage")
                ]
            elif code_name == "hiring_manager":
                role.permissions = [code_to_permission[c] for c in ("jobs.view", "candidates.view")]

        await db.commit()
        print("Seed complete: roles and permissions created/updated.")


if __name__ == "__main__":
    asyncio.run(seed())
