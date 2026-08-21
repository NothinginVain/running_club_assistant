"""add auth: username, password_reset_tokens, survey soft delete

Revision ID: 6ec9df49298d
Revises: fefbbd64d6a4
Create Date: 2026-08-21 10:48:15.992226

"""
import re
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from app.core.security import hash_password

# revision identifiers, used by Alembic.
revision: str = '6ec9df49298d'
down_revision: Union[str, Sequence[str], None] = 'fefbbd64d6a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

LEGACY_PASSWORD_PREFIX = "fakehashed_"


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "", value.lower())
    return slug or "runner"


def _backfill_usernames(connection) -> None:
    rows = connection.execute(sa.text("SELECT id, email, full_name FROM users")).fetchall()
    taken: set[str] = set()

    for row in rows:
        base = _slugify(row.email.split("@")[0]) or _slugify(row.full_name)
        candidate = base
        suffix = 1

        while candidate in taken:
            suffix += 1
            candidate = f"{base}{suffix}"

        taken.add(candidate)
        connection.execute(
            sa.text("UPDATE users SET username = :username WHERE id = :id"),
            {"username": candidate, "id": row.id},
        )


def _rehash_legacy_passwords(connection) -> None:
    rows = connection.execute(
        sa.text("SELECT id, password_hash FROM users")
    ).fetchall()

    for row in rows:
        if not row.password_hash.startswith(LEGACY_PASSWORD_PREFIX):
            continue

        original_password = row.password_hash[len(LEGACY_PASSWORD_PREFIX):]
        new_hash = hash_password(original_password)
        connection.execute(
            sa.text("UPDATE users SET password_hash = :password_hash WHERE id = :id"),
            {"password_hash": new_hash, "id": row.id},
        )


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'password_reset_tokens',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('token_hash', sa.String(length=64), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_password_reset_tokens_token_hash'), 'password_reset_tokens', ['token_hash'], unique=True)
    op.create_index(op.f('ix_password_reset_tokens_user_id'), 'password_reset_tokens', ['user_id'], unique=False)

    op.add_column('surveys', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))

    # username is added nullable first so existing rows can be backfilled,
    # then tightened to NOT NULL + unique once every row has a value.
    op.add_column('users', sa.Column('username', sa.String(length=50), nullable=True))

    connection = op.get_bind()
    _backfill_usernames(connection)
    _rehash_legacy_passwords(connection)

    op.alter_column('users', 'username', nullable=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_column('users', 'username')
    op.drop_column('surveys', 'deleted_at')
    op.drop_index(op.f('ix_password_reset_tokens_user_id'), table_name='password_reset_tokens')
    op.drop_index(op.f('ix_password_reset_tokens_token_hash'), table_name='password_reset_tokens')
    op.drop_table('password_reset_tokens')
