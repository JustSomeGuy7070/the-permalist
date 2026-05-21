import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = process.env.PORT || 3000;

const requiredEnv = ["PGUSER", "PGHOST", "PGDATABASE", "PGPASSWORD", "PGPORT"];
const missingEnv = process.env.DATABASE_URL
  ? []
  : requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnv.join(", ")}. ` +
      "Set DATABASE_URL or the individual PG* variables."
  );
}

const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: Number(process.env.PGPORT),
    };

const db = new pg.Client(dbConfig);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

function normalizeText(value) {
  return value?.trim();
}

function getErrorMessage(code) {
  const messages = {
    empty_title: "Please enter a todo item before adding it.",
    empty_update: "Updated todo text cannot be empty.",
    invalid_id: "That todo item could not be found.",
    db_error: "Something went wrong while saving your todo. Please try again.",
  };

  return messages[code] || null;
}

async function getItems() {
  const result = await db.query(`
    SELECT
      id,
      title,
      completed,
      category,
      TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date
    FROM public.items
    ORDER BY completed ASC, due_date ASC NULLS LAST, id ASC
  `);

  return result.rows;
}

async function ensureDatabaseSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.items (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
      completed BOOLEAN NOT NULL DEFAULT false,
      category VARCHAR(100),
      due_date DATE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query("ALTER TABLE public.items ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT false");
  await db.query("ALTER TABLE public.items ADD COLUMN IF NOT EXISTS category VARCHAR(100)");
  await db.query("ALTER TABLE public.items ADD COLUMN IF NOT EXISTS due_date DATE");
  await db.query(
    "ALTER TABLE public.items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"
  );
}

app.get("/", async (req, res) => {
  try {
    const items = await getItems();

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
      errorMessage: getErrorMessage(req.query.error),
    });
  } catch (err) {
    console.error("Could not load todo items:", err);
    res.status(500).render("index.ejs", {
      listTitle: "Today",
      listItems: [],
      errorMessage: getErrorMessage("db_error"),
    });
  }
});

app.post("/add", async (req, res) => {
  const item = normalizeText(req.body.newItem);
  const category = normalizeText(req.body.category) || null;
  const dueDate = req.body.dueDate || null;

  if (!item) {
    return res.redirect("/?error=empty_title");
  }

  try {
    await db.query("INSERT INTO public.items (title, category, due_date) VALUES ($1, $2, $3)", [
      item,
      category,
      dueDate,
    ]);
    res.redirect("/");
  } catch (err) {
    console.error("Could not add todo item:", err);
    res.redirect("/?error=db_error");
  }
});

app.post("/edit", async (req, res) => {
  const item = normalizeText(req.body.updatedItemTitle);
  const id = Number(req.body.updatedItemId);

  if (!Number.isInteger(id)) {
    return res.redirect("/?error=invalid_id");
  }

  if (!item) {
    return res.redirect("/?error=empty_update");
  }

  try {
    await db.query("UPDATE public.items SET title = $1 WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.error("Could not update todo item:", err);
    res.redirect("/?error=db_error");
  }
});

app.post("/complete", async (req, res) => {
  const id = Number(req.body.itemId);
  const completed = req.body.completed === "true";

  if (!Number.isInteger(id)) {
    return res.redirect("/?error=invalid_id");
  }

  try {
    await db.query("UPDATE public.items SET completed = $1 WHERE id = $2", [completed, id]);
    res.redirect("/");
  } catch (err) {
    console.error("Could not update todo status:", err);
    res.redirect("/?error=db_error");
  }
});

app.post("/delete", async (req, res) => {
  const id = Number(req.body.deleteItemId);

  if (!Number.isInteger(id)) {
    return res.redirect("/?error=invalid_id");
  }

  try {
    await db.query("DELETE FROM public.items WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error("Could not delete todo item:", err);
    res.redirect("/?error=db_error");
  }
});

try {
  await db.connect();
  await ensureDatabaseSchema();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} catch (err) {
  console.error("Could not connect to the database:", err);
  process.exit(1);
}
