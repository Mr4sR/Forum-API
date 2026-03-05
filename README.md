# Forum API

REST API untuk platform forum dengan arsitektur clean architecture dan domain-driven design. Aplikasi ini memungkinkan pengguna untuk membuat thread (diskusi), menambahkan komentar, menulis balasan, dan memberikan like pada konten dengan sistem autentikasi yang aman.

## 📋 Tech Stack

- **Runtime:** Node.js
- **Framework:** Hapi.js 20.1.5
- **Database:** PostgreSQL
- **Authentication:** JWT (@hapi/jwt)
- **Password Hashing:** Bcrypt
- **Testing:** Jest
- **Migration:** node-pg-migrate
- **Container:** instances-container (Dependency Injection)

## ✨ Fitur Utama

### User Management
- Registrasi dan login pengguna
- Password hashing dengan bcrypt
- JWT token management
- Token refresh mechanism
- Logout dengan token invalidation

### Thread (Diskusi)
- Membuat thread baru
- Mengambil detail thread dengan semua komentar dan balasan
- Menampilkan informasi owner thread

### Comment (Komentar)
- Menambahkan komentar pada thread
- Menghapus komentar (hanya owner)
- Nested comments dengan sistem balasan

### Reply (Balasan)
- Membalas komentar
- Menghapus balasan (hanya owner)
- Pelacakan balasan per komentar

### Like System
- Memberikan like pada komentar
- Memberikan like pada balasan
- Menghitung jumlah like per item
- Toggle like (like/unlike)

### Security & Error Handling
- Autentikasi berbasis JWT
- Otorisasi per resource
- Error handling dengan custom exception
- Input validation dan sanitasi

## 📁 Struktur Proyek

```
Forum API/
├── config/                          # Konfigurasi aplikasi
│   └── database/
│       └── test.json               # Konfigurasi database test
├── migrations/                      # Database migrations
│   ├── 1627983516963_create-table-users.js
│   ├── 1627983555473_create-table-authentications.js
│   ├── 1694859263665_create-threads-table.js
│   ├── 1694859275643_create-comments-table.js
│   ├── 1694859285710_create-replies-table.js
│   └── 1695459758171_create-likes-table.js
├── src/
│   ├── Applications/                # Business Logic Layer
│   │   ├── security/               # Security implementations
│   │   │   ├── AuthenticationTokenManager.js
│   │   │   ├── PasswordHash.js
│   │   │   └── _test/
│   │   └── use_case/               # Use cases / business rules
│   │       ├── AddCommentUseCase.js
│   │       ├── AddReplyUseCase.js
│   │       ├── AddThreadUseCase.js
│   │       ├── AddUserUseCase.js
│   │       ├── DeleteAuthenticationUseCase.js
│   │       ├── DeleteCommentUseCase.js
│   │       ├── DeleteReplyUseCase.js
│   │       ├── GetThreadUseCase.js
│   │       ├── LikeControlUseCase.js
│   │       ├── LoginUserUseCase.js
│   │       ├── LogoutUserUseCase.js
│   │       ├── RefreshAuthenticationUseCase.js
│   │       └── _test/
│   ├── Commons/                    # Common utilities
│   │   └── exceptions/
│   │       ├── AuthenticationError.js
│   │       ├── AuthorizationError.js
│   │       ├── ClientError.js
│   │       ├── DomainErrorTranslator.js
│   │       ├── InvariantError.js
│   │       ├── NotFoundError.js
│   │       └── _test/
│   ├── Domains/                    # Enterprise Logic Layer
│   │   ├── authentications/
│   │   ├── comments/
│   │   ├── likes/
│   │   ├── replies/
│   │   ├── threads/
│   │   └── users/
│   ├── Infrastructures/            # External Agencies (Database, HTTP, Security)
│   │   ├── container.js            # Dependency Injection Container
│   │   ├── database/
│   │   │   └── postgres/
│   │   ├── http/
│   │   │   ├── createServer.js     # Server configuration
│   │   │   └── _test/
│   │   ├── repository/             # Repository implementations
│   │   │   ├── AuthenticationRepositoryPostgres.js
│   │   │   ├── CommentRepositoryPostgres.js
│   │   │   ├── LikeRepositoryPostgres.js
│   │   │   ├── ReplyRepositoryPostgres.js
│   │   │   ├── ThreadRepositoryPostgres.js
│   │   │   ├── UserRepositoryPostgres.js
│   │   │   └── _test/
│   │   └── security/               # Security implementations
│   │       ├── BcryptPasswordHash.js
│   │       ├── JwtTokenManager.js
│   │       └── _test/
│   ├── Interfaces/                 # Interface Layer (HTTP)
│   │   └── http/
│   │       └── api/                # Route handlers
│   │           ├── authentications/
│   │           ├── comments/
│   │           ├── likes/
│   │           ├── replies/
│   │           ├── threads/
│   │           └── users/
│   └── app.js                      # Application entry point
├── tests/                           # Test helpers
│   ├── AuthenticationsTableTestHelper.js
│   ├── CommentsTableTestHelper.js
│   ├── LikesTableTestHelper.js
│   ├── RepliesTableTestHelper.js
│   ├── ThreadsTableTestHelper.js
│   └── UsersTableTestHelper.js
├── package.json
└── .env                            # Environment variables (tidak ada di repo)
```

