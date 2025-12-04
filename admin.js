/* admin.js */
/* ใช้ใน admin.html */

const API_URL = "https://script.google.com/macros/s/AKfycbzj0tobd-Vse97msrhIIh9Pfw3-qIKjSh9ikO5YKoApBh7f4-qxu7Ed0nRLsPNINWaIDw/exec";

document.addEventListener("DOMContentLoaded", () => {
  const user = checkLogin();
  requireAdmin(); // บังคับเฉพาะผู้มีสิทธิ์ admin เท่านั้น

  loadAdmins();

  document.getElementById("adminForm").addEventListener("submit", saveAdmin);
});

/* --------------------------------------------------------
   โหลดรายชื่อผู้ใช้งานทั้งหมดจากชีท Admins
--------------------------------------------------------- */
async function loadAdmins() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listAdmins" })
    });

    const data = await res.json();

    if (!data.success) {
      alert("โหลดรายชื่อผู้ใช้ล้มเหลว");
      return;
    }

    const tbody = document.getElementById("adminTable");
    tbody.innerHTML = "";

    data.data.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.email}</td>
        <td>${item.name}</td>
        <td>${item.role}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editAdmin('${item.email}', '${item.name}', '${item.role}')">
            แก้ไข
          </button>
          <button class="action-btn delete-btn" onclick="deleteAdmin('${item.email}')">
            ลบ
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
  }
}

/* --------------------------------------------------------
   เพิ่มหรือแก้ไขสิทธิ์ผู้ใช้
--------------------------------------------------------- */
async function saveAdmin(e) {
  e.preventDefault();

  const email = document.getElementById("adminEmail").value.trim();
  const name  = document.getElementById("adminName").value.trim();
  const role  = document.getElementById("adminRole").value;

  if (!email.endsWith("@up.ac.th")) {
    alert("ต้องเป็นอีเมลโดเมน @up.ac.th เท่านั้น");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addAdmin",
        email,
        name,
        role
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("บันทึกสิทธิ์สำเร็จ");
      document.getElementById("adminForm").reset();
      loadAdmins();
    } else {
      alert("บันทึกไม่สำเร็จ: " + data.message);
    }

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
}

/* --------------------------------------------------------
   ดึงข้อมูลของผู้ใช้มาแก้ไข
--------------------------------------------------------- */
function editAdmin(email, name, role) {
  document.getElementById("adminEmail").value = email;
  document.getElementById("adminName").value = name;
  document.getElementById("adminRole").value = role;
}

/* --------------------------------------------------------
   ลบผู้ใช้
--------------------------------------------------------- */
async function deleteAdmin(email) {
  if (!confirm("ต้องการลบผู้ใช้นี้ใช่หรือไม่?")) return;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deleteAdmin",
        email
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("ลบผู้ใช้สำเร็จ");
      loadAdmins();
    } else {
      alert("ลบไม่สำเร็จ: " + data.message);
    }

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดในการลบข้อมูล");
  }
}
