/**
 * REPORTS MODULE
 * Handles report generation, filtering, and export for Admin, Coordinator, and Teacher
 */

class ReportsModule {
    constructor() {
        this.currentReportData = null;
        this.currentFilters = {};
        this.init();
    }

    init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Setup event listeners
        const reportTypeFilter = document.getElementById('reportTypeFilter');
        const classFilter = document.getElementById('classFilter');
        const generateBtn = document.getElementById('generateReportBtn');
        const exportPDFBtn = document.getElementById('exportPDFBtn');
        const reportSearch = document.getElementById('reportSearch');

        if (reportTypeFilter) {
            reportTypeFilter.addEventListener('change', () => this.handleReportTypeChange());
        }

        // CRITICAL: Reload students and activities when class changes
        if (classFilter) {
            classFilter.addEventListener('change', () => {
                const reportType = document.getElementById('reportTypeFilter')?.value || 'overview';
                console.log('🔄 [Reports] Class changed, reloading dependent filters...');
                
                // Clear student and activity filters when class changes
                const studentFilter = document.getElementById('studentFilter');
                const activityFilter = document.getElementById('activityFilter');
                if (studentFilter) {
                    studentFilter.innerHTML = '<option value="">Select Student</option>';
                }
                if (activityFilter) {
                    activityFilter.innerHTML = '<option value="">Select Activity</option>';
                }
                
                // Reload students if student report is selected
                if (reportType === 'student') {
                    this.loadStudents();
                }
                
                // Reload activities if activity report is selected
                if (reportType === 'activity') {
                    this.loadActivities();
                }
            });
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateReport());
        }

        if (exportPDFBtn) {
            exportPDFBtn.addEventListener('click', () => this.exportReport('pdf'));
        }

        if (reportSearch) {
            reportSearch.addEventListener('input', (e) => this.filterTable(e.target.value));
        }

        // Load classes for filter
        this.loadClasses();
    }

    handleReportTypeChange() {
        const reportType = document.getElementById('reportTypeFilter')?.value || 'overview';
        const classFilterGroup = document.getElementById('classFilterGroup');
        const studentFilterGroup = document.getElementById('studentFilterGroup');
        const activityFilterGroup = document.getElementById('activityFilterGroup');

        // Show/hide filter groups based on report type
        if (classFilterGroup) classFilterGroup.style.display = (reportType === 'class' || reportType === 'student' || reportType === 'activity') ? 'block' : 'none';
        if (studentFilterGroup) studentFilterGroup.style.display = (reportType === 'student') ? 'block' : 'none';
        if (activityFilterGroup) activityFilterGroup.style.display = (reportType === 'activity') ? 'block' : 'none';

        // Load dependent data
        if (reportType === 'student' || reportType === 'activity') {
            this.loadClasses();
        }
        if (reportType === 'student') {
            this.loadStudents();
        }
        if (reportType === 'activity') {
            this.loadActivities();
        }
    }

    async loadClasses() {
        try {
            const response = await fetch('get_classes_for_reports.php', {
                credentials: 'same-origin'
            });
            const data = await response.json();
            
            const classFilter = document.getElementById('classFilter');
            if (classFilter && data.success && data.classes) {
                classFilter.innerHTML = '<option value="">Select Class</option>';
                data.classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.id;
                    const displayName = cls.course_code ? `${cls.course_code} - ${cls.name}` : cls.name;
                    option.textContent = displayName || `Class ${cls.id}`;
                    classFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load classes:', error);
        }
    }

    async loadStudents() {
        const classId = document.getElementById('classFilter')?.value;
        if (!classId) {
            const studentFilter = document.getElementById('studentFilter');
            if (studentFilter) {
                studentFilter.innerHTML = '<option value="">Select Class First</option>';
            }
            return;
        }

        try {
            const response = await fetch(`get_enrolled_students.php?class_id=${classId}`, {
                credentials: 'same-origin'
            });
            const data = await response.json();
            console.log('📋 [Reports] loadStudents response:', data);
            
            const studentFilter = document.getElementById('studentFilter');
            if (!studentFilter) {
                return;
            }
            
            if (!data.success) {
                console.warn('⚠️ [Reports] Failed to load students:', data.message);
                studentFilter.innerHTML = '<option value="">No students found</option>';
                return;
            }
            
            // Support both structures: { students: [...] } and { data: [...] }
            const studentsData = Array.isArray(data.students)
                ? data.students
                : (Array.isArray(data.data) ? data.data : []);
            
            // Filter to accepted students only (avoid pending / rejected in dropdown)
            const acceptedStudents = studentsData.filter(student => {
                const status = (student.status || '').toLowerCase();
                return !status || status === 'accepted';
            });
            
            studentFilter.innerHTML = acceptedStudents.length > 0
                ? '<option value="">Select Student</option>'
                : '<option value="">No accepted students</option>';
            
            acceptedStudents.forEach(student => {
                const option = document.createElement('option');
                
                const studentId = student.student_id ?? student.id ?? student.user_id ?? '';
                option.value = studentId;
                
                const displayName =
                    student.name
                    || `${student.lastname || ''}, ${student.firstname || ''} ${student.middlename ? student.middlename.charAt(0) + '.' : ''}`.trim()
                    || student.id_number
                    || (studentId ? `Student ${studentId}` : 'Unnamed Student');
                
                option.textContent = displayName;
                option.dataset.status = student.status || 'accepted';
                option.dataset.idNumber = student.id_number || '';
                
                studentFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load students:', error);
        }
    }

    async loadActivities() {
        const classId = document.getElementById('classFilter')?.value;
        if (!classId) {
            const activityFilter = document.getElementById('activityFilter');
            if (activityFilter) {
                activityFilter.innerHTML = '<option value="">Select Class First</option>';
            }
            return;
        }

        try {
            const response = await fetch(`class_view_api.php?action=list_topics&class_id=${classId}`, {
                credentials: 'same-origin'
            });
            const data = await response.json();
            
            const activityFilter = document.getElementById('activityFilter');
            if (activityFilter && data.success && data.modules) {
                activityFilter.innerHTML = '<option value="">Select Activity</option>';
                data.modules.forEach(module => {
                    if (module.lessons) {
                        module.lessons.forEach(lesson => {
                            if (lesson.activities) {
                                lesson.activities.forEach(activity => {
                                    const option = document.createElement('option');
                                    option.value = activity.id;
                                    option.textContent = `${module.title || ''} - ${lesson.title || ''} - ${activity.title || ''}`;
                                    activityFilter.appendChild(option);
                                });
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load activities:', error);
        }
    }

    async generateReport() {
        const reportType = document.getElementById('reportTypeFilter')?.value || 'overview';
        const classId = document.getElementById('classFilter')?.value || '';
        const studentId = document.getElementById('studentFilter')?.value || '';
        const activityId = document.getElementById('activityFilter')?.value || '';
        const dateFrom = document.getElementById('dateFromFilter')?.value || '';
        const dateTo = document.getElementById('dateToFilter')?.value || '';

        // Client-side validation
        if (reportType === 'class' && !classId) {
            if (typeof showError === 'function') {
                showError('Validation Error', 'Please select a class to generate a Class Report.');
            } else {
                alert('Please select a class to generate a Class Report.');
            }
            return;
        }

        if (reportType === 'student') {
            if (!classId) {
                if (typeof showError === 'function') {
                    showError('Validation Error', 'Please select a class first, then select a student.');
                } else {
                    alert('Please select a class first, then select a student.');
                }
                return;
            }
            if (!studentId) {
                if (typeof showError === 'function') {
                    showError('Validation Error', 'Please select a student to generate a Student Report.');
                } else {
                    alert('Please select a student to generate a Student Report.');
                }
                return;
            }
        }

        if (reportType === 'activity') {
            if (!classId) {
                if (typeof showError === 'function') {
                    showError('Validation Error', 'Please select a class first, then select an activity.');
                } else {
                    alert('Please select a class first, then select an activity.');
                }
                return;
            }
            if (!activityId) {
                if (typeof showError === 'function') {
                    showError('Validation Error', 'Please select an activity to generate an Activity Report.');
                } else {
                    alert('Please select an activity to generate an Activity Report.');
                }
                return;
            }
        }

        // Build query string
        const params = new URLSearchParams({
            type: reportType
        });
        if (classId) params.append('class_id', classId);
        if (studentId) params.append('student_id', studentId);
        if (activityId) params.append('activity_id', activityId);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);

        // Show loading
        this.showLoading(true);
        this.hideEmpty();
        this.hideSummary();
        this.hideTable();
        this.hideExport();

        try {
            const response = await fetch(`get_reports_data.php?${params.toString()}`, {
                credentials: 'same-origin'
            });
            const data = await response.json();

            console.log('📊 [Reports] API Response:', data);
            console.log('📊 [Reports] Report Type:', reportType);
            console.log('📊 [Reports] Filters:', { classId, studentId, activityId, dateFrom, dateTo });
            console.log('📊 [Reports] Data received:', data.data);
            console.log('📊 [Reports] Data type:', typeof data.data);
            console.log('📊 [Reports] Data keys:', data.data ? Object.keys(data.data) : 'null/undefined');
            console.log('📊 [Reports] Data is array?', Array.isArray(data.data));

            if (data.success) {
                this.currentReportData = data.data;
                this.currentFilters = { reportType, classId, studentId, activityId, dateFrom, dateTo };
                
                // Check if data exists
                if (!data.data) {
                    console.warn('⚠️ [Reports] data.data is null/undefined');
                    if (typeof showError === 'function') {
                        showError('No Data', 'No report data available for the selected filters.');
                    } else {
                        alert('No report data available for the selected filters.');
                    }
                    this.showEmpty();
                    return;
                }
                
                // For class/student/activity reports, check if the expected keys exist
                if (reportType === 'class') {
                    console.log('📊 [Reports] Class report - checking data structure');
                    console.log('📊 [Reports] student_performance exists?', 'student_performance' in data.data);
                    console.log('📊 [Reports] class_info exists?', 'class_info' in data.data);
                    console.log('📊 [Reports] statistics exists?', 'statistics' in data.data);
                    
                    if (!('student_performance' in data.data) || !('class_info' in data.data)) {
                        console.warn('⚠️ [Reports] Missing required keys in class report data');
                        if (typeof showError === 'function') {
                            showError('Data Error', 'Report data structure is incomplete. Please check the console for details.');
                        }
                        this.showEmpty();
                        return;
                    }
                }
                
                if (reportType === 'student') {
                    console.log('📊 [Reports] Student report - checking data structure');
                    console.log('📊 [Reports] performance exists?', 'performance' in data.data);
                    console.log('📊 [Reports] student_info exists?', 'student_info' in data.data);
                }
                
                if (reportType === 'activity') {
                    console.log('📊 [Reports] Activity report - checking data structure');
                    console.log('📊 [Reports] performance exists?', 'performance' in data.data);
                    console.log('📊 [Reports] activity_info exists?', 'activity_info' in data.data);
                }
                
                this.renderReport(data.data, reportType);
            } else {
                console.error('❌ [Reports] API Error:', data.message);
                if (typeof showError === 'function') {
                    showError('Error', data.message || 'Failed to generate report');
                } else {
                    alert('Error: ' + (data.message || 'Failed to generate report'));
                }
                this.showEmpty();
            }
        } catch (error) {
            console.error('❌ [Reports] Report generation error:', error);
            if (typeof showError === 'function') {
                showError('Error', 'Failed to generate report. Please try again.');
            } else {
                alert('Error: Failed to generate report');
            }
            this.showEmpty();
        } finally {
            this.showLoading(false);
        }
    }

    renderReport(data, reportType) {
        // Render summary cards
        if (reportType === 'overview') {
            this.renderSummaryCards(data);
        }

        // Render table
        this.renderTable(data, reportType);

        // Show export buttons
        this.showExport();
    }

    renderSummaryCards(data) {
        const totalStudents = document.getElementById('summaryTotalStudents');
        const totalClasses = document.getElementById('summaryTotalClasses');
        const activitiesCompleted = document.getElementById('summaryActivitiesCompleted');
        const averageScore = document.getElementById('summaryAverageScore');

        if (totalStudents) totalStudents.textContent = data.total_students || 0;
        if (totalClasses) totalClasses.textContent = data.total_classes || 0;
        if (activitiesCompleted) activitiesCompleted.textContent = data.total_activities_completed || 0;
        if (averageScore) averageScore.textContent = (data.average_score || 0) + '%';

        this.showSummary();
    }

    renderTable(data, reportType) {
        const tableHead = document.getElementById('reportsTableHead');
        const tableBody = document.getElementById('reportsTableBody');
        const tableTitle = document.getElementById('reportTableTitle');

        console.log('📊 [Reports] renderTable called with:', { data, reportType });

        if (!tableHead || !tableBody) {
            console.error('❌ [Reports] Table elements not found!');
            return;
        }

        // Clear existing content
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        let headers = [];
        let rows = [];

        switch (reportType) {
            case 'overview':
                console.log('📊 [Reports] Overview - top_performers:', data.top_performers);
                console.log('📊 [Reports] Overview - class_performance:', data.class_performance);
                
                if (data.top_performers && data.top_performers.length > 0) {
                    tableTitle.textContent = 'Top Performers';
                    headers = ['Rank', 'Student Name', 'ID Number', 'Average Score', 'Activities Completed'];
                    rows = data.top_performers.map((student, index) => [
                        index + 1,
                        `${student.lastname || ''}, ${student.firstname || ''} ${student.middlename ? student.middlename.charAt(0) + '.' : ''}`.trim(),
                        student.id_number || '',
                        round(student.avg_score || 0, 2) + '%',
                        student.activities_completed || 0
                    ]);
                    console.log('✅ [Reports] Rendering top performers:', rows.length, 'rows');
                } else if (data.class_performance && data.class_performance.length > 0) {
                    tableTitle.textContent = 'Class Performance';
                    headers = ['Class Name', 'Course', 'Students Enrolled', 'Activities Completed', 'Average Score'];
                    rows = data.class_performance.map(cls => [
                        cls.class_name || `Class ${cls.id}`,
                        `${cls.course_code || ''} - ${cls.course_title || ''}`.trim(),
                        cls.students_enrolled || 0,
                        cls.activities_completed || 0,
                        round(cls.avg_score || 0, 2) + '%'
                    ]);
                    console.log('✅ [Reports] Rendering class performance:', rows.length, 'rows');
                } else {
                    console.warn('⚠️ [Reports] No data for overview report');
                }
                break;

            case 'class':
                console.log('📊 [Reports] Class - Full data object:', data);
                console.log('📊 [Reports] Class - student_performance:', data.student_performance);
                console.log('📊 [Reports] Class - class_info:', data.class_info);
                console.log('📊 [Reports] Class - statistics:', data.statistics);
                console.log('📊 [Reports] Class - Data keys:', Object.keys(data));
                
                if (data.student_performance && Array.isArray(data.student_performance) && data.student_performance.length > 0) {
                    tableTitle.textContent = `Student Performance - ${data.class_info?.name || 'Class'}`;
                    headers = ['Student Name', 'ID Number', 'Activities Completed', 'Average Score', 'Highest Score', 'Lowest Score'];
                    rows = data.student_performance.map(student => [
                        `${student.lastname || ''}, ${student.firstname || ''} ${student.middlename ? student.middlename.charAt(0) + '.' : ''}`.trim(),
                        student.id_number || '',
                        student.activities_completed || 0,
                        round(student.avg_score || 0, 2) + '%',
                        student.highest_score || 0,
                        student.lowest_score || 0
                    ]);
                    console.log('✅ [Reports] Rendering student performance:', rows.length, 'rows');
                } else {
                    console.warn('⚠️ [Reports] No student performance data');
                }
                break;

            case 'student':
                console.log('📊 [Reports] Student - performance:', data.performance);
                console.log('📊 [Reports] Student - student_info:', data.student_info);
                
                if (data.performance && data.performance.length > 0) {
                    const student = data.student_info;
                    const name = `${student.lastname || ''}, ${student.firstname || ''} ${student.middlename ? student.middlename.charAt(0) + '.' : ''}`.trim();
                    tableTitle.textContent = `Performance Report - ${name}`;
                    headers = ['Activity', 'Type', 'Score', 'Status', 'Submitted At'];
                    rows = data.performance.map(perf => {
                        const score = perf.score !== null && perf.score !== undefined ? perf.score : 'Pending';
                        const status = perf.status || (perf.score === null ? 'Pending' : 'Graded');
                        return [
                            perf.activity_title || 'Unknown',
                            perf.activity_type || 'N/A',
                            score,
                            status,
                            perf.submitted_at ? new Date(perf.submitted_at).toLocaleDateString() : 'N/A'
                        ];
                    });
                    console.log('✅ [Reports] Rendering student performance:', rows.length, 'rows');
                } else {
                    console.warn('⚠️ [Reports] No performance data for student');
                }
                break;

            case 'activity':
                console.log('📊 [Reports] Activity - Full data object:', data);
                console.log('📊 [Reports] Activity - performance:', data.performance);
                console.log('📊 [Reports] Activity - activity_info:', data.activity_info);
                console.log('📊 [Reports] Activity - statistics:', data.statistics);
                console.log('📊 [Reports] Activity - performance is array?', Array.isArray(data.performance));
                console.log('📊 [Reports] Activity - performance length:', data.performance ? data.performance.length : 'null/undefined');
                
                if (data.performance && Array.isArray(data.performance) && data.performance.length > 0) {
                    tableTitle.textContent = `Activity Report - ${data.activity_info?.title || 'Activity'}`;
                    headers = ['Student Name', 'ID Number', 'Score', 'Status', 'Submitted At'];
                    rows = data.performance.map(perf => {
                        const score = perf.score !== null && perf.score !== undefined ? perf.score : 'Pending';
                        const status = perf.status || (perf.score === null ? 'Pending' : 'Graded');
                        return [
                            `${perf.lastname || ''}, ${perf.firstname || ''} ${perf.middlename ? perf.middlename.charAt(0) + '.' : ''}`.trim(),
                            perf.id_number || '',
                            score,
                            status,
                            perf.submitted_at ? new Date(perf.submitted_at).toLocaleDateString() : 'N/A'
                        ];
                    });
                    console.log('✅ [Reports] Rendering activity performance:', rows.length, 'rows');
                    if (data.statistics && data.statistics.pending_submissions > 0) {
                        console.log(`📊 [Reports] ${data.statistics.pending_submissions} pending submission(s) included`);
                    }
                } else {
                    console.warn('⚠️ [Reports] No performance data for activity');
                    console.log('📊 [Reports] Activity info available:', data.activity_info);
                    console.log('📊 [Reports] Statistics available:', data.statistics);
                    console.log('📊 [Reports] This might mean:');
                    console.log('   - No students have submitted this activity yet');
                    console.log('   - Submissions exist but have no score (pending grading)');
                    console.log('   - Submissions exist but students are not enrolled in the selected class');
                    console.log('   - Activity does not belong to the selected class\'s course');
                    
                    // Show helpful message to user
                    if (data.activity_info && data.activity_info.title) {
                        console.log(`📊 [Reports] Activity "${data.activity_info.title}" exists but has no performance data.`);
                    }
                }
                break;
        }

        // Render headers
        if (headers.length > 0) {
            const headerRow = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            tableHead.appendChild(headerRow);
            console.log('✅ [Reports] Headers rendered:', headers.length);
        } else {
            console.warn('⚠️ [Reports] No headers to render');
        }

        // Render rows
        if (rows.length > 0) {
            rows.forEach(row => {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const td = document.createElement('td');
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
            console.log('✅ [Reports] Rows rendered:', rows.length);
            this.showTable();
        } else {
            console.warn('⚠️ [Reports] No rows to render, showing empty state');
            this.showEmpty();
        }
    }

    async exportReport(format) {
        if (!this.currentReportData) {
            if (typeof showError === 'function') {
                showError('Error', 'Please generate a report first');
            } else {
                alert('Please generate a report first');
            }
            return;
        }

        const params = new URLSearchParams({
            format: format,
            type: this.currentFilters.reportType || 'overview'
        });
        if (this.currentFilters.classId) params.append('class_id', this.currentFilters.classId);
        if (this.currentFilters.studentId) params.append('student_id', this.currentFilters.studentId);
        if (this.currentFilters.activityId) params.append('activity_id', this.currentFilters.activityId);
        if (this.currentFilters.dateFrom) params.append('date_from', this.currentFilters.dateFrom);
        if (this.currentFilters.dateTo) params.append('date_to', this.currentFilters.dateTo);

        // Open export URL
        window.open(`export_report.php?${params.toString()}`, '_blank');

        if (typeof showSuccess === 'function') {
            showSuccess('Export Started', `Your ${format.toUpperCase()} report is being generated...`);
        }
    }

    filterTable(searchTerm) {
        const tableBody = document.getElementById('reportsTableBody');
        if (!tableBody) return;

        const rows = tableBody.querySelectorAll('tr');
        const term = searchTerm.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    showLoading(show) {
        const loading = document.getElementById('reportsLoading');
        if (loading) loading.style.display = show ? 'block' : 'none';
    }

    showSummary() {
        const summary = document.getElementById('reportsSummary');
        if (summary) summary.style.display = 'grid';
    }

    hideSummary() {
        const summary = document.getElementById('reportsSummary');
        if (summary) summary.style.display = 'none';
    }

    showTable() {
        const container = document.getElementById('reportsTableContainer');
        if (container) container.style.display = 'block';
    }

    hideTable() {
        const container = document.getElementById('reportsTableContainer');
        if (container) container.style.display = 'none';
    }

    showExport() {
        const exportDiv = document.getElementById('reportsExport');
        if (exportDiv) exportDiv.style.display = 'flex';
    }

    hideExport() {
        const exportDiv = document.getElementById('reportsExport');
        if (exportDiv) exportDiv.style.display = 'none';
    }

    showEmpty() {
        const empty = document.getElementById('reportsEmpty');
        if (empty) empty.style.display = 'block';
    }

    hideEmpty() {
        const empty = document.getElementById('reportsEmpty');
        if (empty) empty.style.display = 'none';
    }
}

// Helper function
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

// Initialize Reports Module
let reportsModule = null;

// Initialize when Reports section is shown
function initReportsModule() {
    if (!reportsModule) {
        reportsModule = new ReportsModule();
    }
}

// Auto-initialize if Reports section exists
if (document.getElementById('reportTypeFilter')) {
    initReportsModule();
}

// Export for manual initialization
window.initReportsModule = initReportsModule;
window.ReportsModule = ReportsModule;

