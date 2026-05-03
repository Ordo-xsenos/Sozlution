from app.study.service import StudyService


study_service = StudyService()


def get_study_service() -> StudyService:
    return study_service
