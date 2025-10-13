// window.onload = LoadingScreen;

// function LoadingScreen() {
// //   showFPALoader();
//   setTimeout(() => {
//     document.getElementById("loader-overlay").style.display = "none";
//   }, 3000);
// }

async function showLoaderWhile(promise) {
  // Show loader
  document.getElementById("loader-overlay").style.display = "flex";
  showFPALoader()

  try {
    // Wait for API (or any async process)
    const result = await promise;
    return result;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  } finally {
    // Hide loader after API completes (success or error)
    document.getElementById("loader-overlay").style.display = "none";
  }
}

// Loaders
function showFPALoader() {
    document.getElementById("loader-overlay").style.display = "flex";

    const letters = document.querySelectorAll('.letter');
    // const progressBar = document.querySelector('.progress-bar');
    // const percentageText = document.querySelector('.percentage');
    
    // Function to animate each letter
    function animateLetter(letter, delay) {
        setTimeout(() => {
            // Fade in
            letter.style.opacity = '1';
            
            // Add rotation and shaking animation after a small delay
            setTimeout(() => {
                letter.classList.add('animate');
            }, 200);
        }, delay);
    }
    
    // Function to update progress bar color based on current letter
    // function updateProgressColor(progress) {
    //     if (progress <= 33) {
    //         // F phase - Red
    //         progressBar.style.background = '#dc3545';
    //     } else if (progress <= 66) {
    //         // P phase - Blue with gradient from red
    //         const blueIntensity = (progress - 33) / 33;
    //         progressBar.style.background = `linear-gradient(90deg, 
    //             #dc3545 0%, 
    //             rgba(220, 53, 69, ${1 - blueIntensity}) 50%,
    //             #0d6efd 100%)`;
    //     } else {
    //         // A phase - Yellow with gradient from blue
    //         const yellowIntensity = (progress - 66) / 34;
    //         progressBar.style.background = `linear-gradient(90deg, 
    //             #dc3545 0%, 
    //             #0d6efd 33%, 
    //             rgba(13, 110, 253, ${1 - yellowIntensity}) 66%,
    //             #ffc107 100%)`;
    //     }
    // }
    
    // Animate letters in sequence
    // animateLetter(letters[0], 300);  // F
    // animateLetter(letters[1], 1800); // P (after F animation completes)
    // animateLetter(letters[2], 3300); // A (after P animation completes)

    animateLetter(letters[0], 1);  // F
    animateLetter(letters[1], 450); // P (after F animation completes)
    animateLetter(letters[2], 750); // A (after P animation completes)
    
    // Animate progress bar
    // let progress = 0;
    // const progressInterval = setInterval(() => {
    //     progress += 1;
    //     progressBar.style.width = `${progress}%`;
    //     percentageText.textContent = `${progress}%`;
        
    //     // Update progress bar color based on current phase
    //     updateProgressColor(progress);
        
    //     if (progress >= 100) {
    //         clearInterval(progressInterval);
            
    //         // After loading is complete
    //         setTimeout(() => {
    //             document.querySelector('.loading-text').textContent = 'Ready!';
    //             percentageText.textContent = 'Complete!';
    //         }, 500);
    //     }
    // }, 10);
}