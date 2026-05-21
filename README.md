# 📝 Permalist

A full-stack todo-list application built with Node.js, Express, EJS, and PostgreSQL.

The project lets users manage a persistent todo list with saved items, completion status, categories, and due dates.

---

## 🚀 Live Demo

https://the-permalist.onrender.com

---

## 📌 Features

- Add new todo items
- Edit existing todo items
- Mark todo items as complete
- Delete todo items
- Add optional categories
- Add optional due dates
- Store todo items permanently in PostgreSQL
- Validate empty todo submissions
- Use environment variables for database configuration

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- EJS
- PostgreSQL
- pg
- dotenv
- Body-Parser
- HTML5
- CSS3
- JavaScript

---

## ⚙️ How It Works

- The Express server handles routes for viewing, adding, editing, completing, and deleting todo items
- EJS templates dynamically render the todo list from database records
- PostgreSQL stores each todo item so the list stays saved after the server restarts
- Form submissions send todo updates to the server using POST routes
- Environment variables keep database credentials out of the main application code

---

## 🗄️ Database Structure

The application uses a PostgreSQL `items` table with fields for:

- `id`
- `title`
- `completed`
- `category`
- `due_date`
- `created_at`

The full table setup is included in `schema.sql`.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory for local development.

Use `.env.example` as a guide:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/permalist?sslmode=require
```

For a local PostgreSQL database, you can use the individual variables instead:

```env
PORT=3000
PGUSER=postgres
PGHOST=localhost
PGDATABASE=permalist
PGPASSWORD=your_postgres_password
PGPORT=5432
```

Do not commit your `.env` file.

---

## 🧰 Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a PostgreSQL database named `permalist`.

3. Set up the database table using:

```bash
schema.sql
```

4. Create a `.env` file using `.env.example` as a guide.

5. Start the app:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

---

## 💡 What I Learned

- Connecting an Express app to PostgreSQL
- Performing CRUD operations with SQL queries
- Rendering database records with EJS
- Handling form data with body-parser
- Using environment variables for safer configuration
- Adding basic validation and error handling

---

## 👨‍💻 Author

Built as part of my self-taught full-stack development journey.
