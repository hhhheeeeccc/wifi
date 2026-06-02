# WiFi Hotspot Pro Development Notes

## Security Environment
The application is designed to run in environments with **SentinelOne** installed. To avoid detection or blocking:
- Use legitimate Windows APIs (WinRT TetheringManager).
- Avoid exploit-like behavior or manual registry manipulation for ICS (Internet Connection Sharing) where possible.
- The `enableICS` function uses the standard COM object `HNetCfg.HNetShare`.

## Verification Commands
After code changes, ensure the following tools are consistent:
1. `main.js`: Core logic for Hotspot and Firewall.
2. `renderer.js`: UI interaction and IPC calls.
3. `preload.js`: Exposed API methods.

## Testing
Since this environment is Linux-based, Windows-specific commands (`netsh`, `powershell`) will fail during execution. Verification should be done via code inspection and syntax checks.
