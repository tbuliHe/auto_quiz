import PyPDF2
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_file):
    """从PDF文件提取文本"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        logger.info(f"成功从PDF中提取了{len(text)}个字符")
        return text
    except Exception as e:
        logger.error(f"PDF文本提取失败: {str(e)}")
        raise