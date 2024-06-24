import db from '../config/mysql.js';

// 게시글 목록 조회
async function getArticleList(req, res) {
    try {
        const [articles] = await db.query(`
            SELECT 
                articles.*,
                members.nickname,
                members.profileImage
            FROM 
                articles 
            LEFT JOIN 
                members 
            ON 
                articles.member_id = members.id 
            WHERE 
                articles.is_deleted = 'n'
            `);

        articles.forEach(article => {
            article.created_at = formatDate(article.created_at);
            article.modified_at = formatDate(article.modified_at);
        });

        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 게시글 단일 조회
async function getArticle(req, res) {
    try {
        const [article] = await db.query(`
            SELECT 
                articles.*,
                members.id,
                members.nickname,
                members.profileImage
            FROM 
                articles 
            LEFT JOIN 
                members 
            ON 
                articles.member_id = members.id 
            WHERE 
                articles.id = ? AND articles.is_deleted = 'n'`, [req.params.id]);
        if (article.length === 0) {
            return res.status(404).json({ message: "Not exist article" });
        }

        article[0].created_at = formatDate(article[0].created_at);
        article[0].modified_at = formatDate(article[0].modified_at);

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

    // 로그인한 사용자의 member_id 가져오기
    console.log(req.session);
    const member_id = req.session.user?.id;

    try {
        const [article] = await db.query('INSERT INTO articles (title, content, image, likes, view_count, created_at, modified_at, is_deleted,  member_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
                                        , [title, content, null, 0, 0, date, date, "n", member_id]);
        res.json({ message: "article created" })
    } catch (error) {
        console.error('Error adding article', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 게시글 수정
async function updateArticle(req, res) {
    const { title, content } = req.body;
    const date = new Date();

    try {
        const [article] = await db.query('UPDATE articles SET title = ?, content = ?, modified_at = ? WHERE id = ?', [title, content, date, req.params.id]);
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
    const date = new Date();

    try {
        const [article] = await db.query('UPDATE articles SET modified_at = ?, is_deleted = "y" WHERE id = ?', [date, req.params.id]);
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
        const [comments] = await db.query(`
        SELECT 
            comments.id AS comment_id,
            comments.content,
            comments.created_at,
            comments.member_id,
            comments.article_id,
            members.id AS member_id,
            members.nickname,
            members.profileImage
        FROM 
          comments 
        LEFT JOIN 
          members 
        ON 
          comments.member_id = members.id 
        WHERE 
          comments.article_id = ? AND comments.is_deleted = 'n'`, [req.params.id]);

        comments.forEach(comment => {
            comment.created_at = formatDate(comment.created_at);
        });

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 댓글 단일 조회
async function getComment(req, res) {
    console.log(req.params.commentId);
    try {
        const [comment] = await db.query(`
            SELECT 
                comments.id AS comment_id,
                comments.content,
                comments.created_at,
                comments.member_id,
                comments.article_id,
                members.id AS member_id,
                members.nickname,
                members.profileImage
            FROM 
                comments 
            LEFT JOIN 
                members 
            ON 
                comments.member_id = members.id 
            WHERE 
                comments.id = ? AND comments.is_deleted = 'n'`, [req.params.commentId]);
        if (comment.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comment[0].created_at = formatDate(comment[0].created_at);

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

    // 로그인한 사용자의 member_id 가져오기
    console.log(req.session);
    const member_id = req.session.user?.id;

    try {
        const [addComment] = await db.query('INSERT INTO comments (content, created_at, modified_at, is_deleted, member_id, article_id) VALUES (?, ?, ?, ?, ?, ?)', [content, date, date, "n", member_id, req.params.id]);
        
        // 생성된 댓글의 ID 가져오기
        const commentId = addComment.insertId;

        // 생성된 댓글 조회
        const [comment] = await db.query(`
            SELECT 
                comments.id AS comment_id,
                comments.content,
                comments.created_at,
                comments.member_id,
                comments.article_id,
                members.id AS member_id,
                members.nickname,
                members.profileImage
            FROM 
                comments 
            LEFT JOIN 
                members 
            ON 
                comments.member_id = members.id 
            WHERE 
                comments.id = ?`, 
            [commentId]
        );

        res.json(comment[0]);
    } catch (error) {
        console.error('Error adding comment: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 댓글 수정
async function updateComment(req, res) {
    const { content } = req.body;
    const date = new Date();

    try {
        const [comment] = await db.query('UPDATE comments SET content = ?, modified_at = ? WHERE id = ?', [content, date, req.params.commentId]);
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
    const date = new Date();

    try {
        const [comment] = await db.query('UPDATE comments SET modified_at = ?, is_deleted = "y" WHERE id = ?', [date, req.params.commentId]);
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