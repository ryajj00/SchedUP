# SchedUP — BUILD SPECIFICATION

> **Document purpose:** This file is the authoritative implementation specification for the SchedUP MVP.  
> **Audience:** AI coding agents and developers.  
> **Priority:** Correctness, security, maintainability, predictable behavior, and a simple mobile UX.

---

# 1. Project Overview

Build **SchedUP**, a mobile application for students who want to build their class schedule and automatically detect time conflicts.

SchedUP supports two ways of adding courses:

1. **Manual entry**
2. **AI-powered schedule image scanning**

The application displays courses in a mobile-friendly weekly schedule and automatically identifies overlapping classes.

## Current Implementation Status

The current MVP implementation includes:

- Expo Router navigation with Schedule, Scan, Profile, and Settings tabs
- Manual course creation, editing, and deletion
- Local schedule persistence with AsyncStorage
- Time validation and client-side conflict detection
- Schedule filters for All, Today, Week, and Conflicts
- Timetable image selection from the gallery or camera
- Image preview, backend scan review, uncertainty indicators, and user-confirmed import
- Persisted light/dark theme preference
- Stitch-based Settings screen with persisted time format, conflict-engine, transit-buffer, and duplicate-import preferences
- Two-step local schedule reset action
- Backend request validation, image validation, rate limiting, and AI response validation
- Configurable mock and OpenAI vision providers

Remaining roadmap items are individual scanned-course editing/removal, applying duplicate preferences during import, Claude provider support, export/calendar actions, and production deployment/authentication.

## Target Platforms

- iOS 16+
- Android 10+

## MVP Scope

The MVP includes:

- Manual course creation
- Course editing
- Course deletion
- Multi-day course selection
- Start/end time selection
- AI schedule image scanning
- AI scan review and correction
- Weekly schedule display
- Automatic conflict detection
- Local persistence using AsyncStorage
- Secure backend communication with the AI provider
- Input/output validation
- Error handling
- Basic unit testing

## Explicitly Out of Scope

Do **not** implement these features in the MVP:

- Prerequisite checking
- Multiple saved schedules/drafts
- Cloud user accounts
- Social features
- Course registration/enrollment
- School database integration
- Export to PDF
- Calendar synchronization
- Push notifications
- AI-generated schedule recommendations
- AI-based conflict detection
- Payment/subscription features
- Admin dashboards
- Complex state-management libraries unless clearly justified

Keep the MVP focused.

---

# 2. Core Architectural Principle

SchedUP must use a **three-layer architecture**.

```text
┌──────────────────────────────────────────────┐
│              LAYER 1 — MOBILE               │
│                                              │
│ React Native + Expo + TypeScript             │
│                                              │
│ UI                                           │
│ Navigation                                   │
│ Forms                                        │
│ Schedule display                             │
│ Local state                                  │
│ AsyncStorage                                 │
│ Conflict detection                           │
│ Image selection                              │
│ Scan review                                  │
└──────────────────────┬───────────────────────┘
                       │
                       │ HTTPS
                       ▼
┌──────────────────────────────────────────────┐
│              LAYER 2 — BACKEND              │
│                                              │
│ Secure API                                   │
│                                              │
│ Request validation                            │
│ Image validation                              │
│ Upload limits                                │
│ Rate limiting                                │
│ AI provider communication                    │
│ AI response validation                       │
│ Environment secrets                          │
└──────────────────────┬───────────────────────┘
                       │
                       │ Server-side API
                       ▼
┌──────────────────────────────────────────────┐
│                LAYER 3 — AI                 │
│                                              │
│ Vision-capable model                         │
│                                              │
│ Schedule extraction                           │
│ Structured JSON generation                   │
│ Uncertainty identification                   │
└──────────────────────────────────────────────┘
```

## Critical Responsibility Boundaries

### Mobile layer owns

- User interface
- Navigation
- Course forms
- Local schedule state
- AsyncStorage
- Conflict detection
- Schedule rendering
- Scan review
- User confirmation

### Backend layer owns

- Secure AI API access
- Image validation
- Request validation
- AI provider communication
- AI response parsing
- AI response schema validation
- Rate limiting
- Provider-specific implementation

### AI layer owns

