// console.clear();
// (function() {
//     "use strict";

//     // Configuration
//     let RECORDS_PER_PAGE = 10;
    
//     // DOM elements
//     const paginationEl = document.getElementById('pagination-indicator');
//     const prevBtn = document.getElementById('prev-btn');
//     const nextBtn = document.getElementById('next-btn');

//     const currentPageEl = 5;
//     const totalRecordsEl = 1000;
//     const totalPagesEl = 100;
//     const recordCountInput = 1000;
//     const recordsPerPageInput = 10;
    
//     // State
//     let currentPage = 1;
//     let totalRecords = parseInt(totalRecordsEl);
//     let totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE);
    
//     // Initialize
//     updatePagination();
    
//     // Event listeners
//     prevBtn.addEventListener('click', goToPrevPage);
//     nextBtn.addEventListener('click', goToNextPage);
    
//     function goToPrevPage() {
//         if (currentPage > 1) {
//             currentPage--;
//             // currentPageEl = currentPage;
//             updatePagination();
//             scrollToCurrentPage();
//         }
//     }
    
//     function goToNextPage() {
//         if (currentPage < totalPages) {
//             currentPage++;
//             // currentPageEl = currentPage;
//             updatePagination();
//             scrollToCurrentPage();
//         }
//     }
    
//     function scrollToCurrentPage() {
//         const bullets = paginationEl.querySelectorAll('.bullet');
//         if (bullets.length > 0 && currentPage <= bullets.length) {
//             const currentBullet = bullets[currentPage - 1];
//             currentBullet.scrollIntoView({
//                 behavior: 'smooth',
//                 block: 'nearest',
//                 inline: 'center'
//             });
//         }
//     }
    
//     function updatePagination() {
//         // Clear existing pagination
//         paginationEl.innerHTML = '';
        
//         // Update button states
//         prevBtn.disabled = currentPage === 1;
//         nextBtn.disabled = currentPage === totalPages;
        
//         // Create pagination bullets for all pages
//         for (let i = 1; i <= totalPages; i++) {
//             const bullet = document.createElement('div');
//             bullet.className = 'bullet';
            
//             if (i < currentPage) {
//                 bullet.classList.add('past');
//             } else if (i === currentPage) {
//                 bullet.classList.add('current');
//             } else if (i === currentPage + 1) {
//                 bullet.classList.add('next');
//             } else {
//                 bullet.classList.add('future');
//             }
            
//             const icon = document.createElement('span');
//             icon.className = 'icon';
//             icon.textContent = i;
            
//             const text = document.createElement('div');
//             text.className = 'text';
//             text.textContent = `Page ${i}`;
            
//             bullet.appendChild(icon);
//             bullet.appendChild(text);
            
//             // Add click event
//             bullet.addEventListener('click', () => {
//                 currentPage = i;
//                 // currentPageEl = currentPage;
//                 updatePagination();
//                 scrollToCurrentPage();
//             });
            
//             paginationEl.appendChild(bullet);
//         }
        
//         // Scroll to current page after a brief delay to allow DOM update
//         setTimeout(scrollToCurrentPage, 100);
//     }
// })();