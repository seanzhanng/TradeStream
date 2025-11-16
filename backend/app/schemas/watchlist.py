from pydantic import BaseModel

class WatchlistUpdate(BaseModel):
    symbols: list[str]

class WatchlistResponse(BaseModel):
    symbols: list[str]