- Reading schedule images
- Extracting visible schedule information
- Returning structured candidate course data
- Flagging uncertain information

### AI must NOT own

- Conflict detection
- Final course validation
- Automatic schedule insertion
- Business rules
- User decisions

The AI is an extraction assistant, not the source of truth.

---

# 3. Technology Stack

## Mobile

Use:

- React Native
- Expo managed workflow
- TypeScript
- Expo Router
- AsyncStorage
- expo-image-picker
- React Native StyleSheet or NativeWind

Prefer TypeScript throughout the project.

## Backend

The exact backend framework may be selected based on the development environment.

Suitable options include:

- Node.js
- TypeScript
- Express
- Fastify
- Serverless functions
- Edge/serverless API routes

Choose the simplest secure backend appropriate for the project.

Do not add unnecessary infrastructure.

## AI

Use a vision-capable AI API.

Possible providers:

- OpenAI
- Anthropic Claude (planned; provider slot reserved)

The current backend supports `mock` for deterministic local development and `openai` for vision extraction. Configure the provider with `AI_PROVIDER`; provider credentials remain server-side.

Provider-specific code must remain behind the backend service layer.

The mobile application should not depend directly on provider-specific SDKs.

---

# 4. Security Requirements

Security is a first-class requirement.

## NEVER expose AI API keys

Never do this in the mobile application:

```ts
const API_KEY = "sk-...";
```

Never put secret credentials in:

- React Native source code
- Git
- public Expo environment variables
- client-side configuration
- AsyncStorage
- app bundle assets
- logs

The mobile application must communicate with the backend.

```text
Mobile
  ↓
POST /api/scan-schedule
  ↓
Backend
  ↓
AI Provider
```

## Environment Variables

Backend secrets must be stored in environment variables.

Provide:

```text
.env.example
```

Example:

```env
AI_API_KEY=your_api_key_here
AI_PROVIDER=openai
```

The example file must contain placeholders only.

Never commit a real `.env`.

## Logging

Never log:

- API keys
- Authorization headers
- provider credentials
- raw secret configuration
- unnecessary image data

Avoid logging full AI responses in production.

## Input Security

The backend must:

- validate request structure
- validate MIME type
- reject unsupported file types
- enforce reasonable image size limits
- avoid arbitrary file execution
- avoid trusting client-provided metadata
- apply basic rate limiting when practical

---

# 5. Repository Structure

Recommended structure:

```text
SchedUP/
│
├── BUILD_SPEC.md
├── README.md
├── .env.example
├── .gitignore
│
├── mobile/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── CourseForm.tsx
│   │   │   ├── DaySelector.tsx
│   │   │   ├── ConflictWarning.tsx
│   │   │   └── TimeSlot.tsx
│   │   │
│   │   ├── screens/
│   │   │   ├── ScheduleScreen.tsx
│   │   │   ├── CourseFormScreen.tsx
│   │   │   └── ScanReviewScreen.tsx
│   │   │
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx
│   │   │
│   │   ├── services/
│   │   │   └── scanService.ts
│   │   │
│   │   ├── storage/
│   │   │   └── scheduleStorage.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── conflictDetection.ts
│   │   │   └── timeUtils.ts
│   │   │
│   │   ├── hooks/
│   │   │   └── useSchedule.ts
│   │   │
│   │   └── types/
│   │       └── schedule.ts
│   │
│   └── ...
│
└── backend/
    ├── src/
    │   ├── routes/
    │   │   └── scanSchedule.ts
    │   │
    │   ├── services/
    │   │   └── ai/
    │   │       ├── aiProvider.ts
    │   │       ├── openaiProvider.ts
    │   │       └── claudeProvider.ts
    │   │
    │   ├── validators/
    │   │   └── scheduleSchema.ts
    │   │
    │   └── utils/
    │       └── imageValidation.ts
    │
    └── ...
```

The exact file structure can vary slightly, but responsibilities must remain separated.

---

# 6. AI Development Rules

Before writing code, the coding agent must:

