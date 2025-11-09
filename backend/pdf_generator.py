"""
PDF Generation Service
Creates professional PDF documents from business brief data
"""

from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.colors import HexColor
from io import BytesIO


def create_business_brief_pdf_from_structured(brief_data: dict, output_path: str = None) -> BytesIO:
    """Generate PDF from structured business brief data"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(output_path if output_path else buffer, pagesize=letter,
                          rightMargin=72, leftMargin=72,
                          topMargin=72, bottomMargin=72)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Define custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=HexColor('#7c3aed'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=HexColor('#9333ea'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        spaceAfter=12,
        alignment=TA_LEFT
    )
    
    idea_summary_style = ParagraphStyle(
        'IdeaSummary',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        spaceAfter=20,
        alignment=TA_LEFT,
        fontName='Helvetica',
        textColor=HexColor('#4b5563')
    )
    
    # Add title and idea summary
    story.append(Paragraph("Business Brief", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    idea_summary = brief_data.get("idea_summary", "")
    if idea_summary:
        story.append(Paragraph(idea_summary, idea_summary_style))
        story.append(Spacer(1, 0.3*inch))
    
    # Add date
    date_str = datetime.now().strftime("%B %d, %Y")
    story.append(Paragraph(f"<i>Generated on {date_str}</i>", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Add all sections
    sections = [
        ("executive_summary", "Executive Summary"),
        ("market_opportunity", "Idea & Market Opportunity"),
        ("target_audience", "Target Audience"),
        ("plan_of_action", "Plan of Action"),
        ("why_succeed", "Why This Idea Could Succeed")
    ]
    
    for section_key, section_title in sections:
        content = brief_data.get(section_key, "")
        if content:
            story.append(Paragraph(section_title, heading_style))
            content = content.replace('\n\n', '<br/><br/>').replace('\n', ' ')
            content = content.replace('**', '').replace('*', '')
            story.append(Paragraph(content, normal_style))
            story.append(Spacer(1, 0.2*inch))
    
    doc.build(story)
    
    if not output_path:
        buffer.seek(0)
        return buffer
    
    return None


def generate_pdf_filename(idea_name: str) -> str:
    """Generate a safe filename for the PDF"""
    safe_name = "".join(c for c in idea_name[:30] if c.isalnum() or c in (' ', '-', '_')).strip()
    safe_name = safe_name.replace(' ', '_')
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"business_brief_{safe_name}_{timestamp}.pdf"

