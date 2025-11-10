<?php
// Student sidebar include
require_once __DIR__ . '/../classes/ProfileService.php';
require_once __DIR__ . '/../config/Database.php';

$db = (new Database())->getConnection();
$profileService = new ProfileService($db);
$userProfile = $profileService->getUserProfile($_SESSION['user_id']);
$profilePhotoUrl = $profileService->getProfilePhotoUrl($_SESSION['user_id']);
?>
<div class="sidebar" id="sidebar">
  <button class="sidebar-toggle-btn" onclick="toggleSidebarMinimize()" title="Minimize sidebar">
    <i class="fas fa-chevron-left"></i>
  </button>
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
    <li class="<?php echo ($current_section ?? 'myclasses') === 'myclasses' ? 'active' : ''; ?>" data-section="myclasses">
      <i class="fas fa-chalkboard"></i> My Classes
    </li>
    <!-- Hidden until implementation -->
    <!-- <li class="<?php echo ($current_section ?? 'myclasses') === 'newsfeed' ? 'active' : ''; ?>" data-section="newsfeed">
      <i class="fas fa-newspaper"></i> Newsfeed
    </li>
    <li class="<?php echo ($current_section ?? 'myclasses') === 'leaderboards' ? 'active' : ''; ?>" data-section="leaderboards">
      <i class="fas fa-trophy"></i> Leaderboards
    </li> -->
    <li class="<?php echo ($current_section ?? 'myclasses') === 'certification' ? 'active' : ''; ?>" data-section="certification">
      <i class="fas fa-certificate"></i> Certification
    </li>
    <li class="<?php echo ($current_section ?? 'myclasses') === 'profile' ? 'active' : ''; ?>" data-section="profile">
      <i class="fas fa-user"></i> Profile
    </li>
  </ul>
</div>
