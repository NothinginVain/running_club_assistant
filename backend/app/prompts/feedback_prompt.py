REMAINING_PLAN_FEEDBACK_PROMPT = """
Revise the currently selected running plan using all feedback attached to it.

Priority: safety, newest feedback, selected plan, then survey snapshot.

Rules:

- Return only the remaining period from revision_date onward.
- Preserve remaining week numbers, dates, and the final plan date unless
  feedback explicitly requests a schedule change.
- Use the selected plan as the baseline; do not rebuild it from scratch.
- Make only changes requested by feedback or required for safety.
- Preserve all unrelated content.
- Do not restore removed or absent features unless current feedback requests it.
- Add strength or mobility to existing training days unless feedback explicitly
  requests additional days.
- If stable training is requested, keep load stable across remaining full weeks.
- Reduce load when feedback says the plan is too difficult.
- Increase load only when explicitly requested and safe.
- Newest feedback wins when entries conflict.
- Never invent dates, runner facts, completed sessions, health information,
  equipment, availability, or preferences.
- Each weekly distance must equal its returned running-session distances.
- Return the required structured running-plan output with only remaining weeks
  and training days.
"""


def get_feedback_prompt(version: str = "remaining") -> str:
    prompts = {
        "remaining": REMAINING_PLAN_FEEDBACK_PROMPT,
    }

    if version not in prompts:
        raise ValueError(
            f"Unknown feedback prompt version: {version}"
        )

    return prompts[version]
