from fastapi import HTTPException
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline
from langdetect import detect
import logging
import language_tool_python

logger = logging.getLogger(__name__)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
grammar_tool = language_tool_python.LanguageTool('en-US')

# 1. Semantic aspects
aspects = {
    "temporal_comparison": "compares employment data between 1993 and 2003",
    "gender_distribution": "analyzes employment by gender in different sectors",
    "sector_changes": "identifies which sectors increased or decreased",
    "overall_trends": "summarizes general workforce trends across all sectors",
    "structure": "has a clear structure with introduction, body and conclusion"
}

def semantic_similarity(text1, text2):
    emb1 = embedding_model.encode(text1, convert_to_tensor=True)
    emb2 = embedding_model.encode(text2, convert_to_tensor=True)
    overall = util.pytorch_cos_sim(emb1, emb2).item()
    scores = {
        k: round(classifier(text2, [desc], multi_label=False)["scores"][0] * 10, 1)
        for k, desc in aspects.items()
    }
    return round(overall * 10, 1), scores

def analyze_grammar(text: str) -> float:
    matches = grammar_tool.check(text)
    total_words = len(text.split())
    error_rate = len(matches) / total_words if total_words > 0 else 1
    return round(max(0, 1 - error_rate) * 9, 1)

def lexical_score(text: str) -> float:
    # Có thể thay thế bằng WordNet hoặc Datamuse API
    advanced_vocab = ["conversely", "respectively", "fluctuated", "significantly", "substantial"]
    used = sum(1 for word in text.lower().split() if word in advanced_vocab)
    return min(9.0, 5.0 + used * 1.0)

def cohesion_score(text: str) -> float:
    linking_words = ["however", "moreover", "in contrast", "in addition", "on the other hand"]
    count = sum(text.lower().count(w) for w in linking_words)
    return min(9.0, 5.0 + count * 0.5)

async def grade_task1(expected_text: str, description: str, student_answer: str):
    try:
        if not student_answer.strip():
            raise ValueError("Empty answer")

        lang = detect(student_answer)
        if lang != "en":
            # ❌ Không phải tiếng Anh => điểm 0 cho tất cả tiêu chí
            score_dict = {
                "Task Achievement": 0.0,
                "Coherence & Cohesion": 0.0,
                "Lexical Resource": 0.0,
                "Grammatical Range & Accuracy": 0.0,
                "Content Similarity": 0.0,
                "Final Score": 0.0,
                "Grade": "Needs Improvement"
            }
            # Thêm các aspect scores = 0
            for k in aspects:
                score_dict[k.replace("_", " ").title()] = 0.0

            return {
                "score": score_dict,
                "description": description,
                "student_answer": student_answer,
                "warning": "Answer must be written in English."
            }

        sim_score, aspect_scores = semantic_similarity(description, student_answer)
        grammar = analyze_grammar(student_answer)
        vocab = lexical_score(student_answer)
        cohesion = cohesion_score(student_answer)

        aspect_weights = {
            "temporal_comparison": 0.25,
            "gender_distribution": 0.25,
            "sector_changes": 0.2,
            "overall_trends": 0.2,
            "structure": 0.1
        }
        ta_aspect = sum(aspect_scores[k] * w for k, w in aspect_weights.items())
        task_achievement = round((sim_score + ta_aspect) / 2, 1)

        score_dict = {
            "Task Achievement": task_achievement,
            "Coherence & Cohesion": cohesion,
            "Lexical Resource": vocab,
            "Grammatical Range & Accuracy": grammar,
            "Content Similarity": sim_score,
            "Final Score": round((task_achievement + cohesion + vocab + grammar) / 4, 1)
        }

        final = score_dict["Final Score"]
        score_dict["Grade"] = (
            "Excellent" if final >= 8.5 else
            "Good" if final >= 7 else
            "Satisfactory" if final >= 5 else
            "Needs Improvement"
        )
        score_dict.update({k.replace("_", " ").title(): v for k, v in aspect_scores.items()})
        return {"score": score_dict, "description": description, "student_answer": student_answer}

    except Exception as e:
        logger.error(f"❌ Error grading Task 1: {e}")
        raise HTTPException(status_code=500, detail=str(e))
