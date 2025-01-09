from datasets import load_dataset
import json
import random
from typing import Dict, List

SELECTED_SUBJECTS = [
    'astronomy',
    'college_computer_science',
    'high_school_mathematics',
    'world_religions',
    'high_school_psychology',
    'logical_fallacies',
    'philosophy',
    'high_school_world_history',
    'machine_learning',
    'moral_scenarios',
    'business_ethics',
    'college_biology',
    'computer_security',
    'high_school_geography',
    'high_school_chemistry',
    'marketing',
    'nutrition',
    'prehistory',
    'professional_psychology',
    'virology'
]

def get_formatted_questions(subject: str, questions: List, num_questions: int = 25):
    formatted_questions = []
    
    for i, item in enumerate(questions):
        formatted_question = {
            "id": f"{subject.lower().replace(' ', '_')}_{i}",
            "text": item['question'],
            "options": [
                {"id": "A", "text": item['choices'][0]},
                {"id": "B", "text": item['choices'][1]},
                {"id": "C", "text": item['choices'][2]},
                {"id": "D", "text": item['choices'][3]}
            ],
            "correctAnswer": chr(65 + item['answer'])
        }
        formatted_questions.append(formatted_question)
    
    # randomly select desired number of questions
    selected_questions = random.sample(
        formatted_questions, 
        min(num_questions, len(formatted_questions))
    )
    
    return selected_questions

def main():
    quiz_data = {"topics": {}}
    
    for subject in SELECTED_SUBJECTS:
        dataset = load_dataset("cais/mmlu", subject, split="test")
        display_name = subject.replace('_', ' ').title()
        
        # add to our quiz data
        questions = get_formatted_questions(subject, dataset)
        quiz_data["topics"][subject] = {
            "name": display_name,
            "questions": questions
        }
    
    with open('quiz_questions.json', 'w', encoding='utf-8') as f:
        json.dump(quiz_data, f, indent=2, ensure_ascii=False)
    
    print("\nDataset statistics:")
    for topic, data in quiz_data["topics"].items():
        print(f"{data['name']}: {len(data['questions'])} questions")

if __name__ == "__main__":
    main()
