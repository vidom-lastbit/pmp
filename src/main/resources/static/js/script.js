// src/main/resources/static/js/script.js

document.addEventListener("DOMContentLoaded", initializeApp);

const questionsContainer = document.getElementById("questions-container");
const quizForm = document.getElementById("quiz-form");
const resultsDiv = document.getElementById("results");

// Nút điều khiển
const submitBtn = document.getElementById("submit-btn-top");
const retryBtn = document.getElementById("retry-btn-top");
const startQuizBtn = document.getElementById("start-quiz-btn");
const randomQuizBtn = document.getElementById("random-quiz");

// Modal
const resultModal = document.getElementById("result-modal");
const closeModalBtn = document.querySelector(".close-btn");
const viewDetailBtn = document.getElementById("view-detail-btn");
const retryModalBtn = document.getElementById("retry-modal-btn");
const quizContent = document.getElementById("quiz-content");

// Trạng thái
let currentQuestions = []; // Mảng câu hỏi gốc + displayId (sau khi xáo)
let isQuizSubmitted = false;

/* ============================================================ */
/*  INITIALIZE APP                                              */
/* ============================================================ */
function initializeApp() {
  submitBtn.classList.add("hidden");
  retryBtn.classList.add("hidden");

  startQuizBtn.addEventListener("click", startQuiz);

  // Nộp bài từ nút bên phải
  submitBtn.addEventListener("click", () => {
    if (!submitBtn.disabled && !isQuizSubmitted) {
      quizForm.dispatchEvent(new Event("submit", { cancelable: true }));
    }
  });

  // Làm lại
  retryBtn.addEventListener("click", resetQuizState);
  retryModalBtn.addEventListener("click", resetQuizState);

  // Đóng modal
  closeModalBtn.addEventListener("click", () =>
    resultModal.classList.add("hidden")
  );
  resultModal.addEventListener("click", (e) => {
    if (e.target === resultModal) resultModal.classList.add("hidden");
  });

  // Xem chi tiết đáp án
  viewDetailBtn.addEventListener("click", () => {
    resultModal.classList.add("hidden");
    resultsDiv.classList.remove("hidden");
    quizContent.classList.remove("hidden");
  });
}

/* ============================================================ */
function resetQuizState() {
  window.location.reload();
}

/* ============================================================ */
function startQuiz() {
  startQuizBtn.disabled = true;
  startQuizBtn.textContent = "Đang tải...";
  quizContent.classList.remove("hidden");
  resultsDiv.classList.add("hidden");
  fetchQuestions();
}

/* ============================================================ */
/*  1. TẢI CÂU HỎI                                            */
/* ============================================================ */
async function fetchQuestions() {
  try {
    const response = await fetch("/api/questions");
    if (!response.ok) throw new Error("Lỗi server");
    const questions = await response.json();

    currentQuestions = questions;
    document.getElementById("question-count").textContent = questions.length;
    renderQuestions(questions);

    submitBtn.disabled = false;
    submitBtn.classList.remove("hidden");
    startQuizBtn.classList.add("hidden");
  } catch (err) {
    questionsContainer.innerHTML =
      '<p style="color:red;">Không tải được câu hỏi!</p>';
    console.error(err);
    retryBtn.classList.remove("hidden");
  }
}

/* ============================================================ */
/*  2. HIỂN THỊ CÂU HỎI (hỗ trợ displayId khi xáo trộn)      */
/* ============================================================ */
function renderQuestions(questions) {
  questionsContainer.innerHTML = "";

  questions.forEach((q) => {
    const displayNumber = q.displayId || q.id; // dùng displayId nếu đã xáo

    const block = document.createElement("div");
    block.className = "question-block";
    block.setAttribute("data-id", q.id);

    block.innerHTML = `
      <p class="question-text">Câu ${displayNumber}: ${q.question}</p>
      <div class="options">
        ${createOptionHtml(q.id, "A", q.optionA)}
        ${createOptionHtml(q.id, "B", q.optionB)}
        ${createOptionHtml(q.id, "C", q.optionC)}
        ${createOptionHtml(q.id, "D", q.optionD)}
      </div>
    `;
    questionsContainer.appendChild(block);
  });
}

function createOptionHtml(qId, key, value) {
  return `
    <label class="option-label">
      <input type="radio" name="question_${qId}" value="${key}">
      <b>${key}.</b> ${value}
    </label>
  `;
}

