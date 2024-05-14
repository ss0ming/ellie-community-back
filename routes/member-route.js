import express from 'express';
import { addMember, emailDuplicationCheck, nicknameDuplicationCheck, login, getMember, editPassword, editNickname, deleteMember } from "../controllers/member-controller.js";

const router = express.Router();

// 회원가입
router.post('/', addMember);

// 아매알 중복 체크
router.post('/checkEmail', emailDuplicationCheck);

// 닉네임 중복 체크
router.post('/checkNickname', nicknameDuplicationCheck);

// 로그인
router.post('/login', login);

// 회원 정보 조회
router.get('/:id', getMember);

// 비밀번호 수정
router.put('/:id/edit/password', editPassword);

// 닉네임 수정
router.put('/:id/edit/nickname', editNickname);

// 회원탈퇴
router.post('/:id', deleteMember);

export default router;