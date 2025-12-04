/* login.js */
/* ส่วนนี้ใช้ในหน้าอื่นๆ เช่น dashboard.html, asset.html, admin.html */
/* เพื่อบังคับตรวจสอบว่าผู้ใช้ login แล้วจริงหรือไม่ */

const API_URL   = "https://script.google.com/macros/s/AKfycbzj0tobd-Vse97msrhIIh9Pfw3-qIKjSh9ikO5YKoApBh7f4-qxu7Ed0nRLsPNINWaIDw/exec";

/* ฟังก์ชันตรวจสอบการเข้าสู่ระบบ */
function checkLogin() {
  const email = localStorage.getItem("up_user_email");
  const name  = localStorage.getItem("up_user_name");
  const role  = localStorage.getItem("up_user_role");

  // ถ้าไม่มี email แสดงว่ายังไม่ได้ login
  if (!email || !role) {
    window.location.href = "login.html";
    return;
  }

  return { email, name, role };
}

/* ฟังก์ชันออกจากระบบ */
function logout() {
  localStorage.removeItem("up_user_email");
  localStorage.removeItem("up_user_name");
  localStorage.removeItem("up_user_role");

  // Google Logout
  try {
    google.accounts.id.disableAutoSelect();
  } catch (e) {}

  window.location.href = "login.html";
}

/* ฟังก์ชันตรวจสอบสิทธิ์ผู้ใช้จากหน้าอื่น */
async function getUserRoleFromServer(email) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getUserRole",
      email: email
    })
  });

  const data = await res.json();
  return data;
}

/* ฟังก์ชันป้องกันสิทธิ์เข้าหน้า Admin */
function requireAdmin() {
  const role = localStorage.getItem("up_user_role");
  if (role !== "admin") {
    alert("คุณไม่มีสิทธิ์เข้าหน้านี้");
    window.location.href = "dashboard.html";
  }
}

/* ฟังก์ชันป้องกันสิทธิ์เข้าหน้า Approver */
function requireApprover() {
  const role = localStorage.getItem("up_user_role");
  if (role !== "approver" && role !== "admin") {
    alert("คุณไม่มีสิทธิ์เข้าหน้านี้");
    window.location.href = "dashboard.html";
  }
}
