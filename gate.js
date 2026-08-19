/**
 * Lightweight passphrase gate.
 *
 * NOTE: this is a courtesy gate, not real security. Everything below runs in
 * the browser, so anyone can read this file, inspect the page source, or fetch
 * index.html directly. Do not put anything genuinely private behind it.
 */
const PASSPHRASE_SHA256 =
  "d4ec96e488824f6f387e4fb23397e8f82a2e828bbf28a72ead236d9e79c275f4";

const gate = document.getElementById("gate");
const form = document.getElementById("gate-form");
const input = document.getElementById("gate-input");
const errorMessage = document.getElementById("gate-error");

function unlock() {
  document.documentElement.classList.remove("locked");
  gate.hidden = true;
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function reject() {
  errorMessage.hidden = false;
  gate.classList.add("shake");
  input.value = "";
  input.focus();
  setTimeout(() => gate.classList.remove("shake"), 450);
}

if (document.documentElement.classList.contains("locked")) {
  gate.hidden = false;
  input.focus();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.hidden = true;

    // crypto.subtle needs a secure context (https or localhost).
    if (!window.crypto?.subtle) {
      errorMessage.textContent =
        "This gate needs a secure (https) connection to work.";
      errorMessage.hidden = false;
      return;
    }

    const attempt = await sha256(input.value.trim());

    if (attempt === PASSPHRASE_SHA256) {
      sessionStorage.setItem("nz-gate", "open");
      unlock();
    } else {
      reject();
    }
  });
} else {
  unlock();
}
