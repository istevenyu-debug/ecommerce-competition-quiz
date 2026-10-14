# 電商比賽刷題 APP

使用 GitHub Pages + Firebase Authentication + Cloud Firestore。學生登入後可練習國貿大會考、電子商務與跨境電商、兩者綜合三種題庫；每次 30 題，優先抽尚未練習題，並提供錯題練習與全體成績。管理者可在 APP 管理題庫頁匯入 JSON。

## Firebase 初次設定

1. Firebase Authentication 啟用「電子郵件/密碼」。
2. Firestore 建立資料庫，將 `firestore.rules` 發布。
3. 在 Authentication 建立會員後，以每個 Firebase Auth 使用者 UID 為文件 ID，在 `members` 建立文件：`{code: "15", role: "member", enabled: true}`。另三位會員代碼按實際設定；管理者資料為 `{code: "管理者", role: "admin", enabled: true}`。額外測試會員可使用 `Steven` 代碼。此集合文件只能由專案擁有者在 Firebase Console 管理。
4. 將 Firebase Web app config 填入 `firebase-config.js`。Firebase Web API key 是前端識別設定，請勿放入 Admin SDK 私鑰。
5. Authentication → 設定 → 授權網域，加入本 GitHub Pages 網域。

## GitHub Pages

在 Repository Settings → Pages，將 Build and deployment source 設為 GitHub Actions。推送到 `main` 後由 `.github/workflows/pages.yml` 自動部署。

## 題庫與資料

`questions.json` 有 492 題（國貿 392、電商 100），`contexts.json` 提供需要附表題的原始案例頁節錄。各題答案和題幹來自提供的題庫檔案，仍建議教師校對，原題未附逐題解析；APP 顯示答案及選項供檢討。公開 GitHub Pages 的題目與答案可被網站訪客檢視，不適合機密測驗。