## 🏗️ Arsitektur

Proyek menggunakan **Clean Architecture** dengan pemisahan layer yang jelas:

### Layer Architecture
1. **Entities (Domains)** - Business rules, repository interfaces
2. **Use Cases (Applications)** - Application business rules
3. **Interface Adapters** - Controllers, gateways, presenters
4. **Frameworks & Drivers** - HTTP server, database, external libraries

### Design Patterns
- **Repository Pattern** - Abstraksi data access
- **Dependency Injection** - Loose coupling antar komponen
- **Factory Pattern** - Container untuk membuat instance
- **Domain-Driven Design** - Fokus pada domain logic

## 🚀 Installation

### Prerequisites
- Node.js v14 atau lebih tinggi
- PostgreSQL v12 atau lebih tinggi
- npm atau yarn

### Setup

1. Clone repository
```bash
git clone <repository-url>
cd "Forum API"
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
```

4. Konfigurasi database di `.env`:
```
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=forum_api
```

5. Run database migrations
```bash
npm run migrate
```

## 📖 Cara Penggunaan

### Development Mode
```bash
npm run start:dev
```
Server akan berjalan di `http://localhost:5000`

### Production Mode
```bash
npm start
```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests with watch mode
```bash
npm run test:watch:change
```

### Run tests with coverage report
```bash
npm run test:watch
```

## 📡 API Endpoints

### Authentication
- `POST /users` - Register new user
- `POST /authentications` - Login
- `PUT /authentications` - Refresh token
- `DELETE /authentications` - Logout

### Threads
- `POST /threads` - Create thread (authenticated)
- `GET /threads/:threadId` - Get thread details with comments and replies

### Comments
- `POST /threads/:threadId/comments` - Add comment (authenticated)
- `DELETE /threads/:threadId/comments/:commentId` - Delete comment (authenticated, owner only)

### Replies
- `POST /threads/:threadId/comments/:commentId/replies` - Add reply (authenticated)
- `DELETE /threads/:threadId/comments/:commentId/replies/:replyId` - Delete reply (authenticated, owner only)

### Likes
- `PUT /threads/:threadId/comments/:commentId/likes` - Like/unlike comment (authenticated)
- `PUT /threads/:threadId/comments/:commentId/replies/:replyId/likes` - Like/unlike reply (authenticated)

## 🔒 Security Features

- **JWT Authentication** - Token-based authentication
- **Bcrypt Password Hashing** - Secure password storage with salt
- **Authorization Checks** - Verify ownership sebelum delete/update
- **Input Validation** - Validasi pada semua endpoint
- **Error Handling** - Graceful error responses dengan proper HTTP status codes

## 🧩 Komponen Utama

### AuthenticationTokenManager
Interface untuk manajemen JWT token. Implementasi: `JwtTokenManager`

### PasswordHash
Interface untuk hashing password. Implementasi: `BcryptPasswordHash`

### Repository Pattern
Setiap domain memiliki repository interface dan implementasi PostgreSQL:
- `UserRepository` / `UserRepositoryPostgres`
- `ThreadRepository` / `ThreadRepositoryPostgres`
- `CommentRepository` / `CommentRepositoryPostgres`
- `ReplyRepository` / `ReplyRepositoryPostgres`
- `LikeRepository` / `LikeRepositoryPostgres`
- `AuthenticationRepository` / `AuthenticationRepositoryPostgres`

### Use Cases
Setiap fitur/operasi diimplementasikan sebagai use case terpisah untuk single responsibility dan testability.

## 🔄 Database Schema

### users
```sql
- id (primary key)
- username (unique)
- password (hashed)
- fullname
- created_at
```

### authentications
```sql
- id (primary key)
- token (refresh token)
- created_at
```

### threads
```sql
- id (primary key)
- title
- body
- owner (user_id)
- created_at
```

### comments
```sql
- id (primary key)
- thread_id
- owner (user_id)
- content
- created_at
```

### replies
```sql
- id (primary key)
- comment_id
- owner (user_id)
- content
- created_at
```

### likes
```sql
- id (primary key)
- comment_id or reply_id
- owner (user_id)
- type (comment/reply)
- created_at
```

## 📝 Conventions

- **File Naming** - PascalCase untuk classes, kebab-case untuk test files
- **Folder Structure** - Mengikuti Clean Architecture principles
- **Error Handling** - Custom exception classes dengan domain-specific errors
- **Testing** - Unit tests untuk use cases, repositories, security modules
- **Database** - PostgreSQL dengan migrations untuk version control

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC

## 👨‍💻 Author

Forum API

---

**Status:** ✅ Production Ready
**Last Updated:** March 2026
