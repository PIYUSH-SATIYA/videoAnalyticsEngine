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
