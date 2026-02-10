In analytical systems, actors preceed content.

After setting up the project i.e. committing empty schema file. we will be creating the first model.

Now for a large system there can be many actors, content, and actions.

but the rule says:

> The first table should represent the most stable, least frequently changing concept in the system.

# How to actualy create the first model?

The first model should represent the most stable, least frequently changing concept in the system. This is often an "actor" or a "user" in many systems, as they tend to be more stable than content or actions.

In our system there are three main entities: user, video and and event.

Out of theem the user is the most stable one and simplest too. So we will start with the user model.

Before we start writing the actual model, we need to first think and understand the purpose of it, why should it exists and what things it will be capturing and will not be capturing explicitly.

# while creating the user model

many attributes can be put like, role and is active and all that, but the role here is not actually relavent for the system.  
also the status already defines multiple like active, deleted, suspended or like that, so separately storing `is_active` is just a redundancy.
