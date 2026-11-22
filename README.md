# Sit Spot Break

A Claude Code plugin that turns the time you spend waiting on Claude into mindful nature and sensory grounding micro-practices for Sit Spot Club. Every 45 minutes, the next time a turn runs longer than 15 seconds, a gentle sensory micro-break shows above the prompt: something for your eyes, ears, tactile grounding, breath, or daylight connection, acted out by a quiet pixel character. Press **Done**, **In 5 min** or **Skip**. It all happens in the terminal and runs locally: no network, no model calls, no tokens.

> **Sit. That's It. (sitspot.club)**

## The sensory micro-practices

| Practice | Setting key | What it is for |
| --- | --- | --- |
| Eye rest (20-20-20) | `eyes` | Eye strain: 20-20-20 gaze at the sky, clouds, or furthest tree |
| Sensory gating | `sound` | Auditory grounding: close eyes for 15s and notice the furthest sound |
| Touching wood | `wood` | Somatic desk grounding: touch real wood on desk, pencil, or windowsill |
| Ocean wave breath | `breathe` | Breathwork: 4-second inhale, hold, 4-second exhale |
| Step outside | `outside` | Circadian reset: 60-second micro-pause on porch, balcony, or doorstep |
| Weather / light check | `weather` | Nature connection: observe daylight, wind, and sky movement |

All of them can be done right next to your desk with no equipment.

Each practice is animated in pixel art using Sit Spot Club brand tokens (Forest Green `#2D5016`, Warm Gold/Tan `#C8A96E`, Slate, and Off-White `#F5F0E8`), with countdowns and progress bars. Practices are picked at random from the moves you have on, one at a time, never the same move twice in a row. Terminals narrower than 54 columns get words and buttons only, and [`NO_COLOR`](https://no-color.org) is respected.

## Install

```
/plugin marketplace add https://github.com/Interest-Driven-Life/sit-spot-cli.git
/plugin install sit-spot-break@sit-spot-cli
```

Then `/reload-plugins` (or restart Claude Code). Or run it from a clone without installing:

```sh
git clone https://github.com/Interest-Driven-Life/sit-spot-cli.git
claude --plugin-dir ./sit-spot-cli
```

To update: `/plugin marketplace update sit-spot-cli`, then `/plugin update sit-spot-break@sit-spot-cli`. To remove it: `/plugin uninstall sit-spot-break@sit-spot-cli`.

Needs Claude Code 2.1.287 or newer. The animation needs a terminal at least 54 columns wide; narrower, the break shows as words and buttons only.

## The `/sitspot` command

The plugin registers `/sitspot` (and keeps `/break` as an alias):

| Command | What it does |
| --- | --- |
| `/sitspot` | Starts a Sit Spot break now with its animation: a random practice among the ones you have turned on. If a break is already on show, it stays and the command says so. |
| `/sitspot off` | Turns reminders off, in this session and the next ones, until `/sitspot on`. A snoozed break is dropped. `/sitspot` still starts a break when you ask for one. |
| `/sitspot on` | Turns reminders back on. The wait starts over from that moment, so no reminder shows straight away. |
| `/sitspot config` | Lists the settings as they apply now. |
| `/sitspot moves` | Lists every practice, its key, and whether it is on. |
| `/sitspot set <key> <value>` | Changes a setting, e.g. `/sitspot set waitSeconds 30` or `/sitspot set wood off`. |
| `/sitspot reset [key]` | Puts one setting back to its default, or all of them with no key. |

`/sitspot` runs at once, even while Claude is working. The mod's store holds only whether reminders are off and the settings you changed; Done, Skip and In 5 min keep no record.

## Settings

Installing asks nothing: every setting has a sensible default and the plugin works out of the box. To change one, use `/sitspot set` (see [the `/sitspot` command](#the-sitspot-command)); it applies at once and is kept for later sessions.

| Setting | Default | What it does |
| --- | --- | --- |
| `waitSeconds` | 15 | How long a turn must run before a break is suggested. 1 to 3600. |
| `intervalMinutes` | 45 | The shortest time between two breaks, counted from the session start for the first one: a break waits until this long has passed and a turn runs past `waitSeconds`. Never while Claude is idle. 1 to 1440; 0 gives every long turn a break. |
| one key per practice (see [the sensory micro-practices](#the-sensory-micro-practices)) | on | Whether that practice can be suggested. |

Turn off practices you don't want right now (`/sitspot set wood off`); with every practice off, no breaks are shown. Changing a setting keeps any break currently on show.

## What the hooks do

`hooks/register.tsx` hooks six events. It reads them and draws; it never changes what Claude sees or sends:

- `session.start`: reads whether you turned reminders off and the settings you changed, checks `NO_COLOR`, registers `/sitspot` and `/break`, and in an interactive session starts a 5-second timer that decides when a break is due.
- `command.run` for `/sitspot` (and `/break`): starts a break now, turns reminders off or on, or shows and changes settings.
- `turn.start`: notes when Claude's main turn began, so a long turn can be spotted.
- `turn.complete`: notes that the main turn ended and takes the scene off the spinner.
- `ui.render` on `Spinner`: while a break is on show and Claude works, draws its scene above the spinner line and leaves the spinner as it is. Below 54 columns, or outside the terminal, it hands the spinner back unchanged.
- `ui.render` on `AbovePrompt`: shows the break's words, gentle signoff, and Done, In 5 min and Skip buttons, with the scene above them while Claude is idle.

While a scene is on screen, a timer repaints it about 12 times a second; it stops as soon as the break is answered.

## Privacy: what data it sends

None. The plugin makes no network requests and no model calls, so it uses none of your tokens. It doesn't read your prompts, Claude's replies, your files, or your code: it only sees when a turn starts and ends, the terminal size, and `NO_COLOR`. Every line of text is written into the mod; none is generated. It stores two things in Claude Code's own plugin store: whether you paused reminders (`paused`) and settings you changed with `/sitspot set` (`settings`). It keeps no record of breaks you took or skipped. There is no server, so there is no privacy policy to link.

Sit. That's It. (sitspot.club)
