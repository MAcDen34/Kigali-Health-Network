from fastapi import Header
from uuid import UUID

def get_current_actor(x_actor_id: UUID = Header(...)) -> UUID:
    """
    Dependency to extract the current actor's ID from the request headers.
    """
    return x_actor_id
