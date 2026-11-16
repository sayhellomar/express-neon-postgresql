import express, {
    type Application,
    type Request,
    type Response,
} from "express";
import { Pool } from "pg";
import sendResponse from "./utils/sendResponse";
const app: Application = express();
const port = process.env.PORT || 8000;

app.use(express.json());
// app.use(express.text());
// app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
});

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                age SMALLINT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )    
        `);
        console.log("Database Connected");
    } catch (error) {
        console.log(error);
    }
};

initDB();

app.get("/", (req: Request, res: Response) => {
    res.send("API base route");
});

app.get("/api/v1/users", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT * FROM users 
        `);
        sendResponse(res, 200, true, "Success", result.rows);
    } catch (error) {
        sendResponse(res, 500, false, "Internal server error");
    }
});

app.get("/api/v1/users/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`SELECT * FROM users WHERE id=$1`, [
            id,
        ]);
        if (result.rowCount === 0) {
            return sendResponse(res, 404, false, "User not found");
        }
        sendResponse(res, 200, true, "Success", result.rows[0]);
    } catch (error) {
        sendResponse(res, 500, false, "Internal server error");
    }
});

app.post("/api/v1/users", async (req: Request, res: Response) => {
    const { name, email, password, age } = req.body;
    try {
        const result = await pool.query(
            `
            INSERT INTO users (name, email, password, age) VALUES($1, $2, $3, $4) RETURNING *
        `,
            [name, email, password, age],
        );

        sendResponse(res, 201, true, "Created Successfully", result.rows[0]);
    } catch (error: any) {
        sendResponse(res, 500, false, error?.message, error);
    }
});

app.put("/api/v1/users/:id", async (req: Request, res: Response) => {
    const { name, password, age, is_active } = req?.body;
    const { id } = req.params;
    try {
        const result = await pool.query(
            `
            UPDATE users SET
            name = COALESCE($1, name),
            password = COALESCE($2, password),
            age = COALESCE($3, age),
            is_active = COALESCE($4, is_active),
            updated_at = NOW()
            WHERE id = $5 RETURNING *
        `,
            [
                name ?? null,
                password ?? null,
                age ?? null,
                is_active ?? null,
                id,
            ],
        );
        if (result.rowCount === 0) {
            return sendResponse(res, 404, false, "User not found");
        }
        sendResponse(res, 200, true, "Updated Successfully", result.rows[0]);
    } catch (error: any) {
        sendResponse(res, 500, false, error?.message, error);
    }
});

app.delete("/api/v1/users/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `
            DELETE FROM users WHERE id = $1
        `,
            [id],
        );

        if (result.rowCount === 0) {
            return sendResponse(res, 404, false, "User not found");
        }
        sendResponse(res, 200, true, "Deleted Successfully");
    } catch (error: any) {
        sendResponse(res, 500, false, error?.message, error);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
