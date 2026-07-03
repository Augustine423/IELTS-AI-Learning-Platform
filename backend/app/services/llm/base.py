from abc import ABC, abstractmethod
from typing import AsyncIterator


class BaseLLM(ABC):
    @abstractmethod
    async def generate(self, messages: list[dict], system_prompt: str = "") -> str:
        pass

    @abstractmethod
    async def stream(self, messages: list[dict], system_prompt: str = "") -> AsyncIterator[str]:
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        pass
