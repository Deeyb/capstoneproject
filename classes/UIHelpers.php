<?php
/**
 * UI Helper Functions
 * Centralized functions for UI components like logos, badges, etc.
 */

class UIHelpers {
    /**
     * Get the global logo HTML
     * 
     * @param array $options Optional configuration:
     *   - 'height' => string (default: '80px')
     *   - 'width' => string (default: 'auto')
     *   - 'class' => string (additional CSS classes)
     *   - 'alt' => string (default: 'CodeRegal')
     *   - 'link' => string (URL to link to, optional)
     * @return string HTML for the logo
     */
    public static function getLogo($options = []) {
        $height = $options['height'] ?? '50px'; // Default to 50px to fit in 60px header
        $width = $options['width'] ?? 'auto';
        $class = isset($options['class']) ? ' ' . htmlspecialchars($options['class']) : '';
        $alt = $options['alt'] ?? 'CodeRegal';
        $link = $options['link'] ?? null;
        
        $logoPath = 'Photos/CodeRegal.svg';
        // Add cache busting to prevent browser caching issues (only if not disabled)
        if (!isset($options['no_cache']) || $options['no_cache'] !== false) {
            $logoPath .= '?v=' . (defined('APP_VERSION') ? APP_VERSION : time());
        }
        $style = "height: {$height}; width: {$width}; display: block;";
        
        $imgTag = '<img src="' . htmlspecialchars($logoPath) . '" alt="' . htmlspecialchars($alt) . '" style="' . htmlspecialchars($style) . '" class="' . trim($class) . '">';
        
        if ($link) {
            return '<a href="' . htmlspecialchars($link) . '">' . $imgTag . '</a>';
        }
        
        return $imgTag;
    }
    
    /**
     * Get logo HTML with cache busting
     * 
     * @param array $options Optional configuration (same as getLogo)
     * @return string HTML for the logo with cache busting
     */
    public static function getLogoWithCacheBust($options = []) {
        $options['class'] = ($options['class'] ?? '') . ' logo-cache-bust';
        // Cache busting is already handled in getLogo()
        return self::getLogo($options);
    }
    
    /**
     * Get logo with link to dashboard based on user role
     * 
     * @param string $userRole User role (admin, teacher, coordinator, student)
     * @param array $options Optional configuration (same as getLogo)
     * @return string HTML for the logo with link
     */
    public static function getLogoWithLink($userRole = null, $options = []) {
        $link = null;
        
        if ($userRole) {
            $role = strtolower($userRole);
            switch ($role) {
                case 'admin':
                    $link = 'admin_panel.php';
                    break;
                case 'teacher':
                    $link = 'teacher_dashboard.php?section=my-classes';
                    break;
                case 'coordinator':
                    $link = 'coordinator_dashboard.php';
                    break;
                case 'student':
                    $link = 'student_dashboard.php?section=myclasses';
                    break;
            }
        }
        
        $options['link'] = $link;
        return self::getLogo($options);
    }
    
    /**
     * Get favicon link tag
     * 
     * @return string HTML link tag for favicon
     */
    public static function getFavicon() {
        return '<link rel="icon" type="image/svg+xml" href="Photos/CodeRegalWB.svg">';
    }
}

