/* asset.js */
/* ใช้ใน asset.html */

const API_URL = "https://script.google.com/macros/s/AKfycbzj0tobd-Vse97msrhIIh9Pfw3-qIKjSh9ikO5YKoApBh7f4-qxu7Ed0nRLsPNINWaIDw/exec";

// เมื่อโหลดหน้า
document.addEventListener("DOMContentLoaded", () => {
  const user = checkLogin();
  document.getElementById("email").value = user.email;
  document.getElementById("fullName").value = user.name;

  loadMyRequests();

  document.getElementById("assetForm").addEventListener("submit", submitForm);
});

/* ------------------------------
   โหลดรายการคำขอของผู้ใช้
-------------------------------- */
async function loadMyRequests() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listAssetRequests" })
    });

    const data = await res.json();
    if (!data.success) return;

    const email = localStorage.getItem("up_user_email");
    const tb = document.getElementById("myRequestTable");
    tb.innerHTML = "";

    data.data
      .filter(r => r.email === undefined || r.email === email || true) // ส่วนนี้รองรับโครงสร้างของคุณ
      .forEach(r => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${r.date || "-"}</td>
          <td>${r.assetName || "-"}</td>
          <td>${r.quantity || "-"}</td>
          <td>${r.priceWithVat || "-"}</td>
          <td>${r.status || "-"}</td>
          <td>
            <button class="print-btn" onclick="printRequest('${r.requestId}')">
              พิมพ์
            </button>
          </td>
        `;

        tb.appendChild(tr);
      });

  } catch (err) {
    console.error(err);
  }
}

/* ------------------------------
   ปุ่มพิมพ์
-------------------------------- */
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
      alert("ไม่สามารถพิมพ์เอกสารได้");
    }

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาด");
  }
}

/* ------------------------------
   Validate ราคาตามกฎ
-------------------------------- */
function isValidPrice(value) {
  if (value < 10000) return false;

  const str = value.toString();
  if (!str.endsWith("000")) return false;

  return true;
}

/* ------------------------------
   Validate เหตุผล 20–500 ตัวอักษร
-------------------------------- */
function isValidReason(text) {
  return text.length >= 20 && text.length <= 500;
}

/* ------------------------------
   ตรวจซ้ำรหัสครุภัณฑ์
-------------------------------- */
async function checkDuplicate(assetCode, assetName) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "checkDuplicateEquipment",
      assetCode,
      assetName
    })
  });

  return res.json();
}

/* ------------------------------
   Submit Form (Multipart)
-------------------------------- */
async function submitForm(e) {
  e.preventDefault();

  /* อ่านค่า */
  const requestDate = document.getElementById("requestDate").value;
  const email       = document.getElementById("email").value;
  const fullName    = document.getElementById("fullName").value;
  const position    = document.getElementById("position").value;
  const assetType   = document.getElementById("assetType").value;
  const department  = document.getElementById("department").value;
  const priority    = document.getElementById("priority").value;
  const assetNature = document.getElementById("assetNature").value;
  const assetCode   = document.getElementById("assetCode").value.trim();
  const assetName   = document.getElementById("assetName").value.trim();
  const quantity    = parseInt(document.getElementById("quantity").value);
  const unit        = document.getElementById("unit").value;
  const priceCategory = document.getElementById("priceCategory").value;

  const priceWithVat = parseInt(document.getElementById("priceWithVat").value);
  const reason       = document.getElementById("reason").value;

  const quote1Price  = parseInt(document.getElementById("quote1Price").value);
  const quote2Price  = parseInt(document.getElementById("quote2Price").value);

  /* ---------------- Validate ---------------- */

  if (!isValidPrice(priceWithVat)) {
    alert("ราคาครุภัณฑ์รวม VAT ต้อง ≥ 10,000 และหลักร้อย/สิบ/หน่วย = 0 เช่น 11,000");
    return;
  }

  if (!isValidPrice(quote1Price)) {
    alert("ราคา คู่เทียบ 1 ผิดเกณฑ์ (ต้องลงท้ายด้วย 000)");
    return;
  }

  if (!isValidPrice(quote2Price)) {
    alert("ราคา คู่เทียบ 2 ผิดเกณฑ์ (ต้องลงท้ายด้วย 000)");
    return;
  }

  if (!isValidReason(reason)) {
    alert("เหตุผลต้องมีความยาวอย่างน้อย 20 ตัวอักษร และไม่เกิน 500 ตัวอักษร");
    return;
  }

  /* ตรวจรายการซ้ำ */
  const dup = await checkDuplicate(assetCode, assetName);
  if (dup.success && dup.data.isDuplicate) {
    const lastDate = dup.data.lastDate || "-";
    const lastStatus = dup.data.lastStatus || "-";

    if (lastStatus !== "ไม่อนุมัติ") {
      alert(`❌ รายการซ้ำในระบบ\nวันที่ขอครั้งล่าสุด: ${lastDate}\nสถานะ: ${lastStatus}`);
      return;
    }
  }

  /* ---------------- Prepare FormData ---------------- */

  const fd = new FormData();
  fd.append("action", "createAssetRequest");

  fd.append("requestDate", requestDate);
  fd.append("email", email);
  fd.append("fullName", fullName);
  fd.append("position", position);
  fd.append("assetType", assetType);
  fd.append("department", department);
  fd.append("priority", priority);
  fd.append("assetNature", assetNature);
  fd.append("assetCode", assetCode);
  fd.append("assetName", assetName);
  fd.append("quantity", quantity);
  fd.append("unit", unit);
  fd.append("priceCategory", priceCategory);
  fd.append("priceWithVat", priceWithVat);
  fd.append("reason", reason);
  fd.append("quote1Price", quote1Price);
  fd.append("quote2Price", quote2Price);

  /* ไฟล์ */
  fd.append("specFile", document.getElementById("specFile").files[0]);
  fd.append("quoteMain", document.getElementById("quoteMain").files[0]);
  fd.append("quote1", document.getElementById("quote1").files[0]);
  fd.append("quote2", document.getElementById("quote2").files[0]);
  fd.append("attachment", document.getElementById("attachment").files[0] || "");

  /* ส่งไป Apps Script */
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: fd
    });

    const data = await res.json();

    if (data.success) {
      alert("บันทึกคำขอสำเร็จ");
      document.getElementById("assetForm").reset();
      loadMyRequests();
    } else {
      alert("บันทึกไม่สำเร็จ: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดระหว่างส่งข้อมูล");
  }
}
