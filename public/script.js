function loadProducts() {
  fetch('/api/products')
    .then(res => res.json())
    .then(products => {
      const list = document.getElementById('product-list');
      list.innerHTML = '';
      products.forEach(product => {
        const item = document.createElement('li');
        item.classList.add('card');

        const ext = product.filename?.split('.').pop().toLowerCase();
        let thumbImg = '/assets/temp.png'; // 기본 썸네일

        if (['mp3', 'wav'].includes(ext)) {
          thumbImg = '/assets/audio-thumb.png';
        } 
        else if (['mp4', 'mov', 'webm'].includes(ext)) {
          thumbImg = '/assets/video-thumb.png';
        }
        else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
          thumbImg = '/assets/image-thumb.png';
        }

        item.innerHTML = `
          <div class="card-content">
            <div class="text">
              <h3>${product.name}의 에셋</h3>
            </div>
            <div class="media">
              <img src="${thumbImg}" class="thumbnail" alt="미리보기">
            </div>
          </div>
        `;

        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
          if (product.ispublic === 1) {
            window.location.href = `product.html?id=${product.id}`;
          } else {
            const pwd = prompt('🔒열람하려면 비밀번호를 입력하세요:', '');
            if (pwd === product.pw) {
              window.location.href = `product.html?id=${product.id}`;
            } else {
              alert('❌ 비밀번호가 틀렸습니다.');
            }
          }
        });

        list.appendChild(item);
      });
    });
}

// 마이페이지 로드
function loadMyPage() {
  const username = localStorage.getItem('username');
  const userInfo = document.getElementById('user-info');
  const myList = document.getElementById('my-products');

  if (!username) {
    userInfo.textContent = '로그인이 필요합니다.';
    myList.innerHTML = '';
    return;
  }

  userInfo.textContent = `사용자: ${username}`;

  fetch('/api/products')
    .then(res => res.json())
    .then(products => {
      myList.innerHTML = '';
      products
        .filter(p => p.owner === username)
        .forEach(product => {
          const item = document.createElement('li');
          item.innerHTML = `${product.name} - ${product.price}원`;
          myList.appendChild(item);
        });
    });
}

// 섹션 전환 함수
function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');

  if (id === 'products') loadProducts();
  if (id === 'mypage') loadMyPage();
}

// 로그인
function handleLogin() {
  const username = document.querySelector('.sign-in input[type="text"]').value;
  const password = document.querySelector('.sign-in input[type="password"]').value;

  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('username', data.username);
        document.getElementById('login-result').textContent = `${data.username}님, 로그인 성공`;
        document.getElementById('login-menu').textContent = '로그아웃';
        document.getElementById('login-menu').onclick = logout;
        showSection('mypage');
      } else {
        document.getElementById('login-result').textContent = `로그인 실패`;
      }
    });
}

function logout() {
  localStorage.removeItem('username');
  document.getElementById('login-menu').textContent = '로그인';
  document.getElementById('login-menu').onclick = () => showSection('login');
  showSection('products');
}

// 회원가입
function handleSignup() {
  const username = document.querySelector('.sign-up input[type="text"]').value;
  const password = document.querySelector('.sign-up input[type="password"]').value;

  fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(async res => {
      const data = await res.json();

      if (res.ok) {
        // ✅ 로그인 화면으로 전환
        document.querySelector('.wrapper').classList.remove('active');

        // ✅ 로그인 결과 메시지 위치에 출력
        const loginResult = document.getElementById('login-result');
        loginResult.textContent = '회원가입 성공';
        loginResult.style.color = 'green';
      } else {
        // 실패 메시지는 그대로 signup-result에 출력
        const signupResult = document.getElementById('signup-result');
        signupResult.textContent = data.message || '회원가입 실패';
        signupResult.style.color = 'red';
      }
    })
    .catch(err => {
      const signupResult = document.getElementById('signup-result');
      signupResult.textContent = '오류가 발생했습니다.';
      signupResult.style.color = 'red';
      console.error(err);
    });
}

// 폼 전환 애니메이션 (회원가입 <-> 로그인)
document.addEventListener('DOMContentLoaded', () => {
  const signInBtnLink = document.querySelector('.signInBtn-link');
  const signUpBtnLink = document.querySelector('.signUpBtn-link');
  const wrapper = document.querySelector('.wrapper');

  if (signUpBtnLink && signInBtnLink && wrapper) {
    signUpBtnLink.addEventListener('click', () => {
      wrapper.classList.add('active');
    });
    signInBtnLink.addEventListener('click', () => {
      wrapper.classList.remove('active');
    });
  }

  // 🔽 이 부분이 핵심 변경
  const hash = window.location.hash.replace('#', '');
  const defaultSection = hash || (localStorage.getItem('username') ? 'mypage' : 'products');
  showSection(defaultSection);

  if (localStorage.getItem('username')) {
    document.getElementById('login-menu').textContent = '로그아웃';
    document.getElementById('login-menu').onclick = logout;
  }
});