1. Read this entire `BUILD_SPEC.md`.
2. Follow the architecture described here.
3. Use TypeScript.
4. Keep secrets server-side.
5. Keep AI provider code inside the backend.
6. Keep conflict detection deterministic and local.
7. Never automatically import AI-generated courses.
8. Validate AI output before returning it to the mobile app.
9. Keep business logic separate from UI components.
10. Implement features incrementally.
11. Avoid unnecessary dependencies.
12. Do not add features outside the defined MVP scope without explicit approval.
13. Prefer small, testable modules over large components.
14. Do not silently change the data model or API contract.
15. Do not replace deterministic logic with AI.

---

# 7. Course Data Model

Create strongly typed models.

```ts
type Day =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun";

interface Course {
  id: string;
  courseName: string;
  days: Day[];
  startTime: string;
  endTime: string;
  source: "manual" | "scan";
}
```

Times must use:

```text
HH:mm
```

Examples:

```text
08:00
09:30
13:45
18:00
```

## Scanned Course

The scan-review model may include:

```ts
interface ScannedCourse {
  courseName: string;
  days: Day[];
  startTime: string;
  endTime: string;
  uncertain: boolean;
  uncertaintyReason?: string;
}
```

Do not use array indexes as permanent course IDs.

Generate stable unique IDs.

---

# 8. Manual Course Entry

Users must be able to add a course manually.

## Course Name

Required.

Validation:

- Trim whitespace.
- Must not be empty.
- Should have a reasonable maximum length.

## Days

Provide selectable chips:

```text
Mon Tue Wed Thu Fri Sat Sun
```

Allow multiple selections.

At least one day is required.

## Start Time

Use a mobile-friendly native time picker.

## End Time

Use a mobile-friendly native time picker.

## Time Validation

Require:

```text
endTime > startTime
```

Reject:

```text
09:00 → 09:00
10:30 → 09:30
```

Display a clear validation message.

---

# 9. Time Utilities

Create:

```text
src/utils/timeUtils.ts
```

Include utilities such as:

```ts
timeToMinutes(time: string): number;
isValidTime(time: string): boolean;
formatDisplayTime(time: string): string;
```

Convert:

```text
09:30
```

to:

```text
570
```

Do not perform scheduling comparisons using raw display strings.

---

# 10. Conflict Detection

Conflict detection must be deterministic.

Do not ask the AI whether two courses conflict.

Two courses conflict if:

1. They share at least one day.
2. Their time intervals overlap.

Use:

```text
startA < endB && endA > startB
```

after converting times to minutes.

## Examples

### Conflict

```text
Course A
09:00–10:00

Course B
09:30–10:30
```

Result:

```text
CONFLICT
```

### No Conflict

```text
Course A
09:00–10:00

Course B
10:00–11:00
```

Result:

```text
NO CONFLICT
```

Back-to-back classes are not conflicts.

### Different Days

```text
Course A
Monday 09:00–10:00

Course B
Tuesday 09:30–10:30
```

Result:

```text
NO CONFLICT
```

---

# 11. Conflict Detection Module

Create:

```text
mobile/src/utils/conflictDetection.ts
```

Recommended functions:

```ts
timeToMinutes()
coursesShareDay()
coursesOverlap()
findConflicts()
```

Conflict result:

```ts
interface CourseConflict {
  courseAId: string;
  courseBId: string;
  day: Day;
}
```

For example:

```ts
findConflicts(courses): CourseConflict[]
```

The UI should consume structured conflict information instead of implementing conflict logic itself.

---

# 12. Multiple-Day Conflict Example

Given:

```text
Course A
Mon/Wed
09:00–10:00

Course B
Wed/Fri
09:30–10:30
```

There is exactly one conflict:

```text
Wednesday
Course A ↔ Course B
```

Do not incorrectly report Monday or Friday as conflicts.

---

# 13. Schedule Screen

The Schedule screen is the primary screen.

It should display:

- SchedUP title
- Add Course button
- Scan Schedule button
- Weekly schedule
- Conflict warnings
- Empty state when there are no courses

The user should understand immediately:

- What classes they have
- When classes occur
- Which classes conflict

---

# 14. Mobile Schedule UI

Do not prioritize a dense desktop-style timetable.

Use a vertically scrollable day-based layout.

Example:

