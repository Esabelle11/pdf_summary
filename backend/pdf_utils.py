import pdfplumber

def extract_text_from_pdf(file_path):
    """
    Extracts text from a PDF file.

    Args:
        file_path (str): The path to the PDF file.
    Returns:
        str: The extracted text from the PDF.           
    """
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text=page.extract_text()
            if page_text:       
                text += page_text + "\n"
    return text