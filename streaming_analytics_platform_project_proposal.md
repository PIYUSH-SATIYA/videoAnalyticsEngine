# Project Proposal

## Title
**Streaming Analytics Platform (Netflix / YouTube–Style Data Intelligence System)**

---

## 1. Overview

Modern streaming platforms such as Netflix, Amazon Prime, and YouTube do not primarily gain value from video delivery alone. Their competitive advantage lies in **how user behavior data is collected, stored, and analyzed** to improve engagement, retention, and revenue.

This project focuses on building the **data and analytics backbone** behind a streaming platform — not the video streaming infrastructure itself.

The system will simulate how large-scale platforms:

- capture fine‑grained user interaction events
- store them efficiently in a relational database
- process those events using SQL queries
- generate actionable business insights

The project emphasizes **database design, query optimization, and analytical reasoning**, aligning strongly with DBMS course objectives.

---

## 2. Problem Statement

Traditional CRUD-based applications store static records such as users, videos, or subscriptions. However, real-world data-driven systems require understanding **user behavior over time**.

Key challenges addressed:

- How to model continuous user activity in a database
- How to derive insights from raw event data
- How large platforms detect churn, engagement, and content performance
- How relational databases support analytical workloads

The project aims to answer questions such as:

- Which videos have the highest abandonment rate?
- Which content increases user retention?
- Which users are likely to cancel subscriptions?
- What content is trending in real time?

---

## 3. Project Scope

### Included

- User activity event collection
- Relational database schema design
- Event-based data modeling
- SQL-based analytics queries
- Index optimization
- Analytical dashboards (basic)

### Not Included

- Video streaming
- Media storage and CDN
- Transcoding
- DRM systems
- Recommendation machine learning models

This keeps the project focused on **database engineering rather than infrastructure complexity**.

---

## 4. Core Concept

The system is built on an **event-driven data model**.

Instead of storing computed metrics directly, the database stores only **atomic facts**:

> Who did what, on which content, and at what time.

All insights are derived later using SQL queries.

---

## 5. Example User Events

Each user interaction generates one row in the database.

Examples:

- video_started
- video_paused
- video_resumed
- seek_forward
- seek_backward
- video_completed
- exit
- ad_shown
- ad_clicked

This mirrors how real streaming platforms capture behavioral data.

---

## 6. Proposed Database Schema

### 6.1 Users

| Column | Type |
|------|------|
| user_id | PK |
| name | varchar |
| email | varchar |
| created_at | timestamp |

---

### 6.2 Videos

| Column | Type |
|------|------|
| video_id | PK |
| title | varchar |
| category | varchar |
| duration_seconds | int |
| release_date | date |

---

### 6.3 Subscriptions

| Column | Type |
|------|------|
| subscription_id | PK |
| user_id | FK |
| plan_type | varchar |
| start_date | date |
| end_date | date |
| is_active | boolean |

---

### 6.4 Watch Sessions

| Column | Type |
|------|------|
| session_id | PK |
| user_id | FK |
| device_type | varchar |
| session_start | timestamp |
| session_end | timestamp |

---

### 6.5 Watch Events (Core Table)

| Column | Type |
|------|------|
| event_id | PK |
| user_id | FK |
| video_id | FK |
| session_id | FK |
| event_type | varchar |
| watch_position_seconds | int |
| event_timestamp | timestamp |

This table may grow very large and represents the foundation of all analytics.

---

## 7. Key Analytical Queries

### 7.1 Video Abandonment Rate

A video is considered abandoned when it is started but not completed.

Metric:

```
abandonment_rate = (starts - completions) / starts
```

---

### 7.2 Average Watch Time

Calculate the average duration watched per video using timestamps and watch positions.

---

### 7.3 Completion Percentage

```
completion_percent = watched_duration / total_duration
```

---

### 7.4 Trending Content

Videos with highest number of views in the last 24 hours.

---

### 7.5 User Engagement Score

Derived using:

- frequency of sessions
- total watch time
- completion ratio

---

### 7.6 Churn Risk Detection

Users are flagged as churn‑risk if:

- no activity for N days
- multiple incomplete videos
- declining watch duration

---

## 8. Indexing Strategy

Important indexes include:

- (user_id, event_timestamp)
- (video_id, event_timestamp)
- (event_type)
- composite indexes for aggregation queries

These improve performance for analytical workloads.

---

## 9. Technology Stack

- **Database:** PostgreSQL
- **Backend:** Node.js + Express
- **ORM / Query Layer:** Prisma or raw SQL
- **Visualization:** Simple dashboard (charts)
- **Deployment:** Local or cloud VM

---

## 10. Learning Outcomes

This project enables hands-on understanding of:

- relational schema design
- normalization vs denormalization
- event-based data modeling
- SQL aggregation
- joins and subqueries
- indexing and performance tuning
- analytical query optimization

---

## 11. Team Contribution Plan

- **Member 1:** Schema design and normalization
- **Member 2:** Event ingestion APIs
- **Member 3:** Analytics queries and reports
- **Member 4:** Dashboard and visualization

---

## 12. Expected Outcome

The final system will:

- simulate real-world streaming data flows
- store millions of logical event records
- generate business-level insights using SQL
- demonstrate practical DBMS expertise

---

## 13. Conclusion

The Streaming Analytics Platform represents a realistic, industry-inspired database project focused on **data intelligence rather than surface-level application features**.

It closely reflects how modern technology companies leverage relational databases to drive product decisions and revenue optimization.

The project is feasible within one academic semester while providing deep exposure to real-world database engineering principles.

