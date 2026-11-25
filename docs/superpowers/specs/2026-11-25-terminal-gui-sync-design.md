# Terminal and Web UI synchronisation — design

## Intent

Restore the visible relationship between Web UI actions and the controlled terminal. The terminal must remain open across application redraws, preserve its local transcript and show meaningful mission activity from the shared workspace audit.

## Goals

- preserve the selected sidebar tab, terminal transcript and open file when the application redraws;
- append audit lines for meaningful GUI mission actions such as vessel inspection and phase changes;
- keep existing configuration synchronisation for map and YAML changes;
- verify the behaviour through the real `virtualship-demo` component.

## Non-goals

- no operating-system shell access;
- no arbitrary terminal writes to expedition configuration;
- no redesign of the sidebar or mission state machine;
- no change to scientific rules or mission progression.

## Approaches considered

### Selected — preserve sidebar session and extend the shared audit

Capture the disposable sidebar's UI state before the application replaces its DOM, restore it on the new component and record mission actions in `DemoWorkspace.audit`. This is the smallest change that fixes both the disappearing terminal and the missing GUI activity.

### Rejected — move all sidebar state into the application shell

This would provide a single top-level state model but requires a broader refactor of component ownership and events. It is disproportionate to the regression.

### Rejected — append audit lines only

This would leave the terminal tab and command transcript vulnerable to every full application redraw, so the visible symptom would remain.

## Behaviour

When the learner opens Terminal and then uses the map, vessel or mission controls:

1. the Terminal tab remains selected;
2. existing command lines remain visible;
3. the shared audit gains a concise line for the accepted GUI action;
4. workspace revision lines continue to describe map and YAML changes;
5. rejected or no-op mission actions do not create misleading activity.

## Verification

An integration test will open Terminal, enter a command, perform GUI actions and assert that the tab, transcript and new audit lines all remain visible. Existing unit tests, typecheck, production build and browser smoke must continue to pass.
