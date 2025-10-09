/**
 * Teacher Courses Management
 * Handles access to published courses for teachers
 */

// Load published courses for teacher dashboard
function loadPublishedCourses() {
    console.log('📚 Loading published courses for teacher...');
    
    fetch('teacher_courses_api.php?action=get_published_courses', {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Published courses loaded:', data.data);
            renderPublishedCourses(data.data);
        } else {
            console.error('❌ Failed to load published courses:', data.message);
            if (typeof window.showNotification === 'function') {
                window.showNotification('error', 'Error', data.message);
            }
        }
    })
    .catch(error => {
        console.error('❌ Network error loading published courses:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('error', 'Error', 'Failed to load courses');
        }
    });
}

// Render published courses in the UI
function renderPublishedCourses(courses) {
    const container = document.getElementById('publishedCoursesContainer');
    if (!container) {
        console.warn('⚠️ Published courses container not found');
        return;
    }
    
    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                <h3>No Published Courses Available</h3>
                <p>There are currently no published courses available for teachers.</p>
            </div>
        `;
        return;
    }
    
    const coursesHtml = courses.map(course => {
        const modulesCount = course.modules_count || 0;
        const lessonsCount = course.lessons_count || 0;
        const updatedDate = course.updated_at ? new Date(course.updated_at).toLocaleDateString() : 'N/A';
        
        return `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-header">
                    <h3 class="course-title">${course.course_title}</h3>
                    <span class="course-code">${course.course_code}</span>
                </div>
                <div class="course-description">
                    <p>${course.description || 'No description available'}</p>
                </div>
                <div class="course-stats">
                    <div class="stat-item">
                        <i class="fas fa-layer-group"></i>
                        <span>${modulesCount} Modules</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-book"></i>
                        <span>${lessonsCount} Lessons</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-calendar"></i>
                        <span>Updated: ${updatedDate}</span>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="action-btn btn-primary" onclick="viewCourseDetails(${course.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="action-btn btn-success" onclick="useCourseForClass(${course.id})">
                        <i class="fas fa-plus"></i> Use for Class
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="courses-grid">
            ${coursesHtml}
        </div>
    `;
}

// View course details
function viewCourseDetails(courseId) {
    console.log('👁️ Viewing course details:', courseId);
    
    fetch(`teacher_courses_api.php?action=get_course_details&course_id=${courseId}`, {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showCourseDetailsModal(data.data);
        } else {
            console.error('❌ Failed to load course details:', data.message);
            if (typeof window.showNotification === 'function') {
                window.showNotification('error', 'Error', data.message);
            }
        }
    })
    .catch(error => {
        console.error('❌ Network error loading course details:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('error', 'Error', 'Failed to load course details');
        }
    });
}

// Show course details modal
function showCourseDetailsModal(course) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 600px; width: 90%;">
            <div class="modal-header">
                <h3>Course Details</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="course-details">
                    <div class="detail-row">
                        <label>Course Code:</label>
                        <span>${course.course_code}</span>
                    </div>
                    <div class="detail-row">
                        <label>Course Title:</label>
                        <span>${course.course_title}</span>
                    </div>
                    <div class="detail-row">
                        <label>Description:</label>
                        <p>${course.description || 'No description available'}</p>
                    </div>
                    <div class="detail-row">
                        <label>Status:</label>
                        <span class="status-badge published">Published</span>
                    </div>
                    <div class="detail-row">
                        <label>Modules:</label>
                        <span>${course.modules_count || 0}</span>
                    </div>
                    <div class="detail-row">
                        <label>Lessons:</label>
                        <span>${course.lessons_count || 0}</span>
                    </div>
                    <div class="detail-row">
                        <label>Last Updated:</label>
                        <span>${course.updated_at ? new Date(course.updated_at).toLocaleString() : 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="action-btn btn-gray" onclick="this.closest('.modal-overlay').remove()">
                    Close
                </button>
                <button class="action-btn btn-primary" onclick="useCourseForClass(${course.id}); this.closest('.modal-overlay').remove();">
                    Use for Class
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Use course for creating a class
function useCourseForClass(courseId) {
    console.log('🎓 Using course for class:', courseId);
    
    // Check if course is still available
    fetch(`teacher_courses_api.php?action=check_course_availability&course_id=${courseId}`, {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.available) {
            // Store selected course ID for class creation
            sessionStorage.setItem('selectedCourseId', courseId);
            
            if (typeof window.showNotification === 'function') {
                window.showNotification('success', 'Success', 'Course selected for class creation');
            }
            
            // Navigate to class creation or show class creation modal
            if (typeof showCreateClassModal === 'function') {
                showCreateClassModal();
            } else {
                console.log('📝 Navigate to class creation with course ID:', courseId);
            }
        } else {
            console.error('❌ Course is no longer available');
            if (typeof window.showNotification === 'function') {
                window.showNotification('error', 'Error', 'Course is no longer available');
            }
        }
    })
    .catch(error => {
        console.error('❌ Network error checking course availability:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('error', 'Error', 'Failed to verify course availability');
        }
    });
}

// Initialize teacher courses functionality
function initTeacherCourses() {
    console.log('🚀 Initializing teacher courses...');
    
    // Load published courses when the page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPublishedCourses);
    } else {
        loadPublishedCourses();
    }
}

// Auto-initialize if this script is loaded
if (typeof window !== 'undefined') {
    initTeacherCourses();
}


