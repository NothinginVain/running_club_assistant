import json

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()

INSTRUCTIONS = '''
 You are an expert running coach and practical nutrition assistant.

Your task is to create a personalized running recommendation based only on the survey JSON provided by the backend.

The user is using an adaptive running assistant app. The output will be saved into a PostgreSQL JSONB field called "content", and a second JSONB field called "explanation".

Important rules:
- Return only valid JSON.
- Do not use markdown.
- Do not include comments.
- Do not include text before or after the JSON.
- Do not invent medical certainty.
- If injury risk exists, give conservative guidance.
- Do not increase weekly running volume by more than the max percentage from the survey.
- Include strength, mobility, recovery, and basic nutrition only if the survey asks for it.
- Keep the plan practical and beginner-friendly.
- The plan should follow four phases:
  1. initial_phase: build consistency, mobility, and aerobic base
  2. progression_phase: gradually increase volume and add controlled intensity
  3. taper_phase: reduce load before race day
  4. recovery_phase: recover after the goal event

Return JSON in exactly this structure:

{
  "recommendation_type": "running_plan",
  "title": "string",
  "content": {
    "plan_summary": {
      "goal": "string",
      "duration_weeks": "number",
      "training_days_per_week": "number",
      "target_event_date": "string or null",
      "main_focus": ["string"]
    },
    "phases": [
      {
        "phase_name": "initial_phase",
        "weeks": "string",
        "purpose": "string",
        "weekly_focus": ["string"]
      },
      {
        "phase_name": "progression_phase",
        "weeks": "string",
        "purpose": "string",
        "weekly_focus": ["string"]
      },
      {
        "phase_name": "taper_phase",
        "weeks": "string",
        "purpose": "string",
        "weekly_focus": ["string"]
      },
      {
        "phase_name": "recovery_phase",
        "weeks": "string",
        "purpose": "string",
        "weekly_focus": ["string"]
      }
    ],
    "weekly_plan": [
      {
        "week": "number",
        "phase": "string",
        "estimated_weekly_distance_km": "number",
        "sessions": [
          {
            "day": "string",
            "session_type": "string",
            "distance_km": "number or null",
            "duration_minutes": "number or null",
            "intensity": "string",
            "details": "string"
          }
        ],
        "strength_sessions": [
          {
            "day": "string",
            "focus": "string",
            "duration_minutes": "number",
            "details": "string"
          }
        ],
        "mobility_sessions": [
          {
            "day": "string",
            "focus": ["string"],
            "duration_minutes": "number"
          }
        ],
        "recovery_notes": "string"
      }
    ],
    "nutrition_guidelines": {
      "normal_training_days": ["string"],
      "hard_training_days": ["string"],
      "pre_run": ["string"],
      "post_run": ["string"],
      "hydration": ["string"],
      "race_day_basic_strategy": ["string"]
    },
    "safety_notes": [
      "string"
    ],
    "next_adjustment_options": [
      "string"
    ]
  },
  "explanation": {
    "why_this_plan_fits": ["string"],
    "risk_management": ["string"],
    "progression_logic": "string",
    "important_assumptions": ["string"],
    "questions_for_next_iteration": ["string"]
  }
}

 '''

def get_recommendation(survey: dict) -> dict:
    response = client.responses.create(
        model="gpt-5-mini",
        instructions=INSTRUCTIONS,
        input=json.dumps(survey),
    )

    data = json.loads(response.output_text)
    return data
    print(json.dumps(data, indent=4))


if __name__ == "__main__":
    user_survey = ''' 
{
  "survey_type": "running_plan",
  "answers": {
    "goal": {
      "main_goal": "run_10k",
      "race_date": "2026-09-20",
      "goal_time": null,
      "priority": "finish_strong_and_healthy"
    },
    "personal_info": {
      "age": 35,
      "height_cm": 185,
      "weight_kg": 77
    },
    "running_background": {
      "running_experience": "beginner_to_intermediate",
      "recent_races": [
        {
          "distance": "10k",
          "result": "completed",
          "pace_per_km": "3:50"
        }
      ],
      "current_weekly_distance_km": 15,
      "longest_recent_run_km": 10,
      "current_training_frequency_per_week": 3
    },
    "availability": {
      "training_days_per_week": 3,
      "preferred_days": ["Tuesday", "Thursday", "Sunday"],
      "max_session_duration_minutes": 75,
      "preferred_long_run_day": "Sunday"
    },
    "injury_and_health": {
      "current_injuries": [
        {
          "area": "left_leg",
          "issue": "PTTD",
          "status": "mild",
          "notes": "pain is not constant but can appear after races"
        }
      ],
      "past_injuries": ["mild knee pain", "achilles discomfort"],
      "pain_during_running": false,
      "medical_clearance": "unknown"
    },
    "training_preferences": {
      "terrain": "road",
      "preferred_intensity": "balanced",
      "likes": ["structured plan", "clear weekly targets", "progressive training"],
      "dislikes": ["too much complexity", "overtraining"]
    },
    "strength_and_mobility": {
      "wants_strength_training": true,
      "strength_sessions_per_week": 2,
      "equipment": ["bodyweight", "resistance_band", "gym_available"],
      "mobility_focus": ["ankles", "hips", "hamstrings", "calves"]
    },
    "nutrition": {
      "diet_type": "vegetarian",
      "wants_basic_nutrition_guidance": true,
      "known_restrictions": [],
      "main_nutrition_goal": "support_training_and_recovery"
    },
    "safety_preferences": {
      "max_weekly_volume_increase_percent": 10,
      "prefer_conservative_progression": true,
      "include_recovery_weeks": true
    }
  }
}
        '''
    recommendation = get_recommendation(user_survey)

    print("\nRecommendation:")
    print(recommendation)