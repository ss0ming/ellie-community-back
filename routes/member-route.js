import express from 'express';
import { addMember, emailDuplicationCheck, nicknameDuplicationCheck, login, logout, getMember, editPassword, editNickname, deleteMember, checkSession } from "../controllers/member-controller.js";

const router = express.Router();

// 회원가입
router.post('/', addMember);

// 아매알 중복 체크
router.post('/checkEmail', emailDuplicationCheck);

// 닉네임 중복 체크
router.post('/checkNickname', nicknameDuplicationCheck);

// 로그인
router.post('/login', login);

// 로그아웃
router.post('/logout', logout);

// 세션 확인
router.get('/checkSession', checkSession);

// 회원 정보 조회
router.get('/:id', getMember);

// 비밀번호 수정
router.put('/:id/edit/password', editPassword);

// 닉네임 수정
router.put('/:id/edit/nickname', editNickname);

// 회원탈퇴
router.delete('/:id', deleteMember);

export default router;