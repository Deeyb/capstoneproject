<?php
// Footer include for admin panel
?>
    </div> <!-- End main-content -->
    <!-- Admin Panel JS (loads admin_panel.js) -->
    <script src="assets/js/app_ui.js"></script>
    <!-- Shared Profile JS (load AFTER admin scripts so native showNotification is used) -->
    <script src="assets/js/shared_profile.js"></script>
    <script>
      // Immediate section visibility fix - runs before other scripts
      document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Admin Dashboard: Immediate section fix running...');
        
        // Force hide all sections immediately
        const sections = document.querySelectorAll('.section-content');
        sections.forEach(section => {
          section.style.display = 'none';
          section.classList.remove('active');
        });
        
        // AGGRESSIVE FIX: Hide any profile content outside of profile section
        const profileContainers = document.querySelectorAll('.profile-container');
        profileContainers.forEach(container => {
          const profileSection = document.getElementById('profile');
          if (profileSection && !profileSection.contains(container)) {
            container.style.display = 'none';
            console.log('🚫 Admin Dashboard: Hidden profile content outside profile section');
          }
        });
        
        // Show only the current section
        const currentSection = '<?php echo $current_section ?? "dashboard"; ?>';
        const targetSection = document.getElementById(currentSection);
        if (targetSection) {
          targetSection.style.display = 'block';
          targetSection.classList.add('active');
          console.log(`✅ Admin Dashboard: Showing ${currentSection}`);
        } else {
          // Default to dashboard
          const defaultSection = document.getElementById('dashboard');
          if (defaultSection) {
            defaultSection.style.display = 'block';
            defaultSection.classList.add('active');
            console.log('✅ Admin Dashboard: Defaulted to dashboard');
          }
        }
      });
    </script>
    <script>
      // Initialize shared profile functionality
      document.addEventListener('DOMContentLoaded', function() {
        if (typeof initSharedProfile === 'function') initSharedProfile();
      });
    </script>
  </body>
</html> 