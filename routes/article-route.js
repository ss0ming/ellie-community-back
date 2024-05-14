import express from 'express';
import { getArticleList, getArticle, addArticle, updateArticle, deleteArticle, getCommentList, getComment, addComment, updateComment, deleteComment } from '../controllers/article-controller.js';

const router = express.Router();

// 게시글 목록 조회
router.get('/', getArticleList);

// 게시글 단일 조회
router.get('/:id', getArticle);

// 게시글 생성
router.post('/', addArticle);

// 게시글 수정
router.put('/:id', updateArticle);

// 게시글 삭제
router.post('/:id', deleteArticle);

// 댓글 목록 조회
router.get('/:id/comments', getCommentList);

// 댓글 단일 조회
router.get('/:id/comments/:commentId', getComment);

// 댓글 생성
router.post('/:id/comments', addComment);

// 댓글 수정
router.put('/:id/comments/:commentId', updateComment);

// 댓글 삭제
router.post('/:id/comments/:commentId', deleteComment);

export default router;