"""remove legacy feedback and coach memory fields

Revision ID: fefbbd64d6a4
Revises: da91ae59f236
Create Date: 2026-08-16 11:55:22.566316

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fefbbd64d6a4'
down_revision: Union[str, Sequence[str], None] = 'da91ae59f236'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove obsolete feedback and coach-memory fields."""
    op.execute(
        sa.text(
            """
            UPDATE coach_memory
            SET summary =
                summary - 'recommendations' - 'feedback'
            WHERE summary ? 'recommendations'
               OR summary ? 'feedback'
            """
        )
    )

    op.drop_column(
        "recommendations",
        "feedback_comment",
    )
    op.drop_column(
        "coach_memory",
        "source_recommendation_count",
    )
    op.drop_column(
        "coach_memory",
        "source_feedback_count",
    )


def downgrade() -> None:
    """Restore the legacy schema without deleted cache data."""
    op.add_column(
        "recommendations",
        sa.Column(
            "feedback_comment",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "coach_memory",
        sa.Column(
            "source_recommendation_count",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "coach_memory",
        sa.Column(
            "source_feedback_count",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )