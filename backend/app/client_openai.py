from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()


def get_recommendation(prompt: str) -> str:
    response = client.responses.create(
        model="gpt-4.1-mini",
        instructions=f"""
       Your a experienced running golden medal coach
       base on below survey which has been delimited with *** give a decent running plan
       
       ***
        {prompt}
        ***    
        """,
        input=prompt,
    )

    return response.output_text


if __name__ == "__main__":
    user_prompt = ''' 
    {
            "goal": "run_10k",
            "main_concern": "building endurance safely",
            "current_level": "beginner",
            "injury_history": "mild knee pain",
            "running_surface": "road",
            "weekly_availability": 3,
            "preferred_training_days": [
                "Monday",
                "Wednesday",
                "Saturday"
            ],
            "current_weekly_distance_km": 5
        }
        '''
    recommendation = get_recommendation(user_prompt)

    print("\nRecommendation:")
    print(recommendation)