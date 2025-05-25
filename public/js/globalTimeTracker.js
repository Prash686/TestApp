(() => {
  let startTime = Date.now();
  let totalTimeSpent = 0;

  // Function to send time spent to backend
  async function sendTimeSpent(timeSpent) {
    try {
      const response = await fetch('/user/timeSpent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ timeSpent })
      });
      if (!response.ok) {
        console.error('Failed to send time spent data');
      }
    } catch (error) {
      console.error('Error sending time spent data:', error);
    }
  }

  // On page unload, calculate time spent and send to backend
  window.addEventListener('beforeunload', () => {
    const endTime = Date.now();
    totalTimeSpent += endTime - startTime;
    // Send time spent in seconds
    navigator.sendBeacon('/user/timeSpent', JSON.stringify({ timeSpent: Math.floor(totalTimeSpent / 1000) }));
  });

  // Optional: send time spent periodically every 5 minutes
  setInterval(() => {
    const now = Date.now();
    totalTimeSpent += now - startTime;
    startTime = now;
    sendTimeSpent(Math.floor(totalTimeSpent / 1000));
  }, 5 * 60 * 1000);

  // Reset startTime on visibility change (e.g., tab switch)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const now = Date.now();
      totalTimeSpent += now - startTime;
      startTime = now;
      sendTimeSpent(Math.floor(totalTimeSpent / 1000));
    } else if (document.visibilityState === 'visible') {
      startTime = Date.now();
    }
  });
})();
