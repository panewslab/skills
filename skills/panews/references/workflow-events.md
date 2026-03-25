# Events

**Trigger**: User wants to find crypto industry events — summits, hackathons, roadshows, online or offline.
Common phrases: "Any upcoming events", "Any summits in Singapore", "Are there any hackathons", "Any free events".

## Steps

### 1. List or search events

```bash
node cli.mjs list-events [--search "<keyword>"] [--category <type>] [--country <code>] [--online true|false] [--paid false] [--take 15] --lang <lang>
```

**Event categories (`--category`)**:

| Value | Meaning |
|-------|---------|
| SUMMIT | Summit |
| TECH_SEMINAR | Tech seminar |
| LECTURE_SALON | Lecture / salon |
| COCKTAIL_SOCIAL | Social / networking |
| ROADSHOW | Roadshow |
| HACKATHON | Hackathon |
| EXHIBITION | Exhibition |
| COMPETITION | Competition |
| OTHER | Other |

**Country / region codes (`--country`)**: AE CA CH CN DE FR GB JP KR SG TH TR US VN OTHER

### 2. View event details

The event list already contains full information (location, time, online/offline, paid/free, price, link, topic tags).
For more information, direct the user to the `url` field.

## Output requirements

- Include time, location, and type for each event
- Indicate if it's free (`isPaid=false`) or online (`isOnline=true`)
- Show price information if available
- Do not evaluate the quality or value of events
