# **USER ROUTES AND THEIR FUNCTIONALITY**:

## User Routes Table

| Route | Method | Middleware | Controller | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/profile` | GET | `verifyJWT` | `getUserProfile` | Get detailed user profile |
| `/update` | PUT | `verifyJWT`, `validate` | `updateUserDetails` | Update username, email, or fullName |
| `/avatar` | PATCH | `verifyJWT`, `upload.single('avatar')` | `updateAvatar` | Update profile picture |
| `/delete-account` | DELETE | `verifyJWT`, `validate` | `deleteAccount` | Permanently delete user account |

---

## CONTROLLERS FOR EACH ROUTE:

| Controller | Functionality |
| :--- | :--- |
| `getUserDetails` | Fetches complete user profile (similar to `/current-user` but can include more details like stats, preferences) |
| `updateUserDetails` | Updates username, email, `fullName`. If email changes: resets verification, clears tokens, sends notification to old email |
| `updateAvatar` | Uploads new profile picture, deletes old one from **Cloudinary**, updates user record |
| `deleteUserAccount` | Verifies password, deletes **all** user data including uploaded files, clears cookies, permanently removes account |