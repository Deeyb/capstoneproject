<?php
// Sidebar include for admin panel
require_once __DIR__ . '/../classes/ProfileService.php';
require_once __DIR__ . '/../config/Database.php';

$db = (new Database())->getConnection();
$profileService = new ProfileService($db);
$userProfile = $profileService->getUserProfile($_SESSION['user_id']);
$profilePhotoUrl = $profileService->getProfilePhotoUrl($_SESSION['user_id']);
?>
<div class="sidebar">
  <div class="user-profile">
    <div class="user-avatar">
      <?php if ($profilePhotoUrl): ?>
        <img src="<?php echo htmlspecialchars($profilePhotoUrl); ?>" alt="Profile Photo" class="profile-photo">
      <?php else: ?>
        <i class="fas fa-user-circle"></i>
      <?php endif; ?>
    </div>
    <div class="user-name"><?php 
      $lastname = $userProfile['lastname'] ?? '';
      $firstname = $userProfile['firstname'] ?? '';
      $middlename = $userProfile['middlename'] ?? '';
      $middle_initial = $middlename ? strtoupper(mb_substr(trim($middlename), 0, 1)) . '.' : '';
      $user_name = trim($lastname . ', ' . $firstname . ' ' . $middle_initial);
      echo htmlspecialchars($user_name); 
    ?></div>
  </div>
  <ul>
    <li class="active" data-section="dashboard">
      <i class="fas fa-tachometer-alt"></i> Dashboard
    </li>
    <li data-section="users">
      <i class="fas fa-users"></i> User Management
    </li>
    <li data-section="analytics">
      <i class="fas fa-chart-line"></i> User Analytics
    </li>
    <li data-section="newsfeed">
      <i class="fas fa-bullhorn"></i> Announcement
    </li>
    <li data-section="reports">
      <i class="fas fa-chart-bar"></i> Reports
    </li>
    <li data-section="audit">
      <i class="fas fa-list"></i> Audit Logs
    </li>
    <li data-section="settings">
      <i class="fas fa-cog"></i> Settings
    </li>
    <li data-section="profile">
      <i class="fas fa-user"></i> Profile
    </li>
  </ul>
</div> 