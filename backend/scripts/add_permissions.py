"""
scripts/add_permissions.py
──────────────────────────────
Seeds all Permission records for HireMind AI.

Run BEFORE seed_roles.py:
    python -m scripts.add_permissions
    python -m scripts.seed_roles
"""
import asyncio
import sys
import os

# Windows fix
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


PERMISSIONS = [
    # Jobs
    {'name': 'Create Job',            'code_name': 'can_create_job',            'module_name': 'jobs',       'module_label': 'Job Management',       'description': 'Create a new job and run the Job Analysis Agent'},
    {'name': 'View Jobs',             'code_name': 'can_view_jobs',             'module_name': 'jobs',       'module_label': 'Job Management',       'description': 'View job listings and requirements'},
    {'name': 'Update Job',            'code_name': 'can_update_job',            'module_name': 'jobs',       'module_label': 'Job Management',       'description': 'Edit an existing job'},
    {'name': 'Delete Job',            'code_name': 'can_delete_job',            'module_name': 'jobs',       'module_label': 'Job Management',       'description': 'Delete/archive a job'},
    {'name': 'Screen Candidates',     'code_name': 'can_screen_candidates',     'module_name': 'jobs',       'module_label': 'Job Management',       'description': 'Run the matching workflow against uploaded candidates'},

    # Resumes
    {'name': 'Upload Resume',         'code_name': 'can_upload_resume',         'module_name': 'resumes',    'module_label': 'Resume Management',    'description': 'Upload resumes for processing'},
    {'name': 'View Resume Status',    'code_name': 'can_view_resume_status',    'module_name': 'resumes',    'module_label': 'Resume Management',    'description': 'Check processing status of an uploaded resume'},

    # Candidates
    {'name': 'View Candidates',       'code_name': 'can_view_candidates',       'module_name': 'candidates', 'module_label': 'Candidate Management',  'description': 'View candidate profiles and ranked lists'},
    {'name': 'View Candidate Score',  'code_name': 'can_view_candidate_score',  'module_name': 'candidates', 'module_label': 'Candidate Management',  'description': 'View the explainable score breakdown for a candidate'},
    {'name': 'Compare Candidates',    'code_name': 'can_compare_candidates',    'module_name': 'candidates', 'module_label': 'Candidate Management',  'description': 'Compare multiple candidates side by side'},

    # Search
    {'name': 'Search Candidates',     'code_name': 'can_search_candidates',     'module_name': 'search',     'module_label': 'Search & AI',           'description': 'Run semantic natural-language candidate search'},

    # Interviews
    {'name': 'Create Interview',      'code_name': 'can_create_interview',      'module_name': 'interviews', 'module_label': 'Interview Management',  'description': 'Create an interview and generate questions'},
    {'name': 'Submit Interview Answers', 'code_name': 'can_submit_interview_answers', 'module_name': 'interviews', 'module_label': 'Interview Management', 'description': 'Submit candidate answers for an interview'},
    {'name': 'Evaluate Interview',    'code_name': 'can_evaluate_interview',    'module_name': 'interviews', 'module_label': 'Interview Management',  'description': 'Run the Evaluation Agent and view the technical assessment'},

    # Users
    {'name': 'View Users',            'code_name': 'can_view_users',            'module_name': 'users',      'module_label': 'User Management',       'description': 'View the recruiter/user list'},
    {'name': 'Block Users',           'code_name': 'can_block_users',           'module_name': 'users',      'module_label': 'User Management',       'description': 'Block or unblock a user'},

    # Roles
    {'name': 'View Roles',            'code_name': 'can_view_roles',            'module_name': 'roles',      'module_label': 'Role Management',       'description': 'View roles and their permissions'},
    {'name': 'Create Role',           'code_name': 'can_create_role',           'module_name': 'roles',      'module_label': 'Role Management',       'description': 'Create a new role'},
    {'name': 'Update Role',           'code_name': 'can_update_role',           'module_name': 'roles',      'module_label': 'Role Management',       'description': 'Edit a role\'s name/description/permissions'},
    {'name': 'Delete Role',           'code_name': 'can_delete_role',           'module_name': 'roles',      'module_label': 'Role Management',       'description': 'Delete a role'},

    # Companies
    {'name': 'View Companies',        'code_name': 'can_view_companies',        'module_name': 'companies',  'module_label': 'Company Management',    'description': 'View companies (tenants)'},
    {'name': 'Manage Companies',      'code_name': 'can_manage_companies',      'module_name': 'companies',  'module_label': 'Company Management',    'description': 'Create, update, or delete companies'},

    # Evaluation / Reporting
    {'name': 'Run Evaluation Report', 'code_name': 'can_run_evaluation',        'module_name': 'evaluation', 'module_label': 'Evaluation & Reporting', 'description': 'Run the offline agent-quality evaluation report'},
]


async def add_permissions():
    from app.db.database import AsyncSessionLocal
    from app.models.user import Permission
    from sqlalchemy import select

    print('🔑 Adding permissions...\n')
    async with AsyncSessionLocal() as db:
        added = 0
        for perm_data in PERMISSIONS:
            existing = await db.execute(
                select(Permission).where(Permission.code_name == perm_data['code_name'])
            )
            if existing.scalar_one_or_none():
                print(f'  ⏭  Exists: {perm_data["code_name"]}')
                continue
            db.add(Permission(**perm_data))
            added += 1
            print(f'  ✅ Added: {perm_data["code_name"]}')
        await db.commit()
    print(f'\n✅ Done — {added} permissions added.')


if __name__ == '__main__':
    print('Adding permissions to database...\n')
    asyncio.run(add_permissions())
