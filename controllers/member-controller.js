import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

// 회원가입
function addMember(req, res) {
    console.log(req.body);
    const { email, password, nickname } = req.body;

    fs.readFile(path.join(__dirname, 'data/member.json'), 'utf8', (err, data) => {
        if (err) {
            console.err('Error reading file: ', err);
            return;
        }

        const members = JSON.parse(data);
        const dataLength = members.length;

        const newMember = {
            "id": dataLength + 1,
            "email": email,
            "password": password,
            "nickname": nickname,
            "created_at": formatDate(new Date()),
            "modified_at": formatDate(new Date()), 
            "is_deleted": "n"
        }

        members.push(newMember);

        fs.writeFile(path.join(__dirname, 'data/member.json'), JSON.stringify(members, null, 2), err => {
            if (err) {
                console.error('Error writing file: ', err);
                return res.status(500).send('Internal Server Error');
            }

            res.json({ message: (dataLength+1) + ' member created' })
        })
    });
}

// 이메일 중복 체크
function emailDuplicationCheck(req, res) {
    const { email } = req.body;

    fs.readFile(path.join(__dirname, 'data/member.json'), 'utf8', (err, members) => {
        if (err) {
            console.error('Error reading file: ', err);
        }
        try {
            const data = JSON.parse(members).find((member) => member.email === email);
            
            if (!data) {
                return res.status(200).json({ message: "Available email" });
            }

            res.status(400).json({ message: "Duplicate email" });
        }
        catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    })
}

// 닉네임 중복 체크
function nicknameDuplicationCheck(req, res) {
    const { nickname } = req.body;

    fs.readFile(path.join(__dirname, 'data/member.json'), 'utf8', (err, members) => {
        if (err) {
            console.error('Error reading file: ', err);
        }
        try {
            const data = JSON.parse(members).find((member) => member.nickname === nickname);
            
            if (!data) {
                return res.status(200).json({ message: "Available nickname" });
            }

            res.status(400).json({ message: "Duplication nickname" });
        }
        catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    })
}

// 로그인
function login(req, res) {
    const { email, password } = req.body;

    fs.readFile(path.join(__dirname, 'data/member.json'), 'utf8', (err, members) => {
        if (err) {
            console.error('Error reading file: ', err);
        }
        try {
            const data = JSON.parse(members).find((member) => member.email === email && member.password === password);
            
            if (!data) {
                return res.status(404).json({ message: "Not exist member or not match id or password" });
            }

            res.status(200).json( { email: email });
        }
        catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    })
}

// 회원 정보 조회
function getMember(req, res) {
    fs.readFile(path.join(__dirname, 'data/member.json'), 'utf8', (err, members) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        try {
            const data = JSON.parse(members);
            const member = data.find((member) => member.id === parseInt(req.params.id));

            if (!member) {
                res.status(404).json({ message: "Not exist member"});
            } else if (member.is_deleted === "y") {
                res.status(404).json({ message: "Deleted member"});
            }

            res.json({
                id: member.id,
                email: member.email,
                nickname: member.nickname
            })
        }
        catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    })
}

// 비밀번호 수정
function editPassword(req, res) {
    const memberId = parseInt(req.params.id);
    const { password } = req.body;

    fs.readFile(path.join(__dirname, 'data/member.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        let members = JSON.parse(data);

        const memberIndex = members.findIndex(member => member.id === memberId);
        if (memberId === -1) {
            return res.status(404).json({ error: 'Member not found'});
        }

        members[memberIndex].password = password;

        fs.writeFile(path.join(__dirname, 'data/member.json'), JSON.stringify(members, null, 2), err => {
            if (err) {
                console.error('Error writing file: ', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ message: 'Member password updated successfully' });
        });
    })
}

// 닉네임 수정
function editNickname(req, res) {
    const memberId = parseInt(req.params.id);
    const { nickname } = req.body;

    fs.readFile(path.join(__dirname, 'data/member.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        let members = JSON.parse(data);

        const memberIndex = members.findIndex(member => member.id === memberId);
        if (memberId === -1) {
            return res.status(404).json({ error: 'Member not found'});
        }

        members[memberIndex].nickname = nickname;

        fs.writeFile(path.join(__dirname, 'data/member.json'), JSON.stringify(members, null, 2), err => {
            if (err) {
                console.error('Error writing file: ', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ message: 'Member nickname updated successfully' });
        });
    })
}

// 회원탈퇴
function deleteMember(req, res) {
    const memberId = parseInt(req.params.id);

    fs.readFile(path.join(__dirname, 'data/member.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        let members = JSON.parse(data);

        const memberIndex = members.findIndex(member => member.id === memberId);
        if (memberId === -1) {
            return res.status(404).json({ error: 'Member not found'});
        }

        members[memberIndex].is_deleted = "y";

        fs.writeFile(path.join(__dirname, 'data/member.json'), JSON.stringify(members, null, 2), err => {
            if (err) {
                console.error('Error writing file: ', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ message: 'Member deleted successfully' });
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

export { addMember, emailDuplicationCheck, nicknameDuplicationCheck, login, getMember, editPassword, editNickname, deleteMember };