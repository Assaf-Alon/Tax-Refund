# Network Access for Development

This document outlines the verified setup for accessing the Tax-Refund dev server from other devices on the network when using **WSL2 with `networkingMode=mirrored`**.

## Summary of Resolution
Due to limitations in WSL2's mirroring driver and interference from host-side security software (e.g., Malwarebytes), standard port mirroring can fail. We resolve this by using an **Offset Port Proxy** to bridge traffic from the physical network to the WSL internal listener.

---

## 1. WSL Configuration (Linux)

### Vite Setup
Vite is configured to listen on a high port (10000) to avoid collisions with Windows system services.

**File**: `vite.config.ts`
```typescript
server: {
  host: true,
  port: 10000,
  strictPort: true
}
```

### Running the Server
```bash
npm run dev
```

---

## 2. Windows Configuration (Host)

These commands must be run in **PowerShell as Administrator**. They are persistent and only need to be run once (unless your physical IP changes).

### A. Add Firewall Rule
Allows incoming traffic to reach the proxy port.
```powershell
New-NetFirewallRule -DisplayName "Vite External Access (9999)" -Direction Inbound -LocalPort 9999 -Protocol TCP -Action Allow -Profile Any
```

### B. Add Port Proxy
Bridges the physical IP to the working WSL loopback.
```powershell
# Replace 192.168.1.241 with your current IP if it changes
netsh interface portproxy add v4tov4 listenport=9999 listenaddress=192.168.1.241 connectport=10000 connectaddress=127.0.0.1
```

---

## 3. Verification

1.  **Start Vite** in your Linux terminal.
2.  **Test Access** from any device on your Wi-Fi:
    `http://192.168.1.241:9999/Tax-Refund/`

## Troubleshooting

-   **Check Proxies**: `netsh interface portproxy show all`
-   **Reset Proxies**: `netsh interface portproxy reset` (Use if you have stale rules)
-   **Check Listeners**: `netstat -ano | findstr :9999` (Should show `LISTENING`)
-   **Restart IP Helper Service**: If `netstat` shows nothing but the proxy is configured, the Windows IP Helper service might be stuck. Run `Restart-Service iphlpsvc` in an Administrator PowerShell.
-   **Generalize Proxy**: If binding to your specific IP fails, try changing the `listenaddress` in Step 2B to `0.0.0.0`.
-   **IP Changed?**: If your computer's IP changes, delete the old proxy and run the command in Step 2B with the new IP.
