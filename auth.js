// 1. Supabase 클라이언트 초기화
// 1단계에서 복사한 'Project URL'과 'anon 키'를 여기에 붙여넣습니다.
const SUPABASE_URL = 'https://gacfkefzipcatruzxnsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2ZrZWZ6aXBjYXRydXp4bnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTc2MjIsImV4cCI6MjA3ODg5MzYyMn0.8kObqZdx7gZw7QXSQ6qODA0EOTpxPj7IquST_chESZY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. 로그인 상태에 따른 UI 변경 (모든 페이지에서 실행)
document.addEventListener('DOMContentLoaded', () => {
    supabase.auth.onAuthStateChange((event, session) => {
        const loginLink = document.querySelector('a[href="login.html"]');
        const signupLink = document.querySelector('a[href="signup.html"]');
        const myInfoLink = document.querySelector('a[href="my-info.html"]');
        
        // '나의 정보' 메뉴 항목을 위한 임시 로그아웃 버튼 생성 (예시)
        let logoutButton = document.getElementById('logout-button');
        if (session &&!logoutButton) {
            // '나의 정보' 링크가 있다면 그 옆에 로그아웃 버튼 추가
            if (myInfoLink) { 
                logoutButton = document.createElement('a');
                logoutButton.id = 'logout-button';
                logoutButton.textContent = '로그아웃';
                logoutButton.href = '#';
                logoutButton.style.marginLeft = '15px';
                logoutButton.style.cursor = 'pointer';
                myInfoLink.parentElement.appendChild(logoutButton);

                logoutButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const { error } = await supabase.auth.signOut();
                    if (error) {
                        console.error('Logout error:', error.message);
                    } else {
                        // 로그아웃 성공 시 메인 페이지로 이동
                        window.location.href = 'index.html';
                    }
                });
            }
        }

        if (session) {
            // 로그인 상태
            if (loginLink) loginLink.style.display = 'none';
            if (signupLink) signupLink.style.display = 'none';
            if (myInfoLink) myInfoLink.style.display = 'inline-block';
            if (logoutButton) logoutButton.style.display = 'inline-block';
        } else {
            // 로그아웃 상태
            if (loginLink) loginLink.style.display = 'inline-block';
            if (signupLink) signupLink.style.display = 'inline-block';
            if (myInfoLink) myInfoLink.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'none';
        }
    });
});
//... (파일 상단의 Supabase 초기화 및 onAuthStateChange 코드)...

// 3. 회원가입 폼 처리 (signup.html에서만 작동)
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작(새로고침)을 막음

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        if (password!== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        // Supabase Auth로 회원가입 요청
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        }); [12]

        if (error) {
            alert('회원가입 중 오류가 발생했습니다: ' + error.message);
        } else {
            alert('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.');
            // (선택) 회원가입 성공 시 1단계에서 만든 profiles 테이블에도 정보 추가
            // 참고: Supabase의 '트리거' 기능으로 이 과정을 자동화할 수도 있습니다. 
            const { error: profileError } = await supabase
               .from('profiles')
               .insert([
                    { id: data.user.id, username: email.split('@') } // 초기 사용자명은 이메일 앞부분으로
                ]);
            if (profileError) {
                console.error('프로필 생성 오류:', profileError.message);
            }
            
            window.location.href = 'login.html'; // 로그인 페이지로 이동
        }
    });
}
//... (파일 상단의 다른 코드들)...

// 4. 로그인 폼 처리 (login.html에서만 작동)
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Supabase Auth로 로그인 요청
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        }); [12]

        if (error) {
            alert('로그인 중 오류가 발생했습니다: ' + error.message);
        } else {
            // 로그인 성공! '나의 정보' 페이지로 이동
            alert('로그인 되었습니다. 환영합니다!');
            window.location.href = 'my-info.html';
        }
    });

}
