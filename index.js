// -------------------------------
// ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้วหรือยัง
// -------------------------------
function checkLogin() {
    const email = localStorage.getItem("userEmail");
    const name  = localStorage.getItem("userName");
    const role  = localStorage.getItem("userRole");

    // ถ้ายังไม่มี Login → กลับหน้า Login
    if (!email || !name) {
        window.location.href = "login.html";
        return;
    }

    // แสดงข้อมูลผู้ใช้บนเมนู
    const userBox = document.getElementById("userInfo");
    if (userBox) {
        userBox.innerHTML = `${name} <span style="color:#6b7280;">(${role})</span>`;
    }
}


// -------------------------------
// ออกจากระบบ
// -------------------------------
function logout() {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    window.location.href = "login.html";
}