```text
MONDAY

09:00
┌──────────────────────────┐
│ IT101                    │
│ Programming              │
│ 9:00 AM – 10:30 AM       │
└──────────────────────────┘

11:00
┌──────────────────────────┐
│ MATH102                  │
│ Mathematics              │
│ 11:00 AM – 12:30 PM      │
└──────────────────────────┘


TUESDAY

08:00
┌──────────────────────────┐
│ ENG101                   │
│ English                  │
│ 8:00 AM – 9:00 AM        │
└──────────────────────────┘
```

For each day:

1. Filter courses containing that day.
2. Sort by start time.
3. Render chronologically.

Do not depend on insertion order.

---

# 15. Course Visual Design

Assign deterministic course colors.

A course should not randomly change color on every render.

Possible approach:

- derive from course ID
- assign from a fixed palette by index

However, conflict styling must take priority.

Conflicting courses should show:

- warning icon
- red border
- subtle red background
- readable warning text

Do not use color as the only indicator.

---

# 16. Conflict UI

Display specific conflicts.

Example:

```text
⚠ Conflict

IT101 overlaps with MATH102

Monday
9:00 AM – 10:00 AM
```

If multiple conflicts exist, show all relevant relationships.

Do not display only:

```text
Conflict detected
```

The user needs to know which courses are involved.

---

# 17. Add/Edit Screen

Use one reusable form for:

- creating a course
- editing a course

Fields:

- Course name
- Days
- Start time
- End time

Actions:

```text
Save
Cancel
Delete (edit mode only)
```

When editing:

- prefill existing values
- validate changes
- update the schedule
- rerun conflict detection
- persist changes

---

# 18. Delete Behavior

Allow deletion from the edit screen.

Ask for a simple confirmation before deleting.

After deletion:

- remove the course
- recalculate conflicts
- save schedule
- update UI

---

# 19. AI Schedule Scanning

The user must be able to:

- take a photo
- choose an image from the gallery

Use:

```text
expo-image-picker
```

Optionally use:

```text
expo-camera
```

Provide:

```text
Take Photo
Choose from Gallery
```

The image should be previewed before processing where practical.

---

# 20. Image Handling

Before sending an image:

1. Verify an image exists.
2. Validate its type.
3. Resize/compress if appropriate.
4. Avoid unnecessarily large uploads.
5. Show processing state.
6. Prevent duplicate submissions.

Do not permanently store scan images unless required.

The MVP only needs extracted schedule data.

---

# 21. Backend API

Create an endpoint:

```http
POST /api/scan-schedule
```

The mobile app sends the image to the backend.

Backend responsibilities:

1. Validate request.
2. Validate image.
3. Enforce size limits.
4. Send image to AI provider.
5. Parse AI response.
6. Validate AI response schema.
7. Normalize output.
8. Return structured JSON.

Example response:

```json
{
  "courses": [
    {
      "courseName": "Programming 1",
      "days": ["Mon", "Wed"],
      "startTime": "09:00",
      "endTime": "10:30",
      "uncertain": false
    }
  ]
}
```

---

# 22. Backend Provider Abstraction

Do not tightly couple the route to one AI provider.

Use an abstraction such as:

```ts
interface AIProvider {
  extractScheduleFromImage(
    image: Buffer | string
  ): Promise<unknown>;
}
```

Then implement provider-specific services:

```text
openaiProvider.ts
claudeProvider.ts
```

This allows the provider to be changed later without rewriting the mobile app.

---

# 23. AI Extraction Prompt

Use a strict extraction prompt similar to:

```text
You are extracting structured class schedule information from an image.

Identify all visible courses/classes.

Return ONLY valid JSON.

Expected schema:

{
  "courses": [
    {
      "courseName": "string",
      "days": ["Mon"],
      "startTime": "HH:mm",
      "endTime": "HH:mm",
      "uncertain": false,
      "uncertaintyReason": ""
    }
  ]
}

Rules:

- Days must be one or more of:
  Mon, Tue, Wed, Thu, Fri, Sat, Sun.
- Times must use 24-hour HH:mm format.
- Correctly interpret AM/PM.
- Do not invent courses that are not visible.
- If a field is unclear, make the most reasonable interpretation and set uncertain=true.
- Explain uncertainty in uncertaintyReason.
- If a course cannot be reliably extracted but enough information exists to represent it, include it with uncertain=true.
- Return valid JSON only.
```

