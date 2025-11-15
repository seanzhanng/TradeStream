from pydantic import BaseModel

class Response(BaseModel):
    message: str
    status_code: int
    is_success: bool = True