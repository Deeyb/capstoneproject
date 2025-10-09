<?php
// Modals include for admin panel
?>
<!-- Add User Modal -->
<div id="addUserModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.2); z-index:2000; align-items:center; justify-content:center;">
  <div style="background:#fff; padding:30px 25px; border-radius:10px; max-width:400px; margin:60px auto; position:relative;">
    <h3 style="margin-bottom:18px;">Add User</h3>
    <form id="addUserForm" method="post" action="?section=users" autocomplete="off" onsubmit="return validateAddUserForm(event)">
      <div class="mb-3">
        <input type="text" name="firstname" placeholder="First Name" required autocomplete="given-name" 
               pattern="[a-zA-Z\s'-]+" title="First name can only contain letters, spaces, hyphens, and apostrophes"
               style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
        <div class="error-message" id="firstnameError"></div>
      </div>
      <div class="mb-3">
        <input type="text" name="middlename" placeholder="Middle Name" autocomplete="additional-name" 
               pattern="[a-zA-Z\s'-]*" title="Middle name can only contain letters, spaces, hyphens, and apostrophes"
               style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
        <div class="error-message" id="middlenameError"></div>
      </div>
      <div class="mb-3">
        <input type="text" name="lastname" placeholder="Last Name" required autocomplete="family-name" 
               pattern="[a-zA-Z\s'-]+" title="Last name can only contain letters, spaces, hyphens, and apostrophes"
               style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
        <div class="error-message" id="lastnameError"></div>
      </div>
      <div class="mb-3">
        <input type="text" name="id_number" placeholder="ID Number (KLD-22-000123)" required autocomplete="username" 
               pattern="KLD-\d{2}-\d{6}" title="ID Number must be in format: KLD-YY-XXXXXX"
               style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
        <div class="error-message" id="idNumberError"></div>
      </div>
      <div class="mb-3">
        <input type="email" name="email" placeholder="Email" required autocomplete="email" 
               pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address"
               style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
        <div class="error-message" id="emailError"></div>
      </div>
      <div class="mb-3" id="passwordFieldGroup">
        <div class="password-eye-container" style="position:relative;display:flex;align-items:center;">
          <input type="password" name="password" id="addUserPassword" placeholder="Password" autocomplete="new-password" 
                 style="width:100%;margin-bottom:10px;padding:8px 12px;padding-right:40px;border:1px solid #ccc;border-radius:5px;height:38px;">
          <span class="password-toggle-eye" onclick="toggleAddUserPassword()" 
                style="position:absolute;right:12px;top:0;bottom:10px;margin:auto;height:100%;display:flex;align-items:center;cursor:pointer;">
            <i class="fas fa-eye" style="font-size:16px;color:#6b7280;opacity:0.7;transition:opacity 0.2s;"></i>
          </span>
        </div>
        <div id="passwordChecklist" class="password-checklist" style="display:none;margin-bottom:10px;font-size:12px;">
          <ul style="list-style:none;padding-left:0;margin-bottom:0;">
            <li id="pwLength"><i class="fas fa-times"></i> At least 8 characters</li>
            <li id="pwUpper"><i class="fas fa-times"></i> Uppercase letter</li>
            <li id="pwLower"><i class="fas fa-times"></i> Lowercase letter</li>
            <li id="pwNumber"><i class="fas fa-times"></i> Number</li>
            <li id="pwSpecial"><i class="fas fa-times"></i> Special character</li>
          </ul>
        </div>
        <div class="error-message" id="passwordError"></div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;margin:8px 0;">
        <input type="checkbox" id="inviteUserCheckbox" name="invite" value="1"> Send invite link (user sets their own password)
      </label>
      <select name="role" required autocomplete="off" style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
        <option value="">Select Role</option>
        <option value="STUDENT">Student</option>
        <option value="TEACHER">Teacher</option>
        <option value="COORDINATOR">Coordinator</option>
        <option value="ADMIN">Admin</option>
      </select>
      <!-- Status is managed automatically: users.status='Active' on create, archive/unarchive via actions -->
      <input type="hidden" name="status" value="Active">
      <button type="submit" style="width:100%;padding:10px 0;background:#1d9b3e;color:#fff;border:none;border-radius:5px;font-weight:600;">Add User</button>
      <button type="button" onclick="document.getElementById('addUserModal').style.display='none'" style="width:100%;padding:10px 0;background:#ccc;color:#222;border:none;border-radius:5px;margin-top:8px;">Cancel</button>
    </form>
  </div>
</div>
<!-- Edit User Modal -->
<div id="editUserModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.2); z-index:2000; align-items:center; justify-content:center;">
  <div style="background:#fff; padding:30px 25px; border-radius:10px; max-width:400px; margin:60px auto; position:relative;">
    <h3 style="margin-bottom:18px;">Edit User</h3>
    <form id="editUserForm" autocomplete="off">
      <input type="hidden" name="id" id="editUserId">
      <input type="text" name="firstname" id="editFirstname" placeholder="First Name" required autocomplete="given-name" style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
      <input type="text" name="middlename" id="editMiddlename" placeholder="Middle Name" autocomplete="additional-name" style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
      <input type="text" name="lastname" id="editLastname" placeholder="Last Name" required autocomplete="family-name" style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
      <input type="text" name="id_number" id="editIdNumber" placeholder="ID Number" required autocomplete="username" style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
      <input type="email" name="email" id="editEmail" placeholder="Email" required autocomplete="email" style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
      <select name="role" id="editRole" required autocomplete="off" style="width:100%;margin-bottom:10px;padding:8px 10px;border:1px solid #ccc;border-radius:5px;">
        <option value="">Select Role</option>
        <option value="STUDENT">Student</option>
        <option value="TEACHER">Teacher</option>
        <option value="COORDINATOR">Coordinator</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button type="submit" style="width:100%;padding:10px 0;background:#1d9b3e;color:#fff;border:none;border-radius:5px;font-weight:600;">Save Changes</button>
      <button type="button" onclick="document.getElementById('editUserModal').style.display='none'" style="width:100%;padding:10px 0;background:#ccc;color:#222;border:none;border-radius:5px;margin-top:8px;">Cancel</button>
    </form>
  </div>