The exact provider-specific message format may differ, but the semantic requirements must remain.

---

# 24. AI Is Not Trusted Input

Never assume AI output is correct.

The backend must validate the result.

Validation must include:

- valid JSON
- `courses` is an array
- `courseName` is a string
- `days` is an array
- every day is valid
- `startTime` matches `HH:mm`
- `endTime` matches `HH:mm`
- end time is later than start time

Use Zod or an equivalent schema validation library where appropriate.

---

# 25. Scan Review Screen

AI-generated courses must NEVER automatically enter the user's schedule.

The workflow must be:

```text
Image
 ↓
AI
 ↓
Backend validation
 ↓
Scan Review
 ↓
User correction
 ↓
User confirmation
 ↓
Actual schedule
```

Example:

```text
Review Scanned Schedule

✓ Programming 1
Mon • Wed
9:00 AM – 10:30 AM

⚠ Mathematics
Tue
10:00 AM – 11:00 AM
Needs review
```

The current MVP displays each extracted course for review and shows uncertainty details before import. Individual edit/remove controls remain roadmap work.

Provide:

```text
Add courses to schedule
```

only after the user has an opportunity to review the results. Confirmation imports the reviewed courses into the persisted schedule.

---

# 26. Uncertainty Handling

If AI returns:

```json
{
  "uncertain": true,
  "uncertaintyReason": "The end time is partially obscured."
}
```

The review UI must make this obvious.

Example:

```text
⚠ Needs review

The end time is partially obscured.
```

Uncertainty must never be silently hidden.

---

# 27. Empty AI Result

If no courses can be extracted:

```text
No classes could be detected.

Try another photo with:
• better lighting
• the entire schedule visible
• less blur
• readable text
```

Allow the user to retry.

---

# 28. AI Failure Handling

Handle:

- timeout
- network failure
- provider failure
- invalid provider response
- malformed JSON
- empty response
- validation failure

Show user-friendly errors.

Never expose:

- stack traces
- API keys
- provider credentials
- internal backend errors

---

# 29. Duplicate Protection

Before confirming scanned courses, detect potential duplicates.

Consider courses equivalent when they have:

- same normalized course name
- same days
- same start time
- same end time

If a duplicate exists, ask the user whether to:

- skip duplicate
- keep it

Do not silently insert duplicates.

---

# 30. AsyncStorage

Persist the current schedule locally.

Key:

```text
@schedUp/schedule
```

Create:

```text
mobile/src/storage/scheduleStorage.ts
```

Recommended functions:

```ts
getSchedule(): Promise<Course[]>;
saveSchedule(courses: Course[]): Promise<void>;
clearSchedule(): Promise<void>;
```

The current implementation also stores theme preferences under:

```text
@schedUp/preferences
```

Preferences include a `themeMode` value of `system`, `light`, or `dark`.

---

# 31. Storage Error Handling

If AsyncStorage contains malformed data:

- do not crash
- recover safely
- use an empty schedule when appropriate
- optionally show a recovery message

Storage errors should not make the entire application unusable.

---

# 32. State Management

Do not introduce Redux, Zustand, MobX, or another large state-management system unless there is a demonstrated need.

For this MVP:

- React state
- Context
- custom hooks

are sufficient.

A possible hook:

```ts
useSchedule()
```

Responsibilities can include:

- load schedule
- add course
- edit course
- delete course
- persist schedule
- expose conflicts

Keep the actual conflict algorithm in `utils/conflictDetection.ts`.

---

# 33. Navigation

Use Expo Router.

Recommended structure:

```text
Schedule
   │
   ├── CourseForm
   │
   └── ScanReview
```

Keep navigation simple.

The schedule screen should be the primary/root screen.

---

# 34. Loading States

Initial loading:

```text
Loading schedule...
```

AI processing:

```text
Analyzing schedule...
This may take a few seconds.
```

While scanning:

- disable repeated submissions
- prevent duplicate requests
- allow cancellation/back navigation only if safely handled

---

# 35. Permissions

Request permissions only when needed.

Do not request camera/gallery permissions immediately on app launch.

