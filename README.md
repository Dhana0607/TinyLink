# 🔗 TinyLink — URL Shortener (Take-Home Assignment)

TinyLink is a simple, fast, and production-ready **URL shortener** built using **Next.js App Router**, **Prisma**, and **PostgreSQL (Neon)**.  
This project implements full CRUD for links, automatic + custom code generation, redirects, click tracking, and a clean dashboard UI built with **plain CSS** (no Tailwind required).

📄 **Assignment Spec:**  
`/mnt/data/Take-Home Assignment_ TinyLink (1) (2).pdf`

---

## 🚀 Features

- Shorten any long URL  
- Optional **custom short code**  
- Auto-generate randomized short codes (6–8 characters)  
- Track:
  - Total clicks  
  - Last clicked timestamp  
  - Created date  
- Redirect handler: `/abc123` → target URL  
- Duplicate code protection  
- REST API endpoints  
- Healthcheck endpoint  
- Clean dashboard UI with:
  - Create form  
  - Search  
  - Copy short URL  
  - Delete link  
  - View stats

---

## 🧰 Tech Stack

**Frontend & API**
- Next.js 16 (App Router)
- React 19
- Plain CSS 
- TypeScript

**Database**
- PostgreSQL 
- Prisma ORM

**Deployment**
- Vercel (recommended)

---

## ⚙️ API Endpoints

### **1. Health Check**

GET /healthz → 200 OK

### **2. Create a short link**

POST /api/links
Content-Type: application/json
{
"url": "https://example.com
",
"code": "abc123" // optional
}

Responses:
- `201 Created` → link created  
- `409 Conflict` → duplicate code  
- `400 Bad Request` → invalid URL/code  

---

### **3. List all links**

GET /api/links

Returns:
```json
[
  {
    "code": "abc123",
    "url": "https://example.com",
    "totalClicks": 3,
    "lastClicked": "2025-11-22T15:10:00.000Z",
    "createdAt": "2025-11-22T14:55:00.000Z"
  }
]

---

### **4. Get Stats for a short code**

GET /code/:code

---

### **5. Delete a short link**

DELETE /api/links/:code

---

## 🛠️ Local Setup

### **1️⃣ Clone repo**
git clone https://github.com/YOUR_USERNAME/tinylink.git
cd tinylink

---

### **2️⃣ Install dependencies**
npm install

---

### **3️⃣ Create .env**
DATABASE_URL=postgresql://<your-neon-db-url>

---

### **4️⃣ Run Prisma setup**
npx prisma generate
npx prisma migrate dev --name init

---

### **5️⃣ Start development**
npm run dev

App runs at:
http://localhost:3000
---
