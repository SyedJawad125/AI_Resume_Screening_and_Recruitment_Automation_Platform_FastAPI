# """
# add_permissions.py
# ───────────────────
# Seeds all Permission records into the database.
# Run ONCE after init_db.py.

# Usage:
#     python add_permissions.py
# """
# import asyncio
# import sys
# import os

# sys.path.insert(0, os.path.dirname(__file__))


# PERMISSIONS = [
#     # ── Documents ─────────────────────────────────────────────────
#     {'name': 'Upload Document',   'code_name': 'can_upload_document',   'module_name': 'documents', 'module_label': 'Documents',    'description': 'Upload PDF documents'},
#     {'name': 'View Documents',    'code_name': 'can_view_documents',    'module_name': 'documents', 'module_label': 'Documents',    'description': 'View own documents'},
#     {'name': 'Delete Document',   'code_name': 'can_delete_document',   'module_name': 'documents', 'module_label': 'Documents',    'description': 'Delete own documents'},
#     {'name': 'View All Documents','code_name': 'can_view_all_documents','module_name': 'documents', 'module_label': 'Documents',    'description': 'View all users documents (admin)'},

#     # ── Search / Chat ──────────────────────────────────────────────
#     {'name': 'Search Documents',  'code_name': 'can_search',            'module_name': 'search',    'module_label': 'Search & Chat','description': 'Search document content'},
#     {'name': 'Chat with Document','code_name': 'can_chat',              'module_name': 'chat',      'module_label': 'Search & Chat','description': 'Ask AI questions about documents'},
#     {'name': 'Extract Fields',    'code_name': 'can_extract',           'module_name': 'extraction','module_label': 'Search & Chat','description': 'Extract structured data from documents'},
#     {'name': 'Generate Summary',  'code_name': 'can_summarize',         'module_name': 'summary',   'module_label': 'Search & Chat','description': 'Generate AI summaries'},
#     {'name': 'Download Report',   'code_name': 'can_download_report',   'module_name': 'reports',   'module_label': 'Search & Chat','description': 'Download PDF reports'},

#     # ── Users ─────────────────────────────────────────────────────
#     {'name': 'View Users',        'code_name': 'can_view_users',        'module_name': 'users',     'module_label': 'User Management','description': 'View user list'},
#     {'name': 'Block Users',       'code_name': 'can_block_users',       'module_name': 'users',     'module_label': 'User Management','description': 'Block or unblock users'},

#     # ── Roles ─────────────────────────────────────────────────────
#     {'name': 'View Roles',        'code_name': 'can_view_roles',        'module_name': 'roles',     'module_label': 'Role Management','description': 'View roles'},
#     {'name': 'Create Role',       'code_name': 'can_create_role',       'module_name': 'roles',     'module_label': 'Role Management','description': 'Create new roles'},
#     {'name': 'Update Role',       'code_name': 'can_update_role',       'module_name': 'roles',     'module_label': 'Role Management','description': 'Update role permissions'},
#     {'name': 'Delete Role',       'code_name': 'can_delete_role',       'module_name': 'roles',     'module_label': 'Role Management','description': 'Delete roles'},

#     # ── Companies ─────────────────────────────────────────────────
#     {'name': 'View Companies',    'code_name': 'can_view_companies',    'module_name': 'companies', 'module_label': 'Company Management','description': 'View companies'},
#     {'name': 'Manage Companies',  'code_name': 'can_manage_companies',  'module_name': 'companies', 'module_label': 'Company Management','description': 'Create/update/delete companies'},
# ]


# async def add_permissions():
#     from app.db.database import AsyncSessionLocal
#     from app.models.user import Permission
#     from sqlalchemy import select

#     async with AsyncSessionLocal() as db:
#         added = 0
#         for perm_data in PERMISSIONS:
#             existing = await db.execute(
#                 select(Permission).where(Permission.code_name == perm_data['code_name'])
#             )
#             if existing.scalar_one_or_none():
#                 print(f'  Exists: {perm_data["code_name"]}')
#                 continue

#             perm = Permission(**perm_data)
#             db.add(perm)
#             added += 1
#             print(f'  Added: {perm_data["code_name"]}')

#         await db.commit()
#         print(f'\nDone — {added} permissions added, {len(PERMISSIONS) - added} already existed.')


# if __name__ == '__main__':
#     print('Adding permissions to database...\n')
#     asyncio.run(add_permissions())






"""
add_permissions.py
───────────────────
Seeds all Permission records.
Fixed: added Windows asyncio fix.
"""
import asyncio
import sys
import os

# Windows fix
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

sys.path.insert(0, os.path.dirname(__file__))


PERMISSIONS = [
    # Documents
    {'name': 'Upload Document',    'code_name': 'can_upload_document',    'module_name': 'documents', 'module_label': 'Documents',          'description': 'Upload PDF documents'},
    {'name': 'View Documents',     'code_name': 'can_view_documents',     'module_name': 'documents', 'module_label': 'Documents',          'description': 'View own documents'},
    {'name': 'Delete Document',    'code_name': 'can_delete_document',    'module_name': 'documents', 'module_label': 'Documents',          'description': 'Delete own documents'},
    {'name': 'View All Documents', 'code_name': 'can_view_all_documents', 'module_name': 'documents', 'module_label': 'Documents',          'description': 'View all users documents'},
    # Search / Chat
    {'name': 'Search Documents',   'code_name': 'can_search',             'module_name': 'search',    'module_label': 'Search & Chat',      'description': 'Search document content'},
    {'name': 'Chat with Document', 'code_name': 'can_chat',               'module_name': 'chat',      'module_label': 'Search & Chat',      'description': 'Ask AI questions'},
    {'name': 'Extract Fields',     'code_name': 'can_extract',            'module_name': 'extraction','module_label': 'Search & Chat',      'description': 'Extract structured data'},
    {'name': 'Generate Summary',   'code_name': 'can_summarize',          'module_name': 'summary',   'module_label': 'Search & Chat',      'description': 'Generate AI summaries'},
    {'name': 'Download Report',    'code_name': 'can_download_report',    'module_name': 'reports',   'module_label': 'Search & Chat',      'description': 'Download PDF reports'},
    # Users
    {'name': 'View Users',         'code_name': 'can_view_users',         'module_name': 'users',     'module_label': 'User Management',    'description': 'View user list'},
    {'name': 'Block Users',        'code_name': 'can_block_users',        'module_name': 'users',     'module_label': 'User Management',    'description': 'Block/unblock users'},
    # Roles
    {'name': 'View Roles',         'code_name': 'can_view_roles',         'module_name': 'roles',     'module_label': 'Role Management',    'description': 'View roles'},
    {'name': 'Create Role',        'code_name': 'can_create_role',        'module_name': 'roles',     'module_label': 'Role Management',    'description': 'Create roles'},
    {'name': 'Update Role',        'code_name': 'can_update_role',        'module_name': 'roles',     'module_label': 'Role Management',    'description': 'Update roles'},
    {'name': 'Delete Role',        'code_name': 'can_delete_role',        'module_name': 'roles',     'module_label': 'Role Management',    'description': 'Delete roles'},
    # Companies
    {'name': 'View Companies',     'code_name': 'can_view_companies',     'module_name': 'companies', 'module_label': 'Company Management', 'description': 'View companies'},
    {'name': 'Manage Companies',   'code_name': 'can_manage_companies',   'module_name': 'companies', 'module_label': 'Company Management', 'description': 'Manage companies'},
]


async def add_permissions():
    from app.db.database import AsyncSessionLocal   # ✅ correct path
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