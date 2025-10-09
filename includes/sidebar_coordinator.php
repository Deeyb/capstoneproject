<?php
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
  
  <ul id="coordinatorSidebarNav">
    <li class="active" data-section="dashboard">
      <i class="fas fa-tachometer-alt"></i> Dashboard
    </li>
    <li data-section="courses">
      <i class="fas fa-book-open"></i> Courses
    </li>
    <li data-section="uploads">
      <i class="fas fa-upload"></i> Uploads
    </li>
    <li data-section="archiveCoord">
      <i class="fas fa-archive"></i> Archive
    </li>
    <li data-section="importExport">
      <i class="fas fa-exchange-alt"></i> Import/Export
    </li>
    <li data-section="profile">
      <i class="fas fa-user"></i> Profile
    </li>
  </ul>
</div>