Handle:

- camera permission denied
- photo library permission denied
- restricted access

If denied, explain what the user needs to do.

---

# 36. Error Handling Principles

Errors must be:

- user-friendly
- actionable
- non-technical unless appropriate
- safe

Bad:

```text
AxiosError: 500 POST /api/scan-schedule
```

Good:

```text
We couldn't analyze this schedule.

Please check your internet connection and try again.
```

---

# 37. Empty State

When no courses exist:

```text
Your schedule is empty

Add your first course manually
or scan your class schedule.

[ Add Course ]

[ Scan Schedule ]
```

---

# 38. Accessibility

Support:

- accessible labels
- large touch targets
- readable typography
- adequate contrast
- screen reader compatibility

Do not rely solely on color.

Example course accessibility label:

```text
Programming 1, Monday and Wednesday,
9 AM to 10:30 AM,
Conflict with Mathematics.
```

---

# 39. Performance

Avoid premature optimization.

The expected number of courses is small.

Still:

- avoid unnecessary renders
- memoize derived schedule/conflict data when useful
- calculate conflicts from current courses
- avoid repeated parsing
- avoid sending unnecessarily large images

Prioritize readable code.

---

# 40. Edge Cases

The following must work correctly.

## Back-to-back

```text
09:00–10:00
10:00–11:00
```

No conflict.

## Partial overlap

```text
09:00–10:30
10:00–11:00
```

Conflict.

## Same start

```text
09:00–10:00
09:00–11:00
```

Conflict.

## Contained interval

```text
09:00–12:00
10:00–11:00
```

Conflict.

## Different days

```text
Monday 09:00–10:00
Tuesday 09:30–10:30
```

No conflict.

## Multiple days

```text
Course A:
Mon/Wed 09:00–10:00

Course B:
Wed/Fri 09:30–10:30
```

Conflict only on Wednesday.

## Invalid time

```text
13:00–12:00
```

Reject.

## Same start and end

```text
09:00–09:00
```

Reject.

## Missing day

Reject.

## Empty course name

Reject.

---

# 41. Testing Strategy

Testing should focus on business-critical logic.

## Conflict Tests

At minimum:

- no overlap
- partial overlap
- same start
- contained interval
- back-to-back
- different days
- multiple shared days
- multiple conflicts
- conflict on only one shared day

Example:

```ts
expect(
  coursesOverlap(
    course("09:00", "10:00"),
    course("10:00", "11:00")
  )
).toBe(false);
```

## Time Tests

Test:

- valid times
- invalid format
- midnight
- early morning
- afternoon
- evening
- end before start
- equal start/end

## Backend Tests

Test:

- valid image
- invalid MIME type
- oversized image
- malformed AI JSON
- valid AI JSON
- missing fields
- invalid day
- invalid time
- AI provider failure
- empty AI response

---

# 42. Development Phases

Implement incrementally.

## Phase 1 — Project Setup

- Expo
- TypeScript
- Expo Router
- folder structure
- base theme/styles

Do not build AI yet.

## Phase 2 — Course Model

- types
- time utilities
- validation

## Phase 3 — Manual Course Entry

- Add screen
- day selector
- time picker
- validation

## Phase 4 — Persistence

- AsyncStorage
- schedule storage service
- load/save behavior

## Phase 5 — Schedule UI

- day sections
- chronological ordering
- course cards
- course colors

## Phase 6 — Conflict Engine

- conflict utilities
- conflict result model
- conflict UI
- unit tests

## Phase 7 — Edit/Delete

- reusable form
- editing
- deletion
- recalculation

## Phase 8 — Image Input

- gallery
- camera
- preview
- image validation
- base64 image preparation for backend submission

## Phase 9 — Secure Backend

- backend setup
- environment variables
- scan endpoint
- request validation

## Phase 10 — AI Integration

- provider abstraction
- vision request
- extraction prompt
- response parsing
- schema validation

## Phase 11 — Scan Review

- extracted course list
- uncertainty indicators
- user confirmation before import
- import into the persisted schedule
- editing and removal (roadmap)
- duplicate detection (roadmap)

## Phase 12 — Hardening

- error handling
- permission handling
- security review
- tests
- UI polish
- README

