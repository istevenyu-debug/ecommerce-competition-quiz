# 電商比賽刷題 APP（免會員版）

學生網址（須先完成 GitHub Pages Actions 部署）：
https://istevenyu-debug.github.io/ecommerce-competition-quiz/

## 題庫資料（已更新）

- 國貿大會考 `400` 題；電子商務與跨境電商 `100` 題；合計 `500` 題。
- `questions.json`：保留既有 ID、題目、四選項、標準答案，補齊漏掉的 8 題，修正第十一章英文被歸在價格計算的標籤。
- `chapter-groups.json`：14 章、22 個固定章節題組；**每回最多 30 題，不足 30 題照實際題數，同一回不重複**。
- 原始國貿第一章經貿資訊不在 PDF 歷屆題庫彙編的 400 題之內，故題組從第二章開始。
- 信用狀單證案例題共 50 題、五個案例；第 1 回案例 1–3 合計 30 題，第 2 回案例 4–5 合計 20 題，`referencePages` 標記原始 PDF 附表頁面。**案例附件尚未直接嵌入網站**，應搭配原始 PDF 使用。

## 目前網站與題庫的關係

本次只更新題庫及題組定義，**尚未修改 `index.html` 或 `app.js` 的畫面及出題邏輯**。因此現行網站仍是三種模式的 30 題隨機／未刷優先練習，尚未呈現章節選擇介面與 20／15／10／5 題的章節分卷。需另行修改 APP 才會套用 `chapter-groups.json`。

學生免註冊、免 Firebase，最近 10 次正式成績、錯題、覆蓋率、未完成卷等儲存在各自瀏覽器 localStorage。清除網站資料或換裝置時不會同步。題目及答案公開於 GitHub Pages，僅用於教學練習。

## 部署

GitHub Repository → Settings → Pages → Source 選 **GitHub Actions**。
專案 `.github/workflows/pages.yml` 在 main 分支更新時部署首頁、APP 及題庫。
目前部署流程僅發布 `questions.json`；題組選單程式接入時須同時將 `chapter-groups.json` 加入部署目錄。
