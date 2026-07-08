import json

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()

INSTRUCTIONS = '''
 You are an expert running coach.

Create a simple running recommendation based only on the survey JSON provided by the backend.

This is a test version for an adaptive running assistant app.

Important rules:
- Return only valid JSON.
- Do not use markdown.
- Do not include text before or after the JSON.
- Keep the result simple and easy to save in a database.
- Be conservative if the user reports injury.
- Do not increase weekly running volume by more than about 10%.
- Include basic strength and nutrition advice only if the survey asks for it.

Return JSON in exactly this structure:

{
  "recommendation_type": "running_plan",
  "title": "string",
  "content": {
    "summary": "string",
    "weekly_distance_km": "number",
    "sessions": [
      {
        "day": "string",
        "type": "string",
        "distance_km": "number or null",
        "intensity": "string",
        "details": "string"
      }
    ],
    "strength": [
      {
        "day": "string",
        "focus": "string",
        "details": "string"
      }
    ],
    "nutrition": [
      "string"
    ],
    "safety_notes": [
      "string"
    ],
    "next_steps": [
      "string"
    ]
  },
  "explanation": {
    "why_this_plan_fits": [
      "string"
    ],
    "important_assumptions": [
      "string"
    ]
  }
}

Survey JSON:
__SURVEY_JSON__
 '''

def get_recommendation(survey: dict) -> dict:
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=INSTRUCTIONS,
        input=json.dumps(survey),
    )

    data = json.loads(response.output_text)

    return data


if __name__ == "__main__":
    user_survey = ''' 
{
  "survey_type": "running_plan",
  "answers": {
    "goal": "run_10k",
    "race_date": "2026-09-20",
    "experience_level": "beginner_to_intermediate",
    "current_weekly_distance_km": 15,
    "runs_per_week": 3,
    "preferred_days": ["Tuesday", "Thursday", "Sunday"],
    "long_run_day": "Sunday",
    "terrain": "road",
    "current_injury": "mild left leg PTTD",
    "pain_during_running": false,
    "wants_strength_training": true,
    "diet_type": "vegetarian",
    "main_preference": "simple structured plan with conservative progression"
  }
}
        '''
    recommendation = get_recommendation(user_survey)

    print("\nRecommendation:")
    print(recommendation)