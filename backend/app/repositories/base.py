from typing import Any, Generic, Sequence, TypeVar

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base_class import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel | object)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel | object)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, obj_id: Any) -> ModelType | None:
        result = await db.execute(select(self.model).where(self.model.id == obj_id))
        return result.scalar_one_or_none()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> Sequence[ModelType]:
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: BaseModel | dict[str, Any] | object) -> ModelType:
        if isinstance(obj_in, dict):
            payload = obj_in
        elif isinstance(obj_in, BaseModel):
            payload = obj_in.model_dump()
        else:
            payload = jsonable_encoder(obj_in)
        db_obj = self.model(**payload)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, *, db_obj: ModelType, obj_in: BaseModel | dict[str, Any] | object) -> ModelType:
        if isinstance(obj_in, dict):
            payload = obj_in
        elif isinstance(obj_in, BaseModel):
            payload = obj_in.model_dump(exclude_unset=True)
        else:
            payload = jsonable_encoder(obj_in)
        for field, value in payload.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, *, obj_id: Any) -> ModelType | None:
        obj = await self.get(db, obj_id)
        if obj is None:
            return None
        await db.delete(obj)
        await db.commit()
        return obj
