import path from 'path';
import db from '../config/mysql.js';

const __dirname = path.resolve();

// 게시글 목록 조회
async function getArticleList(req, res) {
    try {
        const [articles] = await db.query('SELECT * FROM articles WHERE is_deleted = "n"');
        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 게시글 단일 조회
async function getArticle(req, res) {
    try {
        const [article] = await db.query('SELECT * FROM articles WHERE id = ? AND is_deleted = "n"', [req.params.id]);
        if (article.length === 0) {
            return res.status(404).json({ message: "Not exist article" });
        }
        res.json(article[0]);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 게시글 생성
async function addArticle(req, res) {
    const { title, content } = req.body;
    const date = new Date();

    try {
        const [article] = await db.query('INSERT INTO articles (title, content, image, likes, view_count, created_at, modified_at, is_deleted,  member_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
                                        , [title, content, null, 0, 0, date, date, "n", 8]);
        res.json({ message: "article created" })
    } catch (error) {
        console.error('Error adding article', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 게시글 수정
async function updateArticle(req, res) {
    const { title, content } = req.body;

    try {
        const [article] = await db.query('UPDATE articles SET title = ?, content = ? WHERE id = ?', [title, content, req.params.id]);
        if (article.affectedRows === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json({ message: 'Article updated successfully' });
    } catch (error) {
        console.error('Error updating articleL: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 게시글 삭제
async function deleteArticle(req, res) {
    const articleId = req.params.id;

    try {
        const [article] = await db.query('UPDATE articles SET is_deleted = "y" WHERE id = ?', [req.params.id]);
        if (article.affectedRows === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error deleting article: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 댓글 목록 조회
async function getCommentList(req, res) {
    try {
        const [comments] = await db.query('SELECT * FROM comments WHERE article_id = ? AND is_deleted = "n"', [req.params.id]);
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 댓글 단일 조회
async function getComment(req, res) {
    try {
        const [comment] = await db.query('SELECT * FROM comments WHERE id = ? AND is_deleted = "n"', [req.params.commentId]);
        if (comment.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(comment[0]);
    } catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 댓글 생성
async function addComment(req, res) {
    const { content } = req.body;
    const date = new Date();

    try {
        const [comment] = await db.query('INSERT INTO comments (content, created_at, modified_at, is_deleted, member_id, article_id) VALUES (?, ?, ?, ?, ?, ?)', [content, date, date, "n", 4, req.params.id]);
        res.json({ message: 'comment created' });
    } catch (error) {
        console.error('Error adding comment: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 댓글 수정
async function updateComment(req, res) {
    const { content } = req.body;

    try {
        const [comment] = await db.query('UPDATE comments SET content = ? WHERE id = ?', [content, req.params.commentId]);
        if (comment.affectedRows === 0) {
            return res.status(404).json({ error: 'comment not found' });
        }
        res.json({ message: 'comment updated successfully' });
    } catch (error) {
        console.error('Error updating comment: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 댓글 삭제
async function deleteComment(req, res) {
    try {
        const [comment] = await db.query('UPDATE comments SET is_deleted = "y" WHERE id = ?', [req.params.commentId]);
        if (comment.affectedRows === 0) {
            return res.status(404).json({ error: 'Comment not found'});
        }
        res.json({ message: 'Comment deleting successfully' });
    } catch (error) {
        console.error('Error deleting comment: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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