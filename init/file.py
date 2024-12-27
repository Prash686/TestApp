from PyPDF2 import PdfReader
import json

# Load the PDF file
pdf_path = '/mnt/data/VJTech_AdvJava_MCQs-3_protected_unlocked.pdf'
reader = PdfReader(pdf_path)

# Extract text from PDF
text = ""
for page in reader.pages:
    text += page.extract_text()

# Split text into lines and filter for MCQs
lines = text.split("\n")
questions = []
current_question = {}
options = []

for line in lines:
    line = line.strip()
    if line.endswith("?") and not line.startswith("Answer"):
        # Save the current question if it exists
        if current_question:
            if options and "Answer" in current_question:
                current_question.update({
                    "option1": options[0] if len(options) > 0 else "",
                    "option2": options[1] if len(options) > 1 else "",
                    "option3": options[2] if len(options) > 2 else "",
                    "option4": options[3] if len(options) > 3 else "",
                })
                questions.append(current_question)
            current_question = {}
            options = []
        # Start a new question
        current_question = {"question": line, "marks": 1}
    elif line.startswith(("A.", "B.", "C.", "D.")) and len(line.split(" ", 1)) > 1:
        # Collect options safely
        options.append(line.split(" ", 1)[1].strip())
    elif line.startswith("Answer") and len(line.split(" ", 1)) > 1:
        # Extract the correct answer
        answer = line.split(" ", 1)[1].strip().lower()
        current_question["Answer"] = "option" + answer if answer in ["a", "b", "c", "d"] else answer

# Add the last question if it exists
if current_question and "Answer" in current_question:
    current_question.update({
        "option1": options[0] if len(options) > 0 else "",
        "option2": options[1] if len(options) > 1 else "",
        "option3": options[2] if len(options) > 2 else "",
        "option4": options[3] if len(options) > 3 else "",
    })
    questions.append(current_question)

# Save questions to JSON file
output_path = '/mnt/data/AdvancedJava_MCQs.json'
with open(output_path, 'w') as json_file:
    json.dump(questions, json_file, indent=4)

print(f"Questions have been saved to {output_path}")