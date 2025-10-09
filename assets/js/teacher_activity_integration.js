/**
 * TEACHER ACTIVITY INTEGRATION
 * Simplified integration of the reusable activity creator for teacher side
 */

// Initialize the reusable activity creator for teacher use
let teacherActivityCreator = null;

/**
 * Initialize the teacher activity creator
 */
function initTeacherActivityCreator() {
    if (!teacherActivityCreator) {
        teacherActivityCreator = new ReusableActivityCreator({
            apiEndpoint: 'course_outline_manage.php',
            autoSave: true,
            autoSaveInterval: 400,
            onSuccess: function(result) {
                console.log('Activity created/updated successfully:', result);
                // Refresh the teacher's view or show success message
                if (typeof refreshTeacherView === 'function') {
                    refreshTeacherView();
                }
            }
        });
    }
}

/**
 * Show activity creator for teacher (simplified interface)
 * @param {Object} options - Configuration options
 * @param {number} options.lessonId - Lesson ID to attach activity to
 * @param {number} options.courseId - Course ID (optional)
 * @param {number} options.editActivityId - Activity ID to edit (optional)
 */
function showTeacherActivityCreator(options = {}) {
    initTeacherActivityCreator();
    
    const defaultOptions = {
        title: 'Create Activity',
        ...options
    };
    
    teacherActivityCreator.showModal(defaultOptions);
}

/**
 * Show activity creator for a specific lesson
 * @param {number} lessonId - Lesson ID
 * @param {number} courseId - Course ID (optional)
 */
function showActivityForLesson(lessonId, courseId = null) {
    showTeacherActivityCreator({
        lessonId: lessonId,
        courseId: courseId,
        title: 'Add Activity to Lesson'
    });
}

/**
 * Edit existing activity
 * @param {number} activityId - Activity ID to edit
 * @param {number} lessonId - Lesson ID
 * @param {number} courseId - Course ID (optional)
 */
function editActivity(activityId, lessonId, courseId = null) {
    showTeacherActivityCreator({
        lessonId: lessonId,
        courseId: courseId,
        editActivityId: activityId,
        title: 'Edit Activity'
    });
}

/**
 * Show activity creator for topic (teacher's custom modules)
 * @param {Object} topicItem - Topic element
 * @param {string} topicTitle - Topic title
 */
function showActivityForTopic(topicItem, topicTitle) {
    // Extract lesson ID from topic item or create a temporary one
    const lessonId = topicItem.getAttribute('data-lesson-id') || 
                    topicItem.getAttribute('data-topic-id') || 
                    'temp_' + Date.now();
    
    showTeacherActivityCreator({
        lessonId: lessonId,
        title: `Add Activity to "${topicTitle}"`
    });
}

/**
 * Enhanced showAddActivityModal for teacher dashboard
 * This replaces the existing showAddActivityModal function
 */
function showAddActivityModal(topicItem, topicTitle) {
    console.log('🔧 Enhanced Add Activity Modal for Teacher');
    console.log('🔧 Topic Item:', topicItem);
    console.log('🔧 Topic Title:', topicTitle);
    
    // Use the reusable activity creator
    showActivityForTopic(topicItem, topicTitle);
}

/**
 * Show coordinator-style activity modal (for compatibility)
 * This maintains compatibility with existing coordinator functions
 */
function showCoordinatorActivityModal(lessonEl) {
    console.log('🔧 Coordinator Activity Modal for Teacher');
    console.log('🔧 Lesson Element:', lessonEl);
    
    // Extract lesson ID from lesson element
    const lessonId = lessonEl.getAttribute('data-lesson-id') || 
                   lessonEl.getAttribute('id')?.replace('lesson-', '') ||
                   'temp_' + Date.now();
    
    showTeacherActivityCreator({
        lessonId: lessonId,
        title: 'Add Activity to Lesson'
    });
}

/**
 * Refresh teacher view after activity creation
 * This function should be implemented based on your teacher dashboard structure
 */
function refreshTeacherView() {
    console.log('🔄 Refreshing teacher view...');
    
    // Implement based on your teacher dashboard structure
    // For example:
    // - Reload lesson content
    // - Update activity lists
    // - Refresh course outline
    
    // Example implementation:
    if (typeof loadTeacherLessons === 'function') {
        loadTeacherLessons();
    }
    
    if (typeof refreshCourseOutline === 'function') {
        refreshCourseOutline();
    }
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Activity created successfully!');
    }
}

/**
 * Initialize teacher activity system
 * Call this when the teacher dashboard loads
 */
function initTeacherActivitySystem() {
    console.log('🚀 Initializing Teacher Activity System');
    
    // Initialize the reusable activity creator
    initTeacherActivityCreator();
    
    // Override existing functions to use the new system
    if (typeof window.showAddActivityModal === 'function') {
        console.log('✅ Overriding showAddActivityModal');
    }
    
    if (typeof window.showCoordinatorActivityModal === 'function') {
        console.log('✅ Overriding showCoordinatorActivityModal');
    }
    
    console.log('✅ Teacher Activity System initialized');
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on a teacher page
    if (document.body.classList.contains('teacher-dashboard') || 
        document.querySelector('.teacher-dashboard') ||
        window.location.pathname.includes('teacher')) {
        initTeacherActivitySystem();
    }
});

// Export functions for global access
window.showTeacherActivityCreator = showTeacherActivityCreator;
window.showActivityForLesson = showActivityForLesson;
window.editActivity = editActivity;
window.showActivityForTopic = showActivityForTopic;
window.initTeacherActivitySystem = initTeacherActivitySystem;



