/* new_asset.js */
/* ใช้ใน new_asset.html */

const API_URL = "https://script.google.com/macros/s/AKfycbzj0tobd-Vse97msrhIIh9Pfw3-qIKjSh9ikO5YKoApBh7f4-qxu7Ed0nRLsPNINWaIDw/exec";

/* เมื่อหน้าโหลดเสร็จ */
document.addEventListener("DOMContentLoaded", () => {
  const user = checkLogin();

  document.getElementById("email").value = user.email;
  document.getElementById("fullName").value = user.name;

  loadNewAssetRequests();

  document.getElementById("newAssetForm").addEventListener("submit", submitNewAssetForm);
});

/* ตรวจความถูกต้องของราคา */
function isValidPrice(value) {
  if (value < 10000) return false;
  return value.toString().endsWith("000");
}

/* ตรวจเหตุผล */
function isValidReason(text) {
  return text.length >= 20 && text.length <= 500;
}

/* โหลดรายการคำขอครุภัณฑ์ใหม่ */
async function loadNewAssetRequests() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "listNewAssetRequests"
      })
    });

    const data = await res.json();
    if (!data.success) return;

    const email = localStorage.getItem("up_user_email");

    const tbody = document.getElementById("newAssetTable");
    tbody.innerHTML = "";

    data.data
      .filter(r => r.email === email)
      .forEach(r => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${r.date || "-"}</td>
          <td>${r.newAssetName || "-"}</td>
          <td>${r.estimatePrice || "-"}</td>
          <td>${r.status || "-"}</td>
          <td><button class="print-btn" onclick="printNewAsset('${r.requestId}')">พิมพ์</button></td>
        `;

        tbody.appendChild(tr);
      });

  } catch (err) {
    console.error(err);
  }
}

/* พิมพ์คำขอ */
async function printNewAsset(requestId) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "printNewAssetRequest",
        requestId
      })
    });

    const data = await res.json();
    if (data.success) window.open(data.url, "_blank");
    else alert("ไม่สามารถพิมพ์เอกสารได้");

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาด");
  }
}

/* ส่งฟอร์มครุภัณฑ์ใหม่ */
async function submitNewAssetForm(e) {
  e.preventDefault();

  const requestDate   = document.getElementById("requestDate").value;
  const email         = document.getElementById("email").value;
  const fullName      = document.getElementById("fullName").value;
  const position      = document.getElementById("position").value;
  const newAssetName  = document.getElementById("newAssetName").value;
  const reason        = document.getElementById("reason").value;
  const estimatePrice = parseInt(document.getElementById("estimatePrice").value);
  const details       = document.getElementById("details").value;
  const attachment    = document.getElementById("attachment").files[0] || "";

  /* Validate */
  if (!isValidPrice(estimatePrice)) {
    alert("ราคาประมาณการต้อง ≥ 10,000 และต้องลงท้ายด้วย 000 เช่น 15,000");
    return;
  }

  if (!isValidReason(reason)) {
    alert("เหตุผลต้องมีความยาว 20–500 ตัวอักษร");
    return;
  }

  /* FormData */
  const fd = new FormData();
  fd.append("action", "createNewAssetRequest");
  fd.append("requestDate", requestDate);
  fd.append("email", email);
  fd.append("fullName", fullName);
  fd.append("position", position);
  fd.append("newAssetName", newAssetName);
  fd.append("reason", reason);
  fd.append("estimatePrice", estimatePrice);
  fd.append("details", details);
  fd.append("attachment", attachment);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: fd
    });

    const data = await res.json();

    if (data.success) {
      alert("บันทึกคำขอสำเร็จ");
      document.getElementById("newAssetForm").reset();
      loadNewAssetRequests();
    } else {
      alert("บันทึกไม่สำเร็จ: " + data.message);
    }

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดระหว่างส่งข้อมูล");
  }
}
