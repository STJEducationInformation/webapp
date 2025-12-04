// -------------------------------
// Google Identity Services Login
// -------------------------------

document.addEventListener("DOMContentLoaded", () => {
    google.accounts.id.initialize({
        client_id: "231419249990-lp98er5l1v0v4u9s1foqi8e6fob9rtgb.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("googleLoginBtn"),
        {
            theme: "filled_blue",
            size: "large",
            width: 260
        }
    );

    google.accounts.id.prompt(); 
});


// -------------------------------------------
// เมื่อ Login สำเร็จ (รับ JWT Token จาก Google)
// -------------------------------------------
function handleCredentialResponse(response) {
    const jwt = response.credential;

    // แปลง Payload ของ JWT token
    const payload = JSON.parse(atob(jwt.split('.')[1]));

    const email = payload.email;
    const name  = payload.name;

    // เก็บลง LocalStorage เพื่อให้หน้าอื่นเรียกใช้
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name);

    // ไปเช็กสิทธิ์ role จาก Apps Script
    getUserRoleFromServer(email, name);
}


// -------------------------------------------
// ดึงสิทธิ์ผู้ใช้จาก Apps Script (Admin/User/etc.)
// -------------------------------------------
async function getUserRoleFromServer(email, name) {
    try {
        const res = await fetch(
            "https://script.google.com/macros/s/AKfycbzj0tobd-Vse97msrhIIh9Pfw3-qIKjSh9ikO5YKoApBh7f4-qxu7Ed0nRLsPNINWaIDw/exec",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "getUserRole",
                    email: email,
                    name: name
                })
            }
        );

        const result = await res.json();

        if (!result.success) {
            alert("ไม่สามารถตรวจสอบสิทธิ์ผู้ใช้ได้");
            return;
        }

        // เก็บ role ลง localStorage
        localStorage.setItem("userRole", result.role);

        // ไปหน้า index
        window.location.href = "index.html";

    } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในระบบ Login");
    }
}
