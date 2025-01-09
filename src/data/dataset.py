from datasets import load_dataset
import json
import random
from typing import Dict, List

# Extended list of subjects
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

def get_formatted_questions(subject: str, questions: List, num_questions: int = 10) -> Dict:
    # Format all questions for this subject
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
            "correctAnswer": chr(65 + item['answer'])  # Convert 0,1,2,3 to A,B,C,D
        }
        formatted_questions.append(formatted_question)
    
    # Randomly select desired number of questions
    selected_questions = random.sample(
        formatted_questions, 
        min(num_questions, len(formatted_questions))
    )
    
    return selected_questions

def main():
    quiz_data = {"topics": {}}
    
    # Process each subject
    for subject in SELECTED_SUBJECTS:
        print(f"Processing {subject}...")
        
        # Load dataset for this subject
        dataset = load_dataset("cais/mmlu", subject, split="test")
        
        # Format the subject name for display
        display_name = subject.replace('_', ' ').title()
        
        # Get formatted questions for this subject
        questions = get_formatted_questions(subject, dataset)
        
        # Add to our quiz data
        quiz_data["topics"][subject] = {
            "name": display_name,
            "questions": questions
        }
    
    # Save to JSON file
    with open('quiz_questions.json', 'w', encoding='utf-8') as f:
        json.dump(quiz_data, f, indent=2, ensure_ascii=False)
    
    # Print statistics
    print("\nDataset statistics:")
    for topic, data in quiz_data["topics"].items():
        print(f"{data['name']}: {len(data['questions'])} questions")
    
    # Print total number of questions
    total_questions = sum(len(data['questions']) for data in quiz_data["topics"].values())
    print(f"\nTotal questions: {total_questions}")

if __name__ == "__main__":
    main()
