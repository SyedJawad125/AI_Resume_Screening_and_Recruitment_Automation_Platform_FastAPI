"""
app/services/report_service.py
────────────────────────────────
Generate downloadable PDF reports using ReportLab.

Report sections:
  1. Cover page (document info)
  2. Executive Summary
  3. Extracted Information
  4. Key Findings
  5. Citations
  6. Processing Information

Why ReportLab?
  - Industry standard Python PDF library
  - Full control over layout, fonts, tables
  - No external binary dependencies
  - Supports complex layouts, tables, headers/footers
"""

import io
import logging
from datetime import datetime
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)


class ReportService:

    def generate_report(
        self,
        document_info:     dict,
        summary:           dict = None,
        extraction_data:   dict = None,
        qa_pairs:          list[dict] = None,
    ) -> bytes:
        """
        Generate a PDF report and return as bytes.

        Args:
            document_info: filename, page_count, created_at, file_size_mb
            summary:       executive_summary, key_points, important_numbers, risks, conclusion
            extraction_data: dict of field → {value, status}
            qa_pairs:      list of {question, answer, citations}
        """
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table,
            TableStyle, HRFlowable, PageBreak,
        )

        buffer = io.BytesIO()
        doc    = SimpleDocTemplate(
            buffer,
            pagesize     = A4,
            rightMargin  = 2 * cm,
            leftMargin   = 2 * cm,
            topMargin    = 2 * cm,
            bottomMargin = 2 * cm,
        )

        styles = getSampleStyleSheet()
        story  = []

        # ── Custom styles ──────────────────────────────────────────
        title_style = ParagraphStyle(
            'CustomTitle',
            parent    = styles['Title'],
            fontSize  = 24,
            textColor = colors.HexColor('#1a237e'),
            spaceAfter = 20,
        )
        h1_style = ParagraphStyle(
            'CustomH1',
            parent    = styles['Heading1'],
            fontSize  = 16,
            textColor = colors.HexColor('#283593'),
            spaceAfter = 10,
            spaceBefore = 20,
        )
        h2_style = ParagraphStyle(
            'CustomH2',
            parent    = styles['Heading2'],
            fontSize  = 13,
            textColor = colors.HexColor('#3949ab'),
            spaceAfter = 8,
            spaceBefore = 14,
        )
        body_style = ParagraphStyle(
            'CustomBody',
            parent    = styles['Normal'],
            fontSize  = 10,
            leading   = 16,
            spaceAfter = 6,
        )
        bullet_style = ParagraphStyle(
            'Bullet',
            parent      = styles['Normal'],
            fontSize    = 10,
            leading     = 14,
            leftIndent  = 20,
            bulletIndent = 10,
            spaceAfter  = 4,
        )

        # ── Cover Page ─────────────────────────────────────────────
        story.append(Spacer(1, 3 * cm))
        story.append(Paragraph('AI Document Processing Report', title_style))
        story.append(HRFlowable(width='100%', thickness=2, color=colors.HexColor('#1a237e')))
        story.append(Spacer(1, 0.5 * cm))

        info_data = [
            ['Document:', document_info.get('filename', 'N/A')],
            ['Pages:',    str(document_info.get('page_count', 'N/A'))],
            ['Size:',     f"{document_info.get('file_size_mb', 0):.2f} MB"],
            ['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
        ]
        info_table = Table(info_data, colWidths=[3 * cm, 12 * cm])
        info_table.setStyle(TableStyle([
            ('FONTNAME',  (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE',  (0, 0), (-1, -1), 10),
            ('FONTNAME',  (0, 0), (0, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#283593')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING',    (0, 0), (-1, -1), 6),
        ]))
        story.append(info_table)

        # ── Executive Summary ──────────────────────────────────────
        if summary:
            story.append(PageBreak())
            story.append(Paragraph('Executive Summary', h1_style))
            story.append(HRFlowable(width='100%', thickness=1, color=colors.grey))
            story.append(Spacer(1, 0.3 * cm))

            exec_summary = summary.get('executive_summary', '')
            if exec_summary:
                story.append(Paragraph(exec_summary, body_style))

            key_points = summary.get('key_points', [])
            if key_points:
                story.append(Paragraph('Key Points', h2_style))
                for point in key_points:
                    story.append(Paragraph(f'• {point}', bullet_style))

            numbers = summary.get('important_numbers', [])
            if numbers:
                story.append(Paragraph('Important Numbers', h2_style))
                for num in numbers:
                    story.append(Paragraph(f'• {num}', bullet_style))

            risks = summary.get('risks', [])
            if risks:
                story.append(Paragraph('Risks & Issues', h2_style))
                for risk in risks:
                    story.append(Paragraph(f'⚠ {risk}', bullet_style))

            conclusion = summary.get('conclusion', '')
            if conclusion:
                story.append(Paragraph('Conclusion', h2_style))
                story.append(Paragraph(conclusion, body_style))

        # ── Extracted Information ──────────────────────────────────
        if extraction_data:
            story.append(PageBreak())
            story.append(Paragraph('Extracted Information', h1_style))
            story.append(HRFlowable(width='100%', thickness=1, color=colors.grey))
            story.append(Spacer(1, 0.3 * cm))

            table_data = [['Field', 'Value', 'Status']]
            for field, result in extraction_data.items():
                value  = str(result.get('value', '—')) if result.get('value') else '—'
                status = result.get('status', 'unknown')
                color  = colors.green if status == 'found' else (
                    colors.orange if status == 'uncertain' else colors.red
                )
                table_data.append([field.replace('_', ' ').title(), value, status.upper()])

            t = Table(table_data, colWidths=[5 * cm, 9 * cm, 3 * cm])
            t.setStyle(TableStyle([
                ('BACKGROUND',  (0, 0), (-1, 0), colors.HexColor('#283593')),
                ('TEXTCOLOR',   (0, 0), (-1, 0), colors.white),
                ('FONTNAME',    (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE',    (0, 0), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
                ('GRID',        (0, 0), (-1, -1), 0.5, colors.grey),
                ('TOPPADDING',  (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(t)

        # ── Q&A Section ────────────────────────────────────────────
        if qa_pairs:
            story.append(PageBreak())
            story.append(Paragraph('Questions & Answers', h1_style))
            story.append(HRFlowable(width='100%', thickness=1, color=colors.grey))

            for i, qa in enumerate(qa_pairs, 1):
                story.append(Spacer(1, 0.3 * cm))
                story.append(Paragraph(f'Q{i}: {qa["question"]}', h2_style))
                story.append(Paragraph(qa['answer'], body_style))
                if qa.get('citations'):
                    cites = ', '.join(
                        f'Page {c["page_number"]}' for c in qa['citations'] if c.get('page_number')
                    )
                    if cites:
                        story.append(Paragraph(f'Sources: {cites}', bullet_style))

        # ── Build PDF ──────────────────────────────────────────────
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        logger.info(f'[Report] Generated: {len(pdf_bytes)} bytes')
        return pdf_bytes

    def save_report(self, pdf_bytes: bytes, document_id: str) -> str:
        """Save report to disk. Returns file path."""
        path = Path(settings.REPORT_DIR) / f'report_{document_id}.pdf'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(pdf_bytes)
        return str(path)


report_service = ReportService()