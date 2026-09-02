# 🎨 ChatGPT Image CLI

CLI độc lập tạo ảnh chất lượng cao từ **ChatGPT Web (ChatGPT Images 2.0 / GPT Image)** bằng tự động hóa trình duyệt qua Playwright. Không qua Codex, không tốn phí API OpenAI.

---

## ⚡ Tính năng nổi bật

1. **Zero-login (nếu đã mở Launcher):** Tự động kết nối qua CDP vào phiên đăng nhập của Launcher `Codex Web GPT` (nếu đang chạy).
2. **Persistent Session (Chrome độc lập):** Nếu không dùng Launcher, tự mở Chrome thật và lưu session riêng vĩnh viễn tại `~/.chatgpt-image-cli/profile`. Đăng nhập 1 lần duy nhất.
3. **Chống lỗi 403 Forbidden:** Tải ảnh bằng hàm `fetch()` trực tiếp trong browser context, xuất ra file `.png` độ phân giải gốc.
4. **Hỗ trợ đầy đủ Bun & Node.js:** Chạy mượt mà trên Windows/macOS/Linux.

---

## 🚀 Cài đặt & Chuẩn bị

Mở terminal trong thư mục `C:\Users\ADMIN\Desktop\chatgpt-image-cli`:

```bash
# Cài đặt dependencies (chỉ mất vài giây)
bun install
# hoặc: npm install
```

---

## 📖 Hướng dẫn sử dụng

### 1. Kiểm tra kết nối & đăng nhập
```bash
bun test:connection
```
Nếu báo chưa đăng nhập, chạy lệnh sau để mở trình duyệt đăng nhập:
```bash
bun login
```

### 2. Tạo ảnh
```bash
# Tạo ảnh đơn giản (tự lưu vào ./output/)
bun run src/cli.ts "Vẽ một chú mèo phi hành gia phong cách cyberpunk, tỉ lệ 16:9"

# Đặt đường dẫn file lưu cụ thể
bun run src/cli.ts "Vẽ logo quả táo kim loại phong cách tối giản" -o ./apple_logo.png

# Chạy ngầm (headless)
bun run src/cli.ts "A futuristic city in clouds" --headless
```

---

## 🛠️ Tuỳ chọn lệnh (CLI Flags)

| Flag | Ý nghĩa |
| :--- | :--- |
| `-o, --out <path>` | Đường dẫn file `.png` đầu ra. |
| `--headless` | Chạy ẩn trình duyệt (không hiện cửa sổ). |
| `--headed` | Hiện cửa sổ trình duyệt để theo dõi (mặc định). |
| `--chrome` | Ép dùng Chrome riêng thay vì gắn vào Launcher Codex. |
| `--login` | Mở trình duyệt để bạn đăng nhập ChatGPT. |
