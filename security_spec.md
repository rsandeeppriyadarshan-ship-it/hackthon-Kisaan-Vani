# Firestore Security Specification — Krushak Bani Odisha

## 1. Access Control & Privacy Guarantees
- **One Master Record per Farmer**: Stored at `/farmers/{mobile}` where `{mobile}` is a validated 10-digit Indian mobile number (`^[6-9][0-9]{9}$`).
- **Strict Read/Write Isolation**:
  - A signed-in farmer can `get` and `write` **only** their own record (`/farmers/{mobile}`).
  - **No Listing All Farmers**: `allow list: if isAdmin();` on `/farmers/{mobile}` prevents any non-admin client from enumerating or listing all farmers in the database.
- **Bootstrapped Admin & Role-Based Admin Access**:
  - Only verified admin accounts (or `/users/{uid}.role == 'admin'`) can list all farmers, view all correction requests, or approve/reject locked-field updates.

## 2. Locked Field Immutability & Conflict Protection
- **Locked Fields**: `mobile`, `state`, `district`, `block`, `village`, `gpsLocation`.
- **Rule Enforcement**:
  - When a farmer updates their own `/farmers/{mobile}` document, `firestore.rules` enforces that `mobile`, `state`, `district`, `block`, `village`, and `gpsLocation` cannot be altered unless the caller is `isAdmin()`.
  - To change locked fields, the farmer submits a `/correctionRequests/{requestId}` document with `status == 'pending'`. Only `isAdmin()` can transition `status` to `'approved'` or `'rejected'` and update the locked fields on `/farmers/{mobile}`.

## 3. Photo Consent Enforcement
- If `request.resource.data.get('photoConsentGiven', false) == false`, `photoDataUrl` must not be stored on the server (`!('photoDataUrl' in request.resource.data) || request.resource.data.photoDataUrl == ''`).
