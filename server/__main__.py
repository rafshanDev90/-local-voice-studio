import os
import sys

import uvicorn

if __name__ == "__main__":
    reload_enabled = os.environ.get("UVICORN_RELOAD", "0") == "1"
    uvicorn.run(
        "server.app:app",
        host="0.0.0.0",
        port=8000,
        reload=reload_enabled,
        log_level="info",
    )
