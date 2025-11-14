<?php
/**
 * Reports Section
 * Shared reports UI for Admin, Coordinator, and Teacher
 */
$userRole = strtolower(trim($_SESSION['user_role'] ?? ''));
$isAdmin = $userRole === 'admin';
$isCoordinator = $userRole === 'coordinator';
$isTeacher = $userRole === 'teacher';
?>
<div class="reports-container">
  <div class="reports-header">
    <h2 class="section-title">📊 Reports</h2>
    <p class="section-subtitle">Generate and export student performance reports</p>
  </div>

  <!-- Filters -->
  <div class="reports-filters">
    <div class="filter-row">
      <div class="filter-group">
        <label>Report Type</label>
        <select id="reportTypeFilter" class="filter-select">
          <option value="overview">Overview</option>
          <option value="class">Class Report</option>
          <option value="student">Student Report</option>
          <option value="activity">Activity Report</option>
        </select>
      </div>
      
      <div class="filter-group" id="classFilterGroup" style="display: none;">
        <label>Class <span style="color: red;">*</span></label>
        <select id="classFilter" class="filter-select" required>
          <option value="">Select Class</option>
        </select>
      </div>
      
      <div class="filter-group" id="studentFilterGroup" style="display: none;">
        <label>Student</label>
        <select id="studentFilter" class="filter-select">
          <option value="">Select Student</option>
        </select>
      </div>
      
      <div class="filter-group" id="activityFilterGroup" style="display: none;">
        <label>Activity</label>
        <select id="activityFilter" class="filter-select">
          <option value="">Select Activity</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Date From</label>
        <input type="date" id="dateFromFilter" class="filter-input">
      </div>
      
      <div class="filter-group">
        <label>Date To</label>
        <input type="date" id="dateToFilter" class="filter-input">
      </div>
      
      <div class="filter-group">
        <button id="generateReportBtn" class="action-btn" style="background:#1d9b3e;color:#fff;margin-top:24px;">
          <i class="fas fa-search"></i> Generate Report
        </button>
      </div>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="reports-summary" id="reportsSummary" style="display: none;">
    <div class="summary-card">
      <div class="summary-icon" style="background:#e3f2fd;color:#1976d2;">
        <i class="fas fa-users"></i>
      </div>
      <div class="summary-content">
        <div class="summary-label">Total Students</div>
        <div class="summary-value" id="summaryTotalStudents">0</div>
      </div>
    </div>
    
    <div class="summary-card">
      <div class="summary-icon" style="background:#e8f5e9;color:#2e7d32;">
        <i class="fas fa-book-open"></i>
      </div>
      <div class="summary-content">
        <div class="summary-label">Total Classes</div>
        <div class="summary-value" id="summaryTotalClasses">0</div>
      </div>
    </div>
    
    <div class="summary-card">
      <div class="summary-icon" style="background:#fff3e0;color:#f57c00;">
        <i class="fas fa-tasks"></i>
      </div>
      <div class="summary-content">
        <div class="summary-label">Activities Completed</div>
        <div class="summary-value" id="summaryActivitiesCompleted">0</div>
      </div>
    </div>
    
    <div class="summary-card">
      <div class="summary-icon" style="background:#f3e5f5;color:#7b1fa2;">
        <i class="fas fa-chart-line"></i>
      </div>
      <div class="summary-content">
        <div class="summary-label">Average Score</div>
        <div class="summary-value" id="summaryAverageScore">0%</div>
      </div>
    </div>
  </div>

  <!-- Export Buttons -->
  <div class="reports-export" id="reportsExport" style="display: none;">
    <button id="exportPDFBtn" class="action-btn" style="background:#dc3545;color:#fff;">
      <i class="fas fa-file-pdf"></i> Export PDF
    </button>
  </div>

  <!-- Report Data Table -->
  <div class="reports-table-container" id="reportsTableContainer" style="display: none;">
    <div class="table-header">
      <h3 id="reportTableTitle">Report Data</h3>
      <div class="table-actions">
        <input type="text" id="reportSearch" placeholder="Search..." class="search-input">
      </div>
    </div>
    <div class="table-wrapper">
      <table id="reportsTable" class="data-table">
        <thead id="reportsTableHead"></thead>
        <tbody id="reportsTableBody"></tbody>
      </table>
    </div>
    <div class="table-footer">
      <div id="reportPagination"></div>
    </div>
  </div>

  <!-- Loading State -->
  <div class="reports-loading" id="reportsLoading" style="display: none;">
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Generating report...</p>
    </div>
  </div>

  <!-- Empty State -->
  <div class="reports-empty" id="reportsEmpty">
    <i class="fas fa-chart-bar"></i>
    <p>Select filters and click "Generate Report" to view data</p>
  </div>
</div>

<style>
.reports-container {
  padding: 20px;
}

.reports-header {
  margin-bottom: 30px;
}

.section-subtitle {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.reports-filters {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.filter-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 150px;
}

.filter-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  margin-bottom: 5px;
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.reports-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.reports-export {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.reports-table-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-header h3 {
  margin: 0;
  color: #333;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 250px;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.reports-loading,
.reports-empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.reports-loading i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #1d9b3e;
}

.reports-empty i {
  font-size: 64px;
  margin-bottom: 15px;
  opacity: 0.3;
}
</style>



