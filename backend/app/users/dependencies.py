from app.users.service import UserService


user_service = UserService()


def get_user_service() -> UserService:
    return user_service
