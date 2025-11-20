// 1. Supabase 설정
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
            // 로그인 상태
            if (loginLink) loginLink.style.display = 'none';
            if (signupLink) signupLink.style.display = 'none';
            if (myInfoLink) myInfoLink.style.display = 'inline-block';

            // 로그아웃 버튼 생성
            if (myInfoLink && !logoutButton) {
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
            // 로그아웃 상태
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
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            // HTML의 id가 password_confirm 인지 password-confirm 인지 꼭 확인하세요.
            // 아래는 안전하게 둘 다 찾도록 처리했습니다.
            const passwordConfirmInput = document.getElementById('password_confirm') || document.getElementById('password-confirm');
            const passwordConfirm = passwordConfirmInput ? passwordConfirmInput.value : '';

            if (!passwordConfirmInput) {
                console.error("비밀번호 확인 입력창을 찾을 수 없습니다. HTML ID를 확인하세요.");
                return;
            }

            if (password !== passwordConfirm) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }

            try {
                // Supabase 회원가입 요청
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });

                if (error) throw error;

                alert('회원가입 성공! 이메일을 확인해주세요.');
                
                // [수정됨] 프로필 테이블 추가 저장 (배열 오류 수정: [0] 추가)
                if (data.user) {
                    const { error: profileError } = await supabase.from('profiles').insert([
                        { 
                            id: data.user.id, 
                            username: email.split('@')[0] // 이메일 앞부분만 추출하여 문자열로 저장
                        }
                    ]);
                    
                    if (profileError) {
                        console.error('프로필 저장 실패 (회원가입은 성공):', profileError);
                    }
                }

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
            
            // [수정됨] HTML의 id="username" 혹은 id="email" 둘 다 찾도록 호환성 개선
            const emailInput = document.getElementById('username') || document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (!emailInput || !passwordInput) {
                alert("오류: HTML에서 아이디 또는 비밀번호 입력창을 찾을 수 없습니다. (ID 확인 필요)");
                return;
            }

            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) {
                    console.error("로그인 실패:", error);
                    if (error.message.includes("Invalid login credentials")) {
                        alert("아이디 또는 비밀번호가 일치하지 않습니다.");
                    } else if (error.message.includes("Email not confirmed")) {
                        alert("이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.");
                    } else {
                        alert("로그인 오류: " + error.message);
                    }
                    return;
                }

                console.log("로그인 성공:", data);
                alert('로그인 되었습니다!');
                window.location.href = 'my-info.html'; 

            } catch (err) {
                console.error("예상치 못한 오류:", err);
                alert("시스템 오류가 발생했습니다.");
            }
        });
    }
});