</div>
<!-- Confirm Modal -->
<div id="confirmModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.2); z-index:2100; align-items:center; justify-content:center;">
  <div style="background:#fff; padding:30px 25px; border-radius:10px; max-width:350px; margin:60px auto; position:relative; text-align:center;">
    <div id="confirmText" style="margin-bottom:18px;"></div>
    <button id="confirmYesBtn" style="padding:10px 20px;background:#dc3545;color:#fff;border:none;border-radius:5px;font-weight:600;margin-right:10px;">Yes</button>
    <button id="confirmNoBtn" style="padding:10px 20px;background:#ccc;color:#222;border:none;border-radius:5px;font-weight:600;">No</button>
  </div>
</div> 

<!-- Import Authorized IDs Modal -->
<div id="importAuthIdsModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.3); z-index:2150; align-items:center; justify-content:center;">
  <div style="background:#fff; padding:24px; border-radius:10px; max-width:460px; width:90%; margin:60px auto; position:relative;">
    <h3 style="margin-bottom:10px;">Import Authorized ID Numbers</h3>
    <p style="margin:0 0 10px 0; font-size:13px; color:#666;">Upload a CSV file with a header <code>id_number</code>. Optional column <code>status</code> defaults to <em>active</em>.</p>
    <form id="importAuthIdsForm" enctype="multipart/form-data">
      <input type="file" name="csv" accept=".csv" required style="width:100%;margin:8px 0;" />
      <div style="display:flex; gap:8px; margin-top:12px;">
        <button type="submit" class="action-btn" style="background:#1d9b3e;color:#fff;">Import</button>
        <button type="button" class="action-btn" style="background:#6c757d;color:#fff;" onclick="document.getElementById('importAuthIdsModal').style.display='none'">Cancel</button>
        <a href="#" id="downloadAuthSample" class="action-btn" style="background:#0d6efd;color:#fff; text-decoration:none;">Sample CSV</a>
      </div>
      <div id="importAuthIdsResult" style="margin-top:10px; font-size:13px; color:#444;"></div>
    </form>
  </div>
</div>

<!-- Add Authorized ID Modal -->
<div id="addAuthIdModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.3); z-index:2150; align-items:center; justify-content:center;">
  <div style="background:#fff; padding:24px; border-radius:10px; max-width:420px; width:90%; margin:60px auto; position:relative;">
    <h3 style="margin-bottom:10px;">Add Authorized ID</h3>
    <form id="addAuthIdForm">
      <label style="display:block; font-size:13px; color:#555; margin-bottom:6px;">ID Number (KLD-YY-XXXXXX)</label>
      <input type="text" id="addAuthIdInput" name="id_number" placeholder="KLD-22-000136" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px;" />
      <div id="addAuthIdError" class="error-message" style="margin-top:6px;"></div>
      <div style="display:flex; gap:8px; margin-top:12px; align-items:center;">
        <button type="submit" class="action-btn" style="background:#1d9b3e;color:#fff;">Add</button>
        <button type="button" class="action-btn" style="background:#6c757d;color:#fff;" onclick="document.getElementById('addAuthIdModal').style.display='none'">Cancel</button>
        <span id="addAuthIdHint" style="font-size:12px; color:#666; margin-left:auto;">Format: KLD-YY-XXXXXX</span>
      </div>
    </form>
  </div>
</div>

<!-- Edit Authorized ID Modal -->
<div id="editAuthIdModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.3); z-index:2150; align-items:center; justify-content:center;">
  <div style="background:#fff; padding:24px; border-radius:10px; max-width:420px; width:90%; margin:60px auto; position:relative;">
    <h3 style="margin-bottom:10px;">Edit Authorized ID</h3>
    <form id="editAuthIdForm">
      <input type="hidden" id="editAuthRowId" name="id" />
      <label style="display:block; font-size:13px; color:#555; margin-bottom:6px;">ID Number (KLD-YY-XXXXXX)</label>
      <input type="text" id="editAuthIdInput" name="id_number" placeholder="KLD-22-000136" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px;" />
      <div id="editAuthIdError" class="error-message" style="margin-top:6px;"></div>
      <div style="display:flex; gap:8px; margin-top:12px; align-items:center;">
        <button type="submit" class="action-btn" style="background:#1d9b3e;color:#fff;">Save</button>
        <button type="button" class="action-btn" style="background:#6c757d;color:#fff;" onclick="document.getElementById('editAuthIdModal').style.display='none'">Cancel</button>
      </div>
    </form>
  </div>
</div>