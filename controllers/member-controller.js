import db from '../config/mysql.js';

// 회원가입
async function addMember(req, res) {
    console.log(req.body);
    const { email, password, nickname } = req.body;
    const date = new Date();

    try {
        await db.query('INSERT INTO members (email, password, nickname, created_at, modified_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?)', 
                                        [email, password, nickname, date, date, "n"]);
        res.json({ message: 'Memeber created'});
    } catch (error) {
        console.error('Error adding member: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 이메일 중복 체크
async function emailDuplicationCheck(req, res) {
    const { email } = req.body;

    try {
        const [member] = await db.query('SELECT * FROM members WHERE email = ?', [email]);
        if (member.length === 0) {
            return res.status(200).json({ message: 'Available email' });
        }
        res.status(400).json({ message: 'Duplicate email' });
    } catch (error) {
        console.error('Error checking email: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 닉네임 중복 체크
async function nicknameDuplicationCheck(req, res) {
    const { nickname } = req.body;

    try {
        const [member] = await db.query('SELECT * FROM members WHERE nickname = ?', [nickname]);
        if (member.length === 0) {
            return res.status(200).json({ message: 'Available nickname' });
        }
        res.status(400).json({ message: 'Duplicate nickname' });
    } catch (error) {
        console.error('Error checking nickname: ', error);
        res.status(500).json({ error: 'Internal server error '});
    }
}

// 로그인
async function login(req, res) {
    const { email, password } = req.body;

    try {
        const [member] = await db.query('SELECT id FROM members WHERE email = ? AND password = ?', [email, password]);
        if (member.length === 0) {
            return res.status(404).json({ message: "Not exist member or not match id or password"});
        }
        // 세션에 사용자 정보 저장
        req.session.user = member[0];
        console.log(req.session);
        res.status(200).json({ email: email });
    } catch (error) {
        console.error('Error during login: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 로그아웃
function logout(req, res) {
    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logout successfully'});
    })
}

// 회원 정보 조회
async function getMember(req, res) {
    try {
        const [member] = await db.query('SELECT id, email, nickname FROM members WHERE id = ? AND is_deleted = "n"', [req.params.id]);
        if (member.length === 0) {
            return res.status(404).json({ message: "Not exist member" });
        }
        res.json(member[0]);
    } catch (error) {
        console.error('Error fetching member: ',  error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 비밀번호 수정
async function editPassword(req, res) {
    const memberId = parseInt(req.params.id);
    const { password } = req.body;
    const date = new Date();

    try {
        const [member] = await db.query('UPDATE members SET password = ?, modified_at = ? WHERE id = ?', [password, date, memberId]);
        if (member.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json({ message: 'Member password updated successfully' });
    } catch (error) {
        console.error('Error updating password: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 닉네임 수정
async function editNickname(req, res) {
    const memberId = parseInt(req.params.id);
    const { nickname } = req.body;

    try {
        const [member] = await db.query('UPDATE members SET nickname = ?, modified_at = ? WHERE id = ?', [nickname, new Date(), memberId]);
        if (member.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json({ message: 'Member nickname updated successfully' });
    } catch (error) {
        console.error('Error updating password: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 회원탈퇴
async function deleteMember(req, res) {
    const memberId = parseInt(req.params.id);

    try {
        const [member] = await db.query('UPDATE members SET is_deleted = "y", modified_at = ? WHERE id = ?', [new Date(), memberId]);
        if (member.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Error deleting member: ', error);
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

export { addMember, emailDuplicationCheck, nicknameDuplicationCheck, login, logout, getMember, editPassword, editNickname, deleteMember };