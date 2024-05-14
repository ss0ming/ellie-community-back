import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

// 게시글 목록 조회
function getArticleList(req, res) {
    fs.readFile(path.join(__dirname, 'data/article.json'), 'utf8', (err, articles) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        try {
            const data = JSON.parse(articles).filter((article) => article.is_deleted === "n");
            res.json(data);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}

// 게시글 단일 조회
function getArticle(req, res) {
    fs.readFile(path.join(__dirname, 'data/article.json'), 'utf8', (err, articles) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        try {
            const data = JSON.parse(articles);
            const article = data.find((article) => article.id === parseInt(req.params.id));

            if (!article) {
                res.status(404).json({ message: "Not exist article"});
            } else if (article.is_deleted === "y") {
                res.status(404).json({ message: "Deleted article"});
            }

            res.json(article);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}

// 게시글 생성
function addArticle(req, res) {
    const { title, content } = req.body;

    fs.readFile(path.join(__dirname, 'data/article.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        const articles = JSON.parse(data);
        const dataLength = articles.length;

        const newArticle = {
            "id": dataLength+1,
            "nickname": "mang00",
            "date_time": formatDate(new Date()),
            "title": title,
            "content": content,
            "likes": 0,
            "view_count": 0,
            "comment_count": 0,
            "is_deleted": "n"
        }

        articles.push(newArticle);

        fs.writeFile(path.join(__dirname, 'data/article.json'), JSON.stringify(articles, null, 2), err => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.json({ message: (dataLength+1) + ' article created' });
        });
    });
}

// 게시글 수정
function updateArticle(req, res) {
    const articleId = req.params.id;
    const { title, content } = req.body;

    fs.readFile(path.join(__dirname, 'data/article.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        let articles = JSON.parse(data);

        const articleIndex = articles.findIndex(article => article.id === parseInt(articleId));
        if (articleIndex === -1) {
            return res.status(404).json({ error: 'Article not found' });
        }

        articles[articleIndex].title = title;
        articles[articleIndex].content = content;

        fs.writeFile(path.join(__dirname, 'data/article.json'), JSON.stringify(articles, null, 2), err => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ message: 'Article updated successfully' });
        });
    })
}

// 게시글 삭제
function deleteArticle(req, res) {
    const articleId = req.params.id;

    fs.readFile(path.join(__dirname, 'data/article.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        let articles = JSON.parse(data);

        const articleIndex = articles.findIndex(article => article.id === parseInt(articleId));
        if (articleIndex === -1) {
            return res.status(404).json({ error: 'Article not found' });
        }

        articles[articleIndex].is_deleted = "y";

        fs.writeFile(path.join(__dirname, 'data/article.json'), JSON.stringify(articles, null, 2), err => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ message: 'Article updated successfully' });
        });
    })
}

// 댓글 목록 조회
function getCommentList(req, res) {
    fs.readFile(path.join(__dirname, 'data/article_comment.json'), 'utf8', (err, comments) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        try {
            const data = JSON.parse(comments);
            const selectedComments = data.filter((comment) => 
                comment.article_id === parseInt(req.params.id) && comment.is_deleted === "n");
            res.json(selectedComments);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}

// 댓글 단일 조회
function getComment(req, res) {
    fs.readFile(path.join(__dirname, 'data/article_comment.json'), 'utf8', (err, comments) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        try {
            const data = JSON.parse(comments);
            const selectedComment = data.find((comment) => comment.id === parseInt(req.params.commentId));
            res.json(selectedComment);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}

// 댓글 생성
function addComment(req, res) {
    const { content } = req.body;

    fs.readFile(path.join(__dirname, 'data/article_comment.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        const comments = JSON.parse(data);
        const dataLength = comments.length;

        const newComment = {
            "id": dataLength+1,
            "article_id": parseInt(req.params.id),
            "nickname": "mang00",
            "date_time": formatDate(new Date()),
            "content": content,
            "is_deleted": "n"
        }

        comments.push(newComment);

        fs.writeFile(path.join(__dirname, 'data/article_comment.json'), JSON.stringify(comments, null, 2), err => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.json({
                message: (dataLength+1) + ' comment created',
                data: newComment
            });
        });
    });
}

// 댓글 수정
function updateComment(req, res) {
    const commentId = req.params.commentId;
    const { content } = req.body;

    fs.readFile(path.join(__dirname, 'data/article_comment.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        let comments = JSON.parse(data);

        const commentIndex = comments.findIndex(comment => comment.id === parseInt(commentId));
        if (commentIndex === -1) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comments[commentIndex].content = content;

        fs.writeFile(path.join(__dirname, 'data/article_comment.json'), JSON.stringify(comments, null, 2), err => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ message: 'Comment updated successfully' });
        });
    })
}

// 댓글 삭제
function deleteComment(req, res) {
    const commentId = req.params.commentId;

    fs.readFile(path.join(__dirname, 'data/article_comment.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        let comments = JSON.parse(data);

        const commentIndex = comments.findIndex(comment => comment.id === parseInt(commentId));
        if (commentIndex === -1) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comments[commentIndex].is_deleted = "y";

        fs.writeFile(path.join(__dirname, 'data/article_comment.json'), JSON.stringify(comments, null, 2), err => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ message: 'Comment deleted successfully' });
        });
    })
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export { getArticleList, getArticle, addArticle, updateArticle, deleteArticle, getCommentList, getComment, addComment, updateComment, deleteComment };