---

# 43. Definition of Done

The MVP is complete when a user can:

1. Open SchedUP.
2. Add a course manually.
3. Select multiple days.
4. Select start/end times.
5. Save the course.
6. See it on the schedule.
7. Close and reopen the application.
8. Still see the course.
9. Add an overlapping course.
10. Immediately see a conflict.
11. Add a back-to-back course.
12. Confirm that it is not marked as a conflict.
13. Edit a course.
14. Delete a course.
15. Take or select a schedule image.
16. Send it to the secure backend.
17. Have the AI extract candidate courses.
18. Receive validated structured data.
19. Review the extracted courses.
20. Edit incorrect entries.
21. Remove incorrect entries.
22. See uncertain entries clearly flagged.
23. Confirm valid courses.
24. Add confirmed courses to the schedule.
25. Automatically detect conflicts among imported courses.
26. Persist the updated schedule locally.

---

# 44. Quality Requirements

The final application should feel like a reliable MVP, not a quick prototype.

Prioritize:

1. Correctness
2. Security
3. Predictable behavior
4. Maintainability
5. Good mobile UX
6. Clear error handling
7. Testability
8. Performance

Do not prioritize:

- unnecessary animations
- excessive dependencies
- complex architecture
- speculative features
- AI-generated business logic

---

# 45. Final Architecture Checklist

Before considering the implementation complete, verify:

## Mobile

- [x] React Native + Expo
- [x] TypeScript
- [x] Expo Router
- [x] AsyncStorage
- [x] Manual course entry
- [x] Course editing
- [x] Course deletion
- [x] Multi-day selection
- [x] Time validation
- [x] Weekly schedule
- [x] Conflict detection
- [x] Scan review
- [x] Image selection
- [x] Permission handling

## Backend

- [x] Secure API endpoint
- [x] AI API key stored server-side
- [x] Request validation
- [x] Image validation
- [x] Upload limits
- [x] AI provider abstraction
- [x] AI response validation
- [x] Error handling
- [x] Rate limiting where practical

## AI

- [x] Vision-capable model integration
- [x] Structured extraction
- [x] Strict prompt
- [x] Uncertainty flags
- [x] No automatic importing without user confirmation
- [x] No conflict detection by AI

## Testing

- [ ] Time utilities tested
- [ ] Conflict detection tested
- [ ] Multiple-day conflicts tested
- [ ] Back-to-back classes tested
- [ ] AI response validation tested
- [ ] Backend errors tested

---

# 46. Non-Negotiable Rules

These rules override convenience.

### Rule 1 — Never expose secrets

AI credentials belong only on the backend.

### Rule 2 — Never trust AI output

Every AI response must be validated.

### Rule 3 — Never automatically import AI results

The user must review and confirm scanned courses.

### Rule 4 — Never use AI for conflict detection

Conflict detection is deterministic application logic.

### Rule 5 — Back-to-back classes are not conflicts

A shared boundary is allowed.

```text
09:00–10:00
10:00–11:00
```

is valid.

### Rule 6 — Keep layers separated

UI, business logic, persistence, backend communication, and AI provider code should not become one large component/module.

### Rule 7 — Stay within MVP scope

Do not add unrelated features without explicit approval.

### Rule 8 — Prefer maintainable code

Readable, typed, testable code is more important than clever code.

### Rule 9 — Handle failure gracefully

Network, AI, storage, permissions, and validation failures must not crash the app.

### Rule 10 — Build incrementally

Complete and test each development phase before moving to the next.

---

# 47. Final Instruction to the Coding Agent

Treat this `BUILD_SPEC.md` as the source of truth for the SchedUP MVP.

Before implementing any feature:

1. Identify which architectural layer owns it.
2. Check whether it is inside the MVP scope.
3. Reuse existing types/utilities/services where possible.
4. Keep business logic independent from UI.
5. Validate external input.
6. Add tests for important business logic.
7. Do not expose secrets.
8. Do not silently change requirements.

If a requirement is ambiguous, choose the simplest implementation that preserves the architecture and MVP scope.

The goal is not to build the largest possible application.

The goal is to build a **secure, maintainable, reliable, and polished SchedUP MVP**.
