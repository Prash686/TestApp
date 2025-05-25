document.addEventListener('DOMContentLoaded', () => {
  let jsonData = document.getElementById('questions-data').value;
  const cleanedJsonData = jsonData.replace(/"/g, '"');
  const questions = JSON.parse(cleanedJsonData);
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
  const checkmarkSvg = document.querySelector('.checkmark');
  const crossmarkSvg = document.querySelector('.crossmark');

  let currentQuestionIndex = 0;
  const selectedAnswers = {};

  // Function to render the current question
  function renderQuestion(index) {
    if (!questions || questions.length === 0) {
      questionContainer.textContent = 'No questions available.';
      return;
    }

    const question = questions[index];
    questionContainer.innerHTML = '';

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
    jumpToInput.placeholder = `Q. ${index + 1}`; // Update placeholder
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === questions.length - 1;
  }

  // Function to save the selected answer
  function saveAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
      selectedAnswers[currentQuestionIndex] = selectedOption.value;
    }
  }

  // Function to show modal with message
  function showModal(message, isCorrect = false) {
    if (isCorrect) {
      // Show and animate the checkmark SVG
      checkmarkSvg.style.display = 'block';
      crossmarkSvg.style.display = 'none';

      // Reset animation by removing and re-adding classes
      checkmarkSvg.classList.remove('animate__animated', 'animate__fadeIn');
      void checkmarkSvg.offsetWidth; // Trigger reflow
      checkmarkSvg.classList.add('animate__animated', 'animate__fadeIn');
    } else {
      // Show and animate the crossmark SVG
      crossmarkSvg.style.display = 'block';
      checkmarkSvg.style.display = 'none';

      // Reset animation by removing and re-adding classes
      crossmarkSvg.classList.remove('animate__animated', 'animate__fadeIn');
      void crossmarkSvg.offsetWidth; // Trigger reflow
      crossmarkSvg.classList.add('animate__animated', 'animate__fadeIn');
    }
    modalMessage.textContent = message;
    modal.show();
  }

  // Close modal event listeners
  modalClose.addEventListener('click', () => {
    modal.hide();
  });

  modalCloseBtn.addEventListener('click', () => {
    modal.hide();
  });

  // Add event listeners for Bootstrap modal events to manage inert attribute and aria-hidden
  modal._element.addEventListener('shown.bs.modal', () => {
    modal._element.removeAttribute('inert');
    modal._element.removeAttribute('aria-hidden');
  });

  modal._element.addEventListener('hidden.bs.modal', () => {
    modal._element.setAttribute('inert', '');
    modal._element.removeAttribute('aria-hidden');
  });

  // Function to check if the selected answer is correct
  function checkAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
      const correctAnswer = questions[currentQuestionIndex].Answer;
      if (selectedOption.value === correctAnswer) {
        showModal('🎉 Correct Answer!', true);
      } else {
        showModal('❌ Wrong Answer!');
      }
    } else {
      showModal('Please select an answer.');
    }
  }

  // Handle Previous button click
  prevBtn.addEventListener('click', () => {
    saveAnswer();
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion(currentQuestionIndex);
    }
  });

  // Handle Next button click
  nextBtn.addEventListener('click', () => {
    saveAnswer();
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuestion(currentQuestionIndex);
    }
  });

  // Handle Submit button click
  submitBtn.addEventListener('click', () => {
    saveAnswer();
    checkAnswer();
  });

  // Handle Jump button click
  jumpBtn.addEventListener('click', () => {
    const questionNumber = parseInt(jumpToInput.value);

    // Check if input is valid
    if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > questions.length) {
      alert(`Please enter a valid question number between 1 and ${questions.length}.`);
    } else {
      saveAnswer();
      currentQuestionIndex = questionNumber - 1; // Set 0-based index
      renderQuestion(currentQuestionIndex);
    }
  });

  // Initial rendering of the first question
  renderQuestion(currentQuestionIndex);
});
