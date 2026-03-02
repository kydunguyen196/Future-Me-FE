# Future Me FE

Frontend của dự án Future Me, xây dựng bằng React + TypeScript + Vite.

## 1. Yêu cầu môi trường

- Node.js `>= 20`
- npm `>= 10`
- Git

Kiểm tra nhanh:

```bash
node -v
npm -v
git --version
```

## 2. Clone source từ Git

```bash
git clone <YOUR_REPO_URL>
cd future-me-fe
```

## 3. Cài đặt dependencies

```bash
npm install
```

## 4. Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc project và cấu hình các biến sau:

```env
VITE_IS_PRODUCTION=
VITE_BACKEND_API=
VITE_ASSETS_URL=
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_REDIRECT_URI=
VITE_BASE_URL=
VITE_DEFAULT_IMAGE_URL=
VITE_FACEBOOK_APP_ID=
```

## 5. Chạy project local

```bash
npm run dev
```

Mặc định Vite chạy tại: `http://localhost:5173`

## 6. Build production

```bash
npm run build
```

## 7. Chạy bản build local (preview)

```bash
npm run preview
```

## 8. Scripts có sẵn

- `npm run dev`: chạy môi trường development
- `npm run build`: type-check + build production
- `npm run lint`: chạy ESLint
- `npm run preview`: chạy preview bản build

## 9. Quy trình Git cơ bản

```bash
git checkout -b feature/<ten-nhanh>
git add .
git commit -m "feat: <noi-dung-thay-doi>"
git push origin feature/<ten-nhanh>
```

## 10. Trạng thái kiểm tra hiện tại

- `npm run build`: pass
- `npm run lint`: chưa pass toàn bộ, hiện còn nhiều lỗi lint cũ trong codebase
