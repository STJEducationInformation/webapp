/* admin_approve.js */
/* ใช้ใน admin_approve.html */

const API_URL = "https://script.google.com/macros/s/AKfycbzj0tobd-Vse97msrhIIh9Pfw3-qIKjSh9ikO5YKoApBh7f4-qxu7Ed0nRLsPNINWaIDw/exec";

document.addEventListener("DOMContentLoaded", () => {
  const user = checkLogin();

  // ต้องเป็น admin หรือ approver เท่านั้น
  if (user.role !== "admin" && user.role !== "approver") {
    alert("คุณไม่มีสิทธิ์เข้าหน้านี้");
    window.location.href = "index.html";
    return;
  }

  loadRequests();

  document.getElementById("filterStatus").addEventListener("change", loadRequests);
});

/* --------------------------------------------------------
   โหลดรายการคำขอทั้งหมด
--------------------------------------------------------- */
async function loadRequests() {
  const filter = document.getElementById("filterStatus").value;
  const tbody = document.getElementById("approveTable");
  tbody.innerHTML = `<tr><td colspan="6">กำลังโหลดข้อมูล...</td></tr>`;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listAssetRequests" })
    });

    const data = await res.json();
    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="6">โหลดข้อมูลล้มเหลว</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    data.data
      .filter(row => filter === "all" || row.status === filter)
      .forEach(row => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${row.date || "-"}</td>
          <td>${row.assetName || "-"}</td>
          <td>${row.fullName || "-"}</td>
          <td>${row.priceWithVat || "-"}</td>
          <td class="status">${row.status || "-"}</td>
          <td>
            <button class="approve-btn" onclick="approve('${row.requestId}')">อนุมัติ</button>
            <button class="reject-btn" onclick="reject('${row.requestId}')">ไม่อนุมัติ</button>
            <button class="print-btn" onclick="printRequest('${row.requestId}')">พิมพ์</button>
          </td>
        `;

        tbody.appendChild(tr);
      });

    if (tbody.innerHTML === "") {
      tbody.innerHTML = `<tr><td colspan="6">ไม่มีข้อมูลในสถานะนี้</td></tr>`;
    }

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6">เกิดข้อผิดพลาด</td></tr>`;
  }
}

/* --------------------------------------------------------
   อนุมัติคำขอ
--------------------------------------------------------- */
async function approve(requestId) {
  if (!confirm("ต้องการอนุมัติคำขอนี้ใช่หรือไม่?")) return;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approveAssetRequest",
        requestId
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("อนุมัติคำขอสำเร็จ");
      loadRequests();
    } else {
      alert("อนุมัติไม่สำเร็จ: " + data.message);
    }

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดในการอนุมัติ");
  }
}

/* --------------------------------------------------------
   ไม่อนุมัติคำขอ
--------------------------------------------------------- */
async function reject(requestId) {
  const reason = prompt("กรุณาระบุเหตุผลที่ไม่อนุมัติ:");

  if (reason === null) return; // user cancelled

  if (reason.trim().length < 5) {
    alert("กรุณาระบุเหตุผลอย่างน้อย 5 ตัวอักษร");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "rejectAssetRequest",
        requestId,
        reason
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("ทำรายการไม่อนุมัติสำเร็จ");
      loadRequests();
    } else {
      alert("ไม่อนุมัติไม่สำเร็จ: " + data.message);
    }

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาด");
  }
}

/* --------------------------------------------------------
   พิมพ์คำขอ
--------------------------------------------------------- */
async function printRequest(requestId) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getPrintableAssetForm",
        requestId
      })
    });

    const data = await res.json();

    if (data.success) {
      window.open(data.url, "_blank");
    } else {
      alert("ไม่สามารถพิมพ์ได้");
    }

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาด");
  }
}