/* ============================================================ */
/*  3. NỘP BÀI                                                */
/* ============================================================ */
quizForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isQuizSubmitted) return;

  submitBtn.disabled = true;
  isQuizSubmitted = true;

  const userAnswers = collectUserAnswers();

  try {
    const resp = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: userAnswers }),
    });
    if (!resp.ok) throw new Error("Lỗi nộp bài");

    const result = await resp.json();
    displayResults(result);
    highlightAnswers(userAnswers, result.correct_answers);

    submitBtn.classList.add("hidden");
    retryBtn.classList.remove("hidden");

    document
      .querySelectorAll('input[type="radio"]')
      .forEach((r) => (r.disabled = true));
  } catch (err) {
    alert("Lỗi khi nộp bài!");
    console.error(err);
    submitBtn.disabled = false;
    isQuizSubmitted = false;
  }
});

function collectUserAnswers() {
  const answers = {};
  document.querySelectorAll(".question-block").forEach((b) => {
    const id = b.getAttribute("data-id");
    const sel = b.querySelector(`input[name="question_${id}"]:checked`);
    answers[id] = sel ? sel.value : "";
  });
  return answers;
}

/* ============================================================ */
/*  4. HIỆN MODAL KẾT QUẢ                                    */
/* ============================================================ */
function displayResults(result) {
  document.getElementById("modal-score").textContent = result.score;
  document.getElementById("modal-total").textContent = result.total;
  document.getElementById("score-display").textContent = result.score;
  document.getElementById("total-display").textContent = result.total;

  const percent = Math.round((result.score / result.total) * 100);
  const msg = document.getElementById("score-message");
  if (percent >= 90) {
    msg.textContent = "Xuất sắc!";
    msg.style.color = "#28a745";
  } else if (percent >= 70) {
    msg.textContent = "Rất tốt!";
    msg.style.color = "#28a745";
  } else if (percent >= 50) {
    msg.textContent = "Cần cố gắng hơn nhé!";
    msg.style.color = "#ffc107";
  } else {
    msg.textContent = "Học lại đi nào!";
    msg.style.color = "#dc3545";
  }

  resultModal.classList.remove("hidden");
  quizContent.classList.add("hidden");
}

/* ============================================================ */
/*  5. TÔ MÀU ĐÁP ÁN                                          */
/* ============================================================ */
function highlightAnswers(userAnswers, correctAnswers) {
  document.querySelectorAll(".question-block").forEach((block) => {
    const qId = block.getAttribute("data-id");
    const user = userAnswers[qId];
    const correct = correctAnswers[qId];

    const userLabel = block
      .querySelector(`input[value="${user}"]`)
      ?.closest(".option-label");
    const correctLabel = block
      .querySelector(`input[value="${correct}"]`)
      ?.closest(".option-label");

    if (user === correct && userLabel) {
      userLabel.classList.add("correct-answer");
    } else {
      if (userLabel) userLabel.classList.add("incorrect-answer");
      if (correctLabel) correctLabel.classList.add("correct-answer");
    }
  });
}

/* ============================================================ */
/*  6. XÁO TRỘN CÂU HỎI – CHỨC NĂNG MỚI                      */
/* ============================================================ */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

randomQuizBtn.addEventListener("click", () => {
  if (currentQuestions.length === 0) {
    alert("Chưa có câu hỏi nào để xáo trộn!");
    return;
  }

  if (isQuizSubmitted) {
    if (!confirm("Bạn đã nộp bài. Xáo trộn sẽ làm lại từ đầu. Tiếp tục?"))
      return;
    resetQuizState();
    return;
  }

  // Xáo trộn
  const shuffled = shuffleArray(currentQuestions);

  // Gán số thứ tự hiển thị mới (Câu 1, Câu 2 …)
  shuffled.forEach((q, idx) => (q.displayId = idx + 1));

  // Render lại
  renderQuestions(shuffled);

  // Cuộn lên đầu để người dùng thấy ngay sự thay đổi
  document.querySelector(".container").scrollTop = 0;

  // Hiệu ứng vui
  randomQuizBtn.textContent = "Đã xáo trộn!";
  setTimeout(() => (randomQuizBtn.textContent = "Xáo trộn câu hỏi"), 1500);
});
