import express from 'express';
import memberRouter from './routes/member-route.js';
import articleRouter from './routes/article-route.js';
import cors from "cors";
import bodyParser from 'body-parser';

const app = express();
const port = 8000;
const corsOptions = { origin: "http://localhost:3000" };

app.get('/', (req, res) => {
  res.send('back server!!!');
});

// CORS 설정
app.use(cors(corsOptions));

// body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());

app.use('/members', memberRouter);
app.use('/articles', articleRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});