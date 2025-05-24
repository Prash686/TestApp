document.addEventListener('DOMContentLoaded', () => {
  const rawData = document.getElementById('questions-data').value;
  const questions = JSON.parse(rawData);
  const questionContainer = document.getElementById('question-container');
  const questionNumber = document.getElementById('question-number');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const jumpToInput = document.getElementById('jump-to-input');
  const jumpBtn = document.getElementById('jump-btn');
  const modal = new bootstrap.Modal(document.getElementById('modal'));
  const modalMessage = document.getElementById('modal-message');
  const modalClose = document.getElementById('modal-close');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  let currentQuestionIndex = 0;
  const selectedAnswers = {};

  function renderQuestion(index) {

    const question = questions[index];
    questionContainer.classList.remove('animate__zoomIn'); // reset if needed
    void questionContainer.offsetWidth; // reflow trick
    questionContainer.classList.add('animate__animated', 'animate__zoomIn');


    const questionText = document.createElement('p');
    questionText.textContent = `Q. ${question.question} (marks ${question.marks})`;
    questionText.classList.add('mb-3', 'fw-bold');
    questionContainer.appendChild(questionText);

    for (let i = 1; i <= 4; i++) {
      const div = document.createElement('div');
      div.classList.add('form-check');

      const input = document.createElement('input');
      input.type = 'radio';
      input.classList.add('form-check-input');
      input.name = 'answer';
      input.id = `option${i}`;
      input.value = `option${i}`;

      const label = document.createElement('label');
      label.classList.add('form-check-label');
      label.setAttribute('for', `option${i}`);
      label.textContent = `${i}) ${question[`option${i}`]}`;

      if (selectedAnswers[index] === `option${i}`) {
        input.checked = true;
      }

      div.appendChild(input);
      div.appendChild(label);
      questionContainer.appendChild(div);
    }

    questionNumber.textContent = index + 1;
    jumpToInput.placeholder = `Q. ${index + 1}`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === questions.length - 1;
  }

  function saveAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
      selectedAnswers[currentQuestionIndex] = selectedOption.value;
    }
  }

  function showModal(message, type) {
    const correctPopup = document.getElementById("correct-popup");
    const wrongPopup = document.getElementById("wrong-popup");
    correctPopup.classList.add("d-none");
    wrongPopup.classList.add("d-none");
    modalMessage.textContent = message;
     if (type === "correct") {
        correctPopup.classList.remove("d-none");
        setTimeout(() => correctPopup.classList.add("d-none"), 2000);
      } else if (type === "wrong") {
        wrongPopup.classList.remove("d-none");
        setTimeout(() => wrongPopup.classList.add("d-none"), 2000);
      }
    modal.show();
  }

  modalClose.addEventListener('click', () => modal.hide());
  modalCloseBtn.addEventListener('click', () => modal.hide());

  function checkAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    const correctAnswer = questions[currentQuestionIndex].Answer;

    if (!selectedOption) {
      showModal('Please select an answer.');
    } else if (selectedOption.value === correctAnswer) {
      showModal('🎉 Correct Answer!',"correct");
    } else {
      showModal(`❌ Wrong Answer. Correct is: ${correctAnswer.replace('option', '')}) ${questions[currentQuestionIndex][correctAnswer]}`,"wrong");
    }
  }

  prevBtn.addEventListener('click', () => {
    saveAnswer();
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion(currentQuestionIndex);
    }
  });

  nextBtn.addEventListener('click', () => {
    saveAnswer();
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuestion(currentQuestionIndex);
    }
  });

  submitBtn.addEventListener('click', () => {
    saveAnswer();
    checkAnswer();
  });

  jumpBtn.addEventListener('click', () => {
    const number = parseInt(jumpToInput.value);
    if (!number || number < 1 || number > questions.length) {
      showModal(`Please enter a valid question number between 1 and ${questions.length}.`);
    } else {
      saveAnswer();
      currentQuestionIndex = number - 1;
      renderQuestion(currentQuestionIndex);
    }
  });

  renderQuestion(currentQuestionIndex);
});
