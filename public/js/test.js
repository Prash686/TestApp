try {
    let jsonData = document.getElementById('questions-data').value;
    const cleanedJsonData = jsonData.replace(/&quot;/g, '"');
    const questions = JSON.parse(cleanedJsonData);

    const questionContainer = document.getElementById('question-container');
    const questionNumber = document.getElementById('question-number');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const saveProgressBtn = document.getElementById('save-progress-btn');
    const reviewBtn = document.getElementById('review-btn');
    const endExamBtn = document.getElementById('end-exam-btn');
    const messageBox = document.getElementById('message-box');
    let currentQuestionIndex =  0;

    let selectedAnswers = {};
    let totalMarks = 0;
    let totalTime = 5400;
    const timerElement = document.getElementById('time-left');
    let timerInterval;
    let examEnded = false;

    function showMessage(message, type = 'info') {
      messageBox.textContent = message;
      messageBox.className = `message-box ${type}`;
      messageBox.classList.remove('hidden');
      setTimeout(() => {
        messageBox.classList.add('hidden');
      }, 3000);
    }
    let i = 0 ;
    function renderQuestion(index) {
      if (!questions || questions.length === 0) {
        questionContainer.textContent = 'No questions available.';
        return;
      }

      const question = questions[index];
      questionContainer.innerHTML = '';
      ++i;
      const questionText = document.createElement('p');
      questionText.classList.add('question-text');
      questionText.textContent = `Q.${i} ${question.question} (marks ${question.marks})`;
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
        label.textContent = `${question[`option${i}`]}`;

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
        delete selectedAnswers[currentQuestionIndex];
      }
    }

    function updateProgressBar() {
      const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
      document.getElementById('progress-bar').style.width = `${progress}%`;
    }

    function startTimer() {
      timerInterval = setInterval(() => {
        if (examEnded) return; // Prevent timer updates if exam has ended

        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        totalTime--;
        if (totalTime < 0) {
          clearInterval(timerInterval);
          showMessage("Time's up!", 'warning');
          calculateTotalMarks();
          showReview();
        }
      }, 1000);
    }

    function calculateTotalMarks() {
      totalMarks = 0;
      questions.forEach((question, index) => {
        if (selectedAnswers[index] === question.Answer) {
          totalMarks += 1;
        }
      });
    }

    function showReview() {
      document.getElementById('form-container').style.display = 'none';
      reviewBtn.style.display = 'block';
      const testBody = document.getElementById('test');
      const reviewContainer = document.createElement('div');
      reviewContainer.id = 'review-container';

      const totalMarksElement = document.createElement('p');
      totalMarksElement.classList.add('total-marks');
      totalMarksElement.textContent = `Your total score is: ${totalMarks}`;
      reviewContainer.appendChild(totalMarksElement);
      let i = 0;
      questions.forEach((question, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.classList.add('review-item');
        ++i;
        reviewItem.innerHTML = `<p>Q.${i} ${question.question} <br>`;
  
        for (let i = 1; i <= 4; i++) {
          const optionValue = `option${i}`;
          const isCorrect = optionValue === question.Answer;
          const isSelected = selectedAnswers[index] === optionValue;

          const optionText = question[optionValue];

          let optionHTML;
          if (isCorrect) {
            optionHTML = `<span class="correct-answer">${optionText} (Correct Answer)</span>`;
          } else if (isSelected) {
            optionHTML = `<span class="wrong-answer">${optionText} (Your Answer)</span>`;
          } else {
            optionHTML = optionText;
          }

          reviewItem.innerHTML += `${optionHTML} <br>`;
        }

        reviewItem.innerHTML += `</p>`;
        reviewContainer.appendChild(reviewItem);
      });
      testBody.appendChild(reviewContainer);
    }

    async function endExam() {
      clearInterval(timerInterval);
      examEnded = true;
      saveAnswer();
      calculateTotalMarks();
      showMessage(`Test ended early! Your total score is: ${totalMarks}`, 'info');
      try {
        // Assuming subject is available globally or from questions data
        const subject = questions.length > 0 ? questions[0].subject || 'default' : 'default';
        const progressData = {
          subject: subject,
          score: totalMarks,
          outof: questions.length
        };
        await sendProgress(progressData);
        showMessage('Progress saved to server!', 'success');
      } catch (error) {
        showMessage('Failed to save progress to server.', 'error');
      }
      showReview();
    }

    saveProgressBtn.addEventListener('click', () => {
      localStorage.setItem('selectedAnswers', JSON.stringify(selectedAnswers));
      localStorage.setItem('currentQuestionIndex', currentQuestionIndex);
      showMessage('Progress saved!', 'success');
    });

    reviewBtn.addEventListener('click', () => {
      if (document.getElementById('review-container')) return; // Prevent creating multiple review containers
      showReview();
    });

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
async function sendProgress(progressData) {
    try {
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending progress:', error);
      throw error;
    }
  }
    renderQuestion(currentQuestionIndex);
    startTimer();

  } catch (error) {
    console.error('Error parsing JSON data:', error);
  }