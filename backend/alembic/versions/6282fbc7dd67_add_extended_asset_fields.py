"""Add extended asset fields

Revision ID: 6282fbc7dd67
Revises:
Create Date: 2025-08-06 15:11:12.745791

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6282fbc7dd67"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new columns to assets table
    op.add_column(
        "assets", sa.Column("status", sa.String(), nullable=True, default="active")
    )
    op.add_column("assets", sa.Column("health_score", sa.Float(), nullable=True))
    op.add_column(
        "assets", sa.Column("issues_count", sa.Integer(), nullable=True, default=0)
    )
    op.add_column("assets", sa.Column("labels", sa.JSON(), nullable=True))
    op.add_column(
        "assets",
        sa.Column("agent_status", sa.String(), nullable=True, default="not_installed"),
    )

    # OS details
    op.add_column("assets", sa.Column("os_version", sa.String(), nullable=True))
    op.add_column("assets", sa.Column("os_architecture", sa.String(), nullable=True))
    op.add_column("assets", sa.Column("os_build_number", sa.String(), nullable=True))
    op.add_column("assets", sa.Column("os_last_boot_time", sa.String(), nullable=True))

    # Priority scores
    op.add_column(
        "assets", sa.Column("confidentiality", sa.Integer(), nullable=True, default=1)
    )
    op.add_column(
        "assets", sa.Column("integrity", sa.Integer(), nullable=True, default=1)
    )
    op.add_column(
        "assets", sa.Column("availability", sa.Integer(), nullable=True, default=1)
    )

    # Additional fields
    op.add_column("assets", sa.Column("department", sa.String(), nullable=True))
    op.add_column("assets", sa.Column("location", sa.String(), nullable=True))
    op.add_column("assets", sa.Column("owner", sa.String(), nullable=True))

    # Timestamps
    op.add_column("assets", sa.Column("updated_at", sa.DateTime(), nullable=True))
    op.add_column("assets", sa.Column("last_scan", sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove added columns
    op.drop_column("assets", "last_scan")
    op.drop_column("assets", "updated_at")
    op.drop_column("assets", "owner")
    op.drop_column("assets", "location")
    op.drop_column("assets", "department")
    op.drop_column("assets", "availability")
    op.drop_column("assets", "integrity")
    op.drop_column("assets", "confidentiality")
    op.drop_column("assets", "os_last_boot_time")
    op.drop_column("assets", "os_build_number")
    op.drop_column("assets", "os_architecture")
    op.drop_column("assets", "os_version")
    op.drop_column("assets", "agent_status")
    op.drop_column("assets", "labels")
    op.drop_column("assets", "issues_count")
    op.drop_column("assets", "health_score")
    op.drop_column("assets", "status")
