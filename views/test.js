try {
    let jsonData = document.getElementById('questions-data').value;
    const cleanedJsonData = jsonData.replace(/&quot;/g, '"');
    const questions = JSON.parse(cleanedJsonData);

    const questionContainer = document.getElementById('question-container');
    const questionNumber = document.getElementById('question-number');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const saveProgressBtn = document.getElementById('save-progress-btn');
    const reviewBtn = document.getElementById('review-btn');
    const endExamBtn = document.getElementById('end-exam-btn');
    let currentQuestionIndex =  0;

    let selectedAnswers = {};
    let totalMarks = 0;
    let totalTime = 600; // Total time in seconds (e.g., 10 minutes)
    const timerElement = document.getElementById('time-left');

    function renderQuestion(index) {
      if (!questions || questions.length === 0) {
        questionContainer.textContent = 'No questions available.';
        return;
      }

      const question = questions[index];
      questionContainer.innerHTML = ''; // Clear previous content

      const questionText = document.createElement('p');
      questionText.textContent = `Q. ${question.question} (marks ${question.marks})`;
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
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === questions.length - 1;

      updateProgressBar();
    }

    function saveAnswer() {
      const selectedOption = document.querySelector('input[name="answer"]:checked');
      if (selectedOption) {
        selectedAnswers[currentQuestionIndex] = selectedOption.value;
      } else {
        delete selectedAnswers[currentQuestionIndex]; // Remove answer if none is selected
      }
    }

    /*function checkAnswer() {
      const selectedOption = document.querySelector('input[name="answer"]:checked');
      if (selectedOption) {
        const correctAnswer = questions[currentQuestionIndex].Answer;
        if (selectedOption.value === correctAnswer) {
          totalMarks += parseInt(questions[currentQuestionIndex].marks);
          alert('Correct Answer!');
        } else {
          alert('Wrong Answer!');
        }
      } else {
        alert('Please select an answer.');
      }
    }*/

    function updateProgressBar() {
      const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
      document.getElementById('progress-bar').style.width = `${progress}%`;
    }

    function startTimer() {
      const timerInterval = setInterval(() => {
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        totalTime--;
        if (totalTime < 0) {
          clearInterval(timerInterval);
          alert("Time's up!");
          showReview();
        }
      }, 1000);
    }

    function showReview() {
      document.getElementById('Test-form').style.display = 'none';
      reviewBtn.style.display = 'block';

      const reviewContainer = document.createElement('div');
      questions.forEach((question, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.innerHTML = `<p>Q. ${question.question} <br> Your answer: ${selectedAnswers[index] || 'Not Answered'} <br> Correct answer: ${question.Answer}</p>`;
        reviewContainer.appendChild(reviewItem);
      });
      document.body.appendChild(reviewContainer);
    }

    function endExam() {
      saveAnswer();
      alert(`Test ended early! Your total score is: ${totalMarks}`);
      showReview();
    }

    saveProgressBtn.addEventListener('click', () => {
      const selectedOption = document.querySelector('input[name="answer"]:checked');
      if (selectedOption) {
        const correctAnswer = questions[currentQuestionIndex].Answer;
        if (selectedOption.value === correctAnswer) {
          totalMarks += parseInt(questions[currentQuestionIndex].marks);
        }}
      localStorage.setItem('selectedAnswers', JSON.stringify(selectedAnswers));
      localStorage.setItem('currentQuestionIndex', currentQuestionIndex);
      alert('Progress saved!');
    });

    reviewBtn.addEventListener('click', showReview);

    endExamBtn.addEventListener('click', endExam);

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

    /*submitBtn.addEventListener('click', () => {
      saveAnswer();
      checkAnswer();
      if (currentQuestionIndex === questions.length - 1) {
        alert(`Test completed! Your total score is: ${totalMarks}`);
        showReview();
      }
    });*/

    renderQuestion(currentQuestionIndex);
    startTimer();
    
  } catch (error) {
    console.error('Error parsing JSON data:', error);
  }