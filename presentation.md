
# Level Up Fitness: A Gamified, AI-Powered Fitness Application

---

## Slide 1: Title Slide

**Level Up Fitness**

A Gamified, AI-Powered Fitness Application

**Student Name:** …………………..
**Enrollment No.:** …………………..
**Course & Semester:** …………………..

---

## Slide 2: Project Objectives

- **Gamify Fitness:** To create a motivating and engaging user experience by incorporating game-like elements such as points, levels, and streaks.
- **AI-Powered Personalization:** To leverage a generative AI model to provide users with a virtual fitness coach and allow for the creation of custom workout and diet plans.
- **Incentivize Progress:** To build a rewarding system where users can redeem their accumulated points for real-world value.
- **Full Administrative Control:** To develop a secure and functional admin dashboard for comprehensive management of the application and its users.

---

## Slide 3: The Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend & Database:** Firebase (Authentication and Firestore Database)
- **Generative AI:** Google's Genkit
- **UI Components:** ShadCN

---

## Slide 4: Data Model & ER Diagram

- **Database:** Firestore is used as the NoSQL database.
- **Key Collections:** The main collections are `users`, `gyms`, and `redemptionRequests`. User-specific data like workout history is stored in sub-collections.

**ER Diagram:**
```
+------------------+ 1      M +----------------------+
|       Gyms       |<----------(member_of)----|        Users         |
|------------------|                          |----------------------|
| PK gymId         |                          | PK uid               |
|    name          |------(owned_by)----1>     |    username          |
|    ownerId (FK)  |                          |    role (user, admin)  |
+------------------+                          |    points, level     |
                                              |    gymId (FK)        |
                                              +----------------------+
                                                         |
                                        +----------------+----------------+
                                        |                |                |
                                   1..N |           1..N |           1..N |
                           +--------------+  +-------------+  +--------------------+
                           | workoutHistory |  | dietHistory |  | redemptionRequests |
                           +--------------+  +-------------+  +--------------------+
```

---

## Slide 5: Key Feature - User Authentication

- Secure login and registration functionality using Firebase Authentication.
- Separate registration and login pages for a clean user flow.

**(Placeholder for Screenshot: Show the login or registration page)**

---

## Slide 6: Key Feature - The User Dashboard

- A central hub for users to view their daily plans, track stats, and engage with the community.
- Displays key information like current level, points balance, and fitness goal.

**(Placeholder for Screenshot: Show the main user dashboard page)**

---

## Slide 7: Key Feature - Daily Quests & Diet Tracking

- Users receive daily workout and diet plans assigned by an administrator.
- Interactive checklist for workouts and a simple logging system for diet.
- Earn points and maintain streaks by completing daily tasks.

**(Placeholder for Screenshot: Show the "Today's Plan" card with workout and diet tabs)**

---

## Slide 8: Key Feature - AI-Powered Fitness Coach

- An integrated generative AI chat coach that provides real-time fitness and diet advice.
- The AI understands conversation history to give contextual and motivating responses.
- The coach's persona is designed to be encouraging, addressing the user as "Hunter."

**(Placeholder for Screenshot: Show the AI Coach chat interface with a sample conversation)**

---

## Slide 9: Key Feature - Points & Redemption System

- A complete end-to-end system for earning and redeeming points.
- Users can redeem points for cash via UPI, creating a tangible reward for their efforts.
- All redemption requests are sent to an admin for manual approval.

**(Placeholder for Screenshot: Show the "Redeem Points" page)**

---

## Slide 10: Key Feature - Comprehensive Admin Dashboard

- A secure, role-based backend for application management.
- Provides at-a-glance statistics on total users, active users, and the total points in the system.

**(Placeholder for Screenshot: Show the top section of the admin dashboard with the stat cards)**

---

## Slide 11: Key Feature - User Management & Progress Tracking

- Admins can view a list of all users, their levels, points, and activity status.
- A detailed user progress page shows an individual's full workout history, diet logs, and redemption history.

**(Placeholder for Screenshot: Show the user management table or an individual user's progress page)**

---

## Slide 12: Key Feature - Redemption Approval System

- A critical security feature where admins must manually approve or reject user redemption requests.
- The dashboard displays a queue of pending requests with all necessary details (user, amount, UPI ID).

**(Placeholder for Screenshot: Show the "Pending Redemptions" card on the admin dashboard)**

---

## Slide 13: Challenges & Solutions

- **Challenge:** Real-time data synchronization across the app.
- **Solution:** Implemented an efficient state management hook (`useUser`) that automatically re-fetches data after key actions.

- **Challenge:** Firestore queries requiring indexes that were not pre-configured.
- **Solution:** Refactored queries to be simpler and performed data sorting on the client side to prevent crashes.

- **Challenge:** Next.js build errors due to incorrect server-side exports.
- **Solution:** Restructured code to comply with Next.js Server Action constraints, ensuring only `async` functions were exported.

---

## Slide 14: Future Steps

- **User Testing:** Gather feedback from test users to refine the user experience.
- **UI/UX Polishing:** Further enhance the visual design and ensure consistency across the application.
- **Deployment:** Prepare and deploy the application to a production cloud hosting environment.
- **Expanded AI Features:** Enhance the AI to generate more complex, multi-day workout programs and provide proactive tips.

---

## Slide 15: Conclusion & Thank You

- **Successfully developed a feature-complete, gamified fitness application.**
- **Met all initial project objectives, including AI integration and a full administrative backend.**
- **Demonstrated proficiency in a modern, full-stack development environment.**

**Thank You!**

**Questions?**
