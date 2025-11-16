from fastapi import APIRouter, WebSocket
import asyncio
from app.services.ws.vwap_broadcaster import connected_clients

router = APIRouter(tags=["WebSockets"])

@router.websocket("/ws/vwap")
async def websocket_vwap_multi(websocket: WebSocket, symbols: str = ""):
    await websocket.accept()

    if not symbols.strip():
        await websocket.close()
        return

    subs = {s.strip().upper() for s in symbols.split(",")}
    connected_clients[websocket] = subs

    try:
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30)
            except asyncio.TimeoutError:
                pass
    except:
        pass
    finally:
        connected_clients.pop(websocket, None)
        await websocket.close()

@router.websocket("/ws/vwap/{symbol}")
async def websocket_vwap_symbol(websocket: WebSocket, symbol: str):
    await websocket.accept()

    subs = {symbol.upper()}
    connected_clients[websocket] = subs

    try:
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30)
            except asyncio.TimeoutError:
                pass
    except:
        pass
    finally:
        connected_clients.pop(websocket, None)
        await websocket.close()