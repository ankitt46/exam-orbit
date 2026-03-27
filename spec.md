# Exam Orbit

## Current State
New project with no existing application files.

## Requested Changes (Diff)

### Add
- Full educational platform for JEE Main and NEET exam preparation
- Homepage with motivational quotes carousel, hero section, feature highlights
- Navigation bar: Home, PYQs, Tests, Study Material, About
- PYQ section: JEE/NEET tabs, subject filter (Physics, Chemistry, Math, Biology), year filter (2020-2025), MCQ with answer/solution reveal
- Test section: Full-length mock tests and chapter-wise tests, timer-based interface, score and analysis on submission
- Study Material section: Chapter-wise notes, important formulas cards
- Leaderboard: Top students ranked by test scores
- Daily Practice Questions: One featured question per day with streak tracking
- User authentication (login/signup via authorization component)
- Bookmark questions (stored per user)
- Dark mode toggle
- Motivational quotes section with rotating display and gradient background

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - User profiles with bookmarks and streak data
   - PYQ storage: questions with subject, year, exam type, options, answer, solution
   - Test definitions: full-length and chapter-wise, with questions
   - Test submissions: store answers, calculate score, return analysis
   - Leaderboard: aggregate scores from test submissions
   - Daily question: rotate through question bank by date
   - Study material: notes and formula cards per subject/chapter

2. Frontend (React/TypeScript):
   - Multi-page SPA with React Router
   - Homepage: hero, motivational quote carousel, feature cards, daily question widget
   - PYQ page: dual tabs JEE/NEET, subject/year filters, MCQ cards with solution toggle
   - Tests page: test catalog cards, timer-based test interface, results/analysis screen
   - Study Material page: subject/chapter grid with notes and formula cards
   - Leaderboard page: ranked table with avatars
   - Auth modal: login/signup forms
   - Dark mode context with toggle
   - Bright energetic color scheme: blue, orange, green with gradients
   - Smooth animations and hover effects
   - Fully mobile-responsive
