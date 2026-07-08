# Epson LQ-615KII Printing

Delights Inventory is hosted as a static GitHub Pages site. A browser page can open the print dialog, but it cannot silently print to an Epson dot matrix printer by itself. This is a browser security rule, not an app bug.

To perform auto printing, run the included local print bridge on the Windows computer connected to the Epson LQ-615KII.

## Browser Mode

Use this when you do not want to install anything locally.

1. Open `設定`.
2. Under `Epson LQ-615KII 針機`, set `打印模式` to `Browser print dialog`.
3. In `送貨單`, click `Epson 針機`.
4. Choose the Epson LQ-615KII printer in the print dialog.
5. Set paper to continuous paper and margins to minimum.

This mode cannot auto print silently.

## Auto Print Mode

Use this when the shop PC should print delivery notes automatically.

1. Install Node.js on the Windows PC connected to the printer.
2. Check the exact Windows printer name in `Settings > Bluetooth & devices > Printers & scanners`.
3. Open PowerShell in this project folder.
4. Start the bridge:

```powershell
node .\tools\print-bridge\server.js "EPSON LQ-615KII"
```

5. Keep that PowerShell window running.
6. In Delights Inventory `設定`, set:
   - `打印模式`: `Local bridge 自動打印`
   - `Windows 打印機名稱`: the exact printer name
   - `Local bridge URL`: `http://127.0.0.1:8787/print`
   - Enable `儲存訂單後自動打印送貨單` if you want order-save auto printing.

## Important Notes

- Auto print only works on the same Windows PC that is running the bridge, because the URL uses `127.0.0.1`.
- If another computer uses the GitHub Pages site, that computer also needs its own print bridge if it should auto print.
- If the bridge is not running, the app falls back to the browser print dialog.
- Chinese printing quality depends on the installed Epson/Windows printer driver and selected font. If Chinese characters print incorrectly, install the Epson LQ-615KII driver and test printing a plain text file from Notepad first.
- For continuous paper, set the Epson driver paper size and margin before using auto print.

## Test the Bridge

With the bridge running:

```powershell
$body = @{
  printerName = "EPSON LQ-615KII"
  copies = 1
  text = "Delights test print`nEpson LQ-615KII`n"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8787/print" -ContentType "application/json" -Body $body
```

If this works, the web app can auto print through the same bridge.
