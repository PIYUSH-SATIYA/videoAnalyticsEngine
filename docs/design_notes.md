# User model

- Every behavioral event in the system must reference a pre-existing user identity.

### Purpose

- The user will be a passive entity in our system, it represents identity and not the behaviour.
- This table will represent stable attributes and identity, so that all the behavioural events can referenecs a consistant actor.

### Attributes

- user_id (system generated)
- Names
- email (unique)
- phone
- status
    - it will just be a state and not a behaviour like inactive since a week, etc.
- timestamps
    - created At
    - updated At

### What this table will not store

- strictly anything that can be directly calculated from the events.
- anything related to video
- anything related to any event

# Video model

- it is another independent entity of our system that makes up the content and not anything particularly related to the analytics goal. 
- it is simply what the system is in which we are applying the analytics too.

### purpose 

- it is being designed separately to represent the media content that the user interacts with.
- to separate core content from the behavioural events performed.

### Attributes

- video_id (system generated)
- uploader_id (references a user identity)
- title
- description
- duration_seconds
- visibility
  - public
  - private
  - unlisted
- upload_timestamp

### what will not be stored ----------

- View counts
- Like counts
- Watch time
- Engagement metrics
- Any derived statistics
- Any event-related data

# Device model

- a device represents the env in which the user accesses the system.

### purpose


- To capture stable device characteristics.
- To allow analysis of usage patterns across platforms.
- To separate device metadata from session or event data.

### Attributes

- device_id (system generated)
- user_id (owner identity)
- device_type
  - mobile
  - desktop
  - tablet
  - tv

- operating_system
- browser
- created_at

### What this table will not store

- Session timestamps
- Login state
- IP addresses
- Behavioral history
- Event metadata

# Session model

- It represents a bounded interaction window between the user and the system

### purpose 

- To logically cluster the user activity by intervals of time.
- to provide temporal structure above individual events

### Attributes

- session_id (system generated)
- user_id (actor identity)
- device_id (context)
- started_at
- ended_at

### Invariants

- a session belongs to one user only
- a session belongs to one device only
- no to sessions can be overlapping for a device

### what this table will not store

- individual events
- video-level interactions

# Event model

- a single atomic behavioural action performed by the user

### purpose

- to record granular user behavior
- to support behavioral analytics

### Attributes

- event_id (system generated)
- session_id
- user_id (denormalized intentionally)
- video_id
- event_type
  - play
  - pause
  - seek
- quality_change
- exit
- event_timestamp (wall clock time)
- playback_position_seconds (video-relative time)
- metadata (event-specific structured payload)

### Design intents

- This table is append only.
- events are immutable
- An analytics must originate from this table

### what this table will not store

- aggregate counts
- any derived attributes
- any stateful flags

