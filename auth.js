// 1. Supabase 설정 (본인의 URL과 Key 확인 필수)
const SUPABASE_URL = 'https://gacfkefzipcatruzxnsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2ZrZWZ6aXBjYXRydXp4bnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTc2MjIsImV4cCI6MjA3ODg5MzYyMn0.8kObqZdx7gZw7QXSQ6qODA0EOTpxPj7IquST_chESZY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 2. 로그인 상태 UI 관리 ---
    supabase.auth.onAuthStateChange((event, session) => {
        const loginLink = document.querySelector('a[href="login.html"]');
        const signupLink = document.querySelector('a[href="signup.html"]');
        const myInfoLink = document.querySelector('a[href="my-info.html"]');
        
        let logoutButton = document.getElementById('logout-button');

        if (session) {
            // 로그인 상태일 때
            if (loginLink) loginLink.style.display = 'none';
            if (signupLink) signupLink.style.display = 'none';
            if (myInfoLink) myInfoLink.style.display = 'inline-block';

            // 로그아웃 버튼이 없으면 생성
            if (myInfoLink && !logoutButton) {
                logoutButton = document.createElement('a');
                logoutButton.id = 'logout-button';
                logoutButton.textContent = '로그아웃';
                logoutButton.href = '#'; //로그아웃 버튼 클릭시 연결될 페이지 연결 필요
                logoutButton.style.marginLeft = '15px';
                logoutButton.style.cursor = 'pointer';
                myInfoLink.parentElement.appendChild(logoutButton);

                logoutButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await supabase.auth.signOut();
                    alert('로그아웃 되었습니다.');
                    window.location.href = 'index.html';
                });
            }
            if (logoutButton) logoutButton.style.display = 'inline-block';
        } else {
            // 로그아웃 상태일 때
            if (loginLink) loginLink.style.display = 'inline-block';
            if (signupLink) signupLink.style.display = 'inline-block';
            if (myInfoLink) myInfoLink.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'none';
        }
    });

    // --- 3. 회원가입 로직 ---
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // 405 에러 방지 (매우 중요)

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            // 수정: HTML id와 일치시킴 (password-confirm -> password_confirm)
            const passwordConfirm = document.getElementById('password_confirm').value; 

            if (password !== passwordConfirm) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }

            try {
                // 수정: [1] 같은 인용 번호 제거됨
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });

                if (error) throw error;

                alert('회원가입 성공! 이메일을 확인해주세요.');
                
                // 프로필 테이블 추가 저장 (선택 사항)
                await supabase.from('profiles').insert([
                    { id: data.user.id, username: email.split('@') }
                ]);

                window.location.href = 'login.html';

            } catch (error) {
                alert('회원가입 실패: ' + error.message);
            }
        });
    }

    // --- 4. 로그인 로직 (수정됨) ---
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // 1. 폼의 기본 제출 동작(새로고침)을 막습니다.
            console.log("로그인 시도 시작..."); 

            // [수정 포인트] HTML의 id="username"을 찾도록 변경했습니다.
            const emailInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            // 안전장치: 입력창이 진짜 있는지 확인
            if (!emailInput || !passwordInput) {//비교연산자 띄어쓰기 수정함-현주-
                alert("오류: HTML에서 아이디 또는 비밀번호 입력창을 찾을 수 없습니다.");
                return;
            }

            // Supabase는 'email'이라는 파라미터를 원하므로, username 입력값을 email 변수에 담습니다.
            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) {
                    console.error("로그인 실패:", error);
                    // 자주 발생하는 에러 메시지 번역
                    if (error.message.includes("Invalid login credentials")) {
                        alert("아이디 또는 비밀번호가 일치하지 않습니다.");
                    } else if (error.message.includes("Email not confirmed")) {
                        alert("이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.");
                    } else {
                        alert("로그인 오류: " + error.message);
                    }
                    return;
                }

                // 로그인 성공 시
                console.log("로그인 성공:", data);
                alert('로그인 되었습니다!');
                window.location.href = 'my-info.html'; // 마이페이지로 이동

            } catch (err) {
                console.error("예상치 못한 오류:", err);
                alert("시스템 오류가 발생했습니다.");
            }
        });
    }
});








