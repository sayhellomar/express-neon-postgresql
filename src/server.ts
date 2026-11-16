import express, {
    type Application,
    type Request,
    type Response,
} from "express";
import { Pool } from "pg";
const app: Application = express();
const port = 3000;

app.use(express.json());
// app.use(express.text());
// app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
});

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) NOT NULL,
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
    res.send("Hello World");
});

app.post("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Created Successfully",
        data: req.body,
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
