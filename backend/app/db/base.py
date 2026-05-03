from app.db.base_class import Base

# Import all models so Alembic can discover metadata.
from app.auth.models import PasswordResetToken
from app.study.models import DayResult, Stats, StudyPlan, TestQuestion, Word
from app.users.models import User
from app.ielts.models import IELTSWord, IELTSWritingTask, IELTSWritingAttempt, IELTSMockTest, IELTSMockTestSection, IELTSMockTestQuestion, IELTSMockTestAttempt, IELTSStats
