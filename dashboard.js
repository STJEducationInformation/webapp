/* dashboard.js */
/* ใช้ใน dashboard.html */

const API_URL = "https://script.google.com/macros/s/AKfycbzj0tobd-Vse97msrhIIh9Pfw3-qIKjSh9ikO5YKoApBh7f4-qxu7Ed0nRLsPNINWaIDw/exec";

// เมื่อหน้าโหลดเสร็จ
document.addEventListener("DOMContentLoaded", async () => {
  const user = checkLogin(); // ตรวจ login

  loadDashboardData();
});

async function loadDashboardData() {
  document.getElementById("loading").style.display = "block";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getDashboardData"
      })
    });

    const data = await res.json();

    if (!data.success) {
      document.getElementById("loading").innerText = "ไม่สามารถโหลดข้อมูลได้";
      return;
    }

    document.getElementById("totalAll").innerText       = data.totalAll;
    document.getElementById("totalPending").innerText   = data.totalPending;
    document.getElementById("totalApproved").innerText  = data.totalApproved;
    document.getElementById("totalRejected").innerText  = data.totalRejected;

    document.getElementById("loading").style.display = "none";

  } catch (err) {
    console.error(err);
    document.getElementById("loading").innerText = "เกิดข้อผิดพลาดในการโหลดข้อมูล";
  }
}
