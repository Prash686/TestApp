document.addEventListener('DOMContentLoaded', () => {
    let jsonData = document.getElementById('questions-data').value;
    const cleanedJsonData = jsonData.replace(/&quot;/g, '"');
    const questions = JSON.parse(cleanedJsonData);

    const questionContainer = document.getElementById('question-container');
    const questionNumber = document.getElementById('question-number');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const modal = new bootstrap.Modal(document.getElementById('modal'));
    const modalMessage = document.getElementById('modal-message');
    const modalClose = document.getElementById('modal-close');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    let currentQuestionIndex = 0;
    const selectedAnswers = {};

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

        if (selectedAnswers[index] === i.toString()) {
          input.checked = true;
        }

        div.appendChild(input);
        div.appendChild(label);
        questionContainer.appendChild(div);
      }

      questionNumber.textContent = index + 1;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === questions.length - 1;
    }

    function saveAnswer() {
      const selectedOption = document.querySelector('input[name="answer"]:checked');
      if (selectedOption) {
        selectedAnswers[currentQuestionIndex] = selectedOption.value;
      }
    }

    function showModal(message) {
      modalMessage.textContent = message;
      modal.show();
    }

    modalClose.addEventListener('click', () => {
      modal.hide();
    });

    modalCloseBtn.addEventListener('click', () => {
      modal.hide();
    });

    function checkAnswer() {
      const selectedOption = document.querySelector('input[name="answer"]:checked');
      if (selectedOption) {
        const correctAnswer = questions[currentQuestionIndex].Answer;
        if (selectedOption.value === correctAnswer) {
          showModal('Correct Answer!');
        } else {
          showModal('Wrong Answer!');
        }
      } else {
        showModal('Please select an answer.');
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

    renderQuestion(currentQuestionIndex);
  });