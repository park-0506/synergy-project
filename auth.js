// 1. Supabase 설정 (본인의 URL과 Key 확인 필수)
const SUPABASE_URL = 'https://gacfkefzipcatruzxnsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2ZrZWZ6aXBjYXRydXp4bnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTc2MjIsImV4cCI6MjA3ODg5MzYyMn0.8kObqZdx7gZw7QXSQ6qODA0EOTpxPj7IquST_chESZY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded' () => {
    
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
            if (myInfoLink &&!logoutButton) {
                logoutButton = document.createElement('a');
                logoutButton.id = 'logout-button';
                logoutButton.textContent = '로그아웃';
                logoutButton.href = '#';
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

            if (password!== passwordConfirm) {
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

    // --- 4. 로그인 로직 ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // 수정: [1] 인용 번호 제거됨
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) throw error;

                alert('로그인 되었습니다!');
                window.location.href = 'my-info.html';

            } catch (error) {
                alert('로그인 실패: ' + error.message);
            }
        });
    }
});


