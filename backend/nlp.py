from transformers import pipeline,AutoTokenizer
from keybert import KeyBERT

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
kw_model = KeyBERT(model='distilbert-base-nli-mean-tokens')
tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")

def summarize_text(text, max_length=300, min_length=50):

    # Tokenize first
    inputs = tokenizer(text, truncation=True, max_length=1024)

    truncated_text = tokenizer.decode(inputs["input_ids"], skip_special_tokens=True)

    result = summarizer(
        truncated_text,
        max_length=max_length,
        min_length=min_length,
        do_sample=False
    )

    return result[0]['summary_text']


def extract_keywords(text, top_k=10):
    keywords = kw_model.extract_keywords(text, top_n=top_k)
    return [kw for kw, score in keywords]
