from fastapi import APIRouter, WebSocket
import asyncio
from app.services.ws.tick_broadcaster import tick_clients

router = APIRouter(tags=["WebSockets"])

@router.websocket("/ws/ticks")
async def websocket_ticks_multi(websocket: WebSocket, symbols: str = ""):
    await websocket.accept()

    if not symbols.strip():
        await websocket.close()
        return

    subs = {s.strip().upper() for s in symbols.split(",")}
    tick_clients[websocket] = subs

    try:
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30)
            except asyncio.TimeoutError:
                pass
    except:
        pass
    finally:
        tick_clients.pop(websocket, None)
        await websocket.close()

@router.websocket("/ws/ticks/{symbol}")
async def websocket_ticks_symbol(websocket: WebSocket, symbol: str):
    await websocket.accept()

    subs = {symbol.upper()}
    tick_clients[websocket] = subs

    try:
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30)
            except asyncio.TimeoutError:
                pass
    except:
        pass
    finally:
        tick_clients.pop(websocket, None)
        await websocket.close()
