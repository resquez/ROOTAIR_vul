document.addEventListener("DOMContentLoaded", function () {
    const navbarMember = document.getElementById("navbar_member");
    const emailInput = document.getElementById("email");
    const userIdInput = document.getElementById("user_id");
    const signupButton = document.getElementById("signupButton");
    const idCheckResult = document.getElementById("idCheckResult");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm_password");
    const phoneInput = document.getElementById("phone_number");
    const nameInput = document.getElementById("username");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    const phoneError = document.getElementById("phoneError");
    const userIdError = document.getElementById("userIdError");
    const nameError = document.getElementById("nameError");

    let isUserIdChecked = false; // 아이디 중복 체크 여부

    /** ✅ 네비게이션바 로그인 상태 업데이트 */
    function updateNavbar() {
        fetch("http://10.0.3.150:5000/api/member/status", {
            credentials: "include" // ✅ 쿠키 포함
        })
        .then(response => response.json())
        .then(data => {
            navbarMember.innerHTML = ""; // 기존 내용 초기화
            if (data.is_authenticated) {
                navbarMember.innerHTML = data.is_admin
                    ? `<li><a href="http://10.0.3.150:5000/api/member/logout">로그아웃</a></li>
                       <li><a href="http://10.0.1.100:80/admin/admin_man.html">회원정보</a></li>`
                    : `<li><a href="http://10.0.3.150:5000/api/member/logout">로그아웃</a></li>
                       <li><a href="http://10.0.1.100:80/mypage/mypage.html">마이페이지</a></li>`;
            } else {
                navbarMember.innerHTML = `<li><a href="http://10.0.1.100:80/member/member_signup.html">회원가입</a></li>
                                          <li><a href="http://10.0.1.100:80/member/member_login.html">로그인</a></li>`;
            }
        })
        .catch(error => console.error("사용자 상태 확인 중 오류 발생:", error));
    }
    updateNavbar(); // 페이지 로드 시 즉시 실행

    /** ✅ 이메일 인증 후 자동 입력 (localStorage 사용) */
    const verifiedEmail = localStorage.getItem("verified_email");
    if (verifiedEmail) {
        emailInput.value = verifiedEmail;
    } else {
        alert("이메일 인증이 필요합니다.");
        window.location.href = "http://10.0.1.100:80/member/member_email.html";
    }

    // /** ✅ 이메일 인증 후 자동 입력 */
    // fetch("http://10.0.3.150:5000/api/member/get_verified_email", {
    //     method: "GET",
    //     credentials: "include"
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if (data.email) {
    //         document.getElementById("email").value = data.email;
    //     } else {
    //         alert("이메일 인증이 필요합니다.");
    //         window.location.href = "http://10.0.1.100:80/member/member_email.html";
    //     }
    // })
    // .catch(error => console.error("이메일 확인 오류:", error));

    /** ✅ 아이디 중복 확인 기능 */
    function checkId() {
        const userId = userIdInput.value.trim();
        if (!userId) {
            idCheckResult.textContent = "아이디를 입력해주세요.";
            idCheckResult.style.color = "red";
            isUserIdChecked = false;
            return;
        }

        fetch("http://10.0.3.150:5000/api/member/check-id", {
            method: "POST",
            credentials: "include", // ✅ 쿠키 포함
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId })
        })
        .then(response => response.json())
        .then(data => {
            idCheckResult.textContent = data.message;
            idCheckResult.style.color = data.available ? "green" : "red";
            isUserIdChecked = data.available;
        })
        .catch(error => console.error("아이디 중복 확인 오류:", error));
    }
    userIdInput.addEventListener("input", checkId);

    /** ✅ 회원가입 요청 */
    signupButton.addEventListener("click", function (event) {
        event.preventDefault();

        if (!isUserIdChecked) {
            alert("아이디 중복 확인을 해주세요.");
            return;
        }

        const formData = {
            username: nameInput.value,
            user_id: userIdInput.value,
            password: passwordInput.value,
            password_confirm: confirmPasswordInput.value,
            postal_code: document.getElementById("postal_code").value,
            address: document.getElementById("address").value,
            add_detail: document.getElementById("add_detail").value,
            phone_number: phoneInput.value,
            email: emailInput.value
        };

        fetch("http://10.0.3.150:5000/api/member/signup", {
            method: "POST",
            credentials: "include", // ✅ 쿠키 포함
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert("회원가입 성공!");

                // ✅ 회원가입 완료 후 localStorage에서 이메일 삭제
                localStorage.removeItem("verified_email");

                window.location.href = "http://10.0.1.100:80/member/member_login.html";
            } else {
                alert("회원가입 실패: " + data.error);
            }
        })
        .catch(error => console.error("회원가입 오류:", error));
    });

    /** ✅ 주소 검색 기능 */
    function searchAddress() {
        new daum.Postcode({
            oncomplete: function(data) {
                document.getElementById("postal_code").value = data.zonecode;
                document.getElementById("address").value = data.address;
                document.getElementById("add_detail").focus();
            }
        }).open();
    }
    document.getElementById("searchAddressBtn").addEventListener("click", searchAddress);

    /** ✅ 입력값 검증 (비밀번호, 전화번호, 이름) */
    function validateField(input, regex, errorElement, errorMessage) {
        input.addEventListener("input", function() {
            errorElement.style.display = regex.test(input.value) ? "none" : "block";
            errorElement.innerText = errorMessage;
        });
    }

    validateField(passwordInput, /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/, passwordError, "비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자로 설정해야 합니다.");
    validateField(phoneInput, /^010-\d{4}-\d{4}$|^010\d{8}$/, phoneError, "전화번호 형식이 올바르지 않습니다.");
    validateField(nameInput, /.{2,}/, nameError, "이름은 최소 2자 이상 입력해야 합니다.");

    window.addEventListener("beforeunload", function () {
        localStorage.removeItem("verified_email");  // ✅ 페이지 떠날 때 이메일 삭제
    });    

    /** ✅ 로그아웃 기능 */
    document.getElementById("logoutButton").addEventListener("click", function () {
        fetch("http://10.0.3.150:5000/api/member/logout", {
            method: "POST",
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            window.location.href = "http://10.0.1.100:80/main/main.html";
        })
        .catch(error => console.error("로그아웃 오류:", error));
    });
});

