import logging
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
from fastapi import HTTPException
import language_tool_python

logger = logging.getLogger(__name__)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
grammar_tool = language_tool_python.LanguageTool('en-US')

try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    logger.info("✅ NLP model loaded successfully for Task 2")
except Exception as e:
    logger.error(f"❌ Error loading NLP model for Task 2: {e}")
    classifier = None

# 🔹 Phân tích semantic và các khía cạnh nội dung
def semantic_analysis_task2(essay: str, prompt: str) -> dict:
    try:
        emb1 = embedding_model.encode(prompt, convert_to_tensor=True)
        emb2 = embedding_model.encode(essay, convert_to_tensor=True)
        similarity = util.pytorch_cos_sim(emb1, emb2).item()

        aspects = {
            "argument_quality": "presents clear and logical arguments",
            "evidence_support": "supports ideas with relevant examples and evidence",
            "counter_argument": "addresses opposing views and counters them effectively",
            "cohesion": "uses cohesive devices and logical progression of ideas",
            "lexical_range": "uses a wide range of vocabulary appropriately",
            "structure": "has a clear structure with introduction, body paragraphs and conclusion"
        }

        aspect_scores = {}
        for aspect, desc in aspects.items():
            result = classifier(essay, [desc], multi_label=False)
            aspect_scores[aspect] = round(result["scores"][0] * 10, 1)

        return {
            "overall_similarity": round(similarity * 10, 1),
            "aspects": aspect_scores
        }

    except Exception as e:
        logger.error(f"❌ Error in semantic analysis for Task 2: {e}")
        return {"overall_similarity": 0.0, "aspects": {}}

# 🔹 Phân tích ngữ pháp (Grammar Accuracy)
def analyze_grammar_accuracy(text: str) -> float:
    matches = grammar_tool.check(text)
    total_words = len(text.split())
    error_rate = len(matches) / total_words if total_words > 0 else 1
    return round(max(0, 1 - error_rate) * 9, 1)

# 🔹 Hàm chấm điểm chính cho Task 2
async def grade_task2(prompt: str, student_answer: str) -> dict:
    try:
        if classifier is None:
            raise HTTPException(status_code=500, detail="NLP model not loaded")

        categories = [
            "Task Response",
            "Coherence & Cohesion",
            "Lexical Resource"
            # ➤ GR&A được xử lý riêng
        ]

        similarity = semantic_analysis_task2(student_answer, prompt)
        aspect = similarity["aspects"]

        classification = classifier(student_answer, categories, multi_label=True)
        base_scores = {
            label: round(score * 9, 1)
            for label, score in zip(classification["labels"], classification["scores"])
        }

        # 🔸 Task Response boosted by argument-related aspects
        task_response_adjusted = (
            aspect.get("argument_quality", 0) * 0.4 +
            aspect.get("evidence_support", 0) * 0.3 +
            aspect.get("counter_argument", 0) * 0.3
        )
        base_scores["Task Response"] = round(
            (base_scores["Task Response"] + task_response_adjusted) / 2, 1
        )

        # 🔸 Coherence & Cohesion improved by structure & cohesion analysis
        cohesion_score = (
            aspect.get("structure", 0) * 0.4 +
            aspect.get("cohesion", 0) * 0.6
        )
        base_scores["Coherence & Cohesion"] = round(
            (base_scores["Coherence & Cohesion"] + cohesion_score) / 2, 1
        )

        # 🔸 Lexical Resource improved by lexical range aspect
        base_scores["Lexical Resource"] = round(
            (base_scores["Lexical Resource"] + aspect.get("lexical_range", 0)) / 2, 1
        )

        # 🔸 Grammatical Range & Accuracy (sử dụng grammar_tool)
        base_scores["Grammatical Range & Accuracy"] = analyze_grammar_accuracy(student_answer)

        # 🔹 Final Band Score
        final_band = round(sum(base_scores.values()) / len(base_scores), 1)

        if final_band >= 8.5:
            grade = "Excellent"
        elif final_band >= 7:
            grade = "Good"
        elif final_band >= 5:
            grade = "Satisfactory"
        else:
            grade = "Needs Improvement"

        return {
            "prompt": prompt,
            "student_answer": student_answer,
            "score": {
                **base_scores,
                "Final Score": final_band,
                "Grade": grade,
                "Content Similarity": similarity["overall_similarity"],
                **aspect
            }
        }

    except Exception as e:
        logger.error(f"❌ Error grading Task 2: {e}")
        raise HTTPException(status_code=500, detail=f"Grading error: {str(e)}")
