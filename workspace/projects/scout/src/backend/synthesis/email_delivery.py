"""
Email delivery via Resend API.
Handles daily brief delivery, alert emails, and user invites.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

BRIEF_EMAIL_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body {{ font-family: Georgia, 'Times New Roman', serif; max-width: 680px; margin: 0 auto; padding: 24px; color: #1a1a1a; background: #fff; }}
  h1 {{ font-size: 22px; color: #003366; border-bottom: 2px solid #003366; padding-bottom: 8px; }}
  h2 {{ font-size: 16px; color: #003366; margin-top: 24px; margin-bottom: 8px; }}
  ul {{ padding-left: 20px; }}
  li {{ margin-bottom: 8px; line-height: 1.5; }}
  p {{ line-height: 1.6; }}
  .footer {{ margin-top: 32px; padding-top: 16px; border-top: 1px solid #ccc; font-size: 13px; color: #666; }}
  .cta {{ display: inline-block; margin-top: 24px; padding: 10px 20px; background: #003366; color: white; text-decoration: none; border-radius: 4px; font-size: 14px; }}
  hr {{ border: none; border-top: 1px solid #e0e0e0; margin: 24px 0; }}
</style>
</head>
<body>
{brief_html}
<a href="{dashboard_url}/briefs" class="cta">View in Dashboard</a>
<div class="footer">
  <p>SCOUT Competitive Intelligence | General Mills<br>
  You're receiving this because you have brief delivery enabled.<br>
  <a href="{dashboard_url}">Manage preferences</a></p>
</div>
</body>
</html>"""

ALERT_EMAIL_TEMPLATE = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body {{ font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; }}
  .alert-box {{ background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 16px; }}
  .score {{ font-size: 24px; font-weight: bold; color: #d32f2f; }}
  a {{ color: #003366; }}
</style>
</head>
<body>
<div class="alert-box">
  <h2>🔴 High-Priority Intelligence Alert</h2>
  <div class="score">Relevance Score: {score}/100</div>
  <h3>{headline}</h3>
  <p>{summary}</p>
  <p><strong>Strategic relevance:</strong> {strategic_relevance}</p>
  <p><strong>Companies:</strong> {companies}</p>
  <p><strong>Source:</strong> <a href="{source_url}">{source_name}</a></p>
  <p><a href="{dashboard_url}/feed">View in SCOUT Dashboard</a></p>
</div>
</body>
</html>"""


async def send_brief_email(brief, recipients: list[str]) -> bool:
    """
    Send the daily brief to all recipients via Resend.
    Returns True on success, False on failure.
    """
    from config import get_settings
    import resend

    settings = get_settings()
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not configured — skipping email delivery")
        return False

    resend.api_key = settings.resend_api_key

    brief_date = brief.brief_date
    weekday = brief_date.strftime("%A")
    month = brief_date.strftime("%B")
    day = brief_date.strftime("%-d")
    subject = f"SCOUT Daily Brief | {weekday}, {month} {day}"

    html_body = BRIEF_EMAIL_TEMPLATE.format(
        brief_html=brief.content_html,
        dashboard_url=settings.frontend_url,
    )

    success_count = 0
    for email in recipients:
        try:
            params = resend.Emails.SendParams(
                from_=settings.email_from,
                to=[email],
                subject=subject,
                html=html_body,
                text=brief.content_text or "",
            )
            resend.Emails.send(params)
            success_count += 1
            logger.info("Brief email sent to recipient (email masked)")
        except Exception as exc:
            logger.error("Failed to send brief email: %s", exc)

    logger.info("Brief email delivery: %d/%d succeeded", success_count, len(recipients))
    return success_count > 0


async def send_alert_email(item) -> None:
    """Send a high-priority alert email for items scoring >= 85."""
    from config import get_settings
    from database import AsyncSessionLocal
    from models.user import User
    from sqlalchemy import select
    import resend

    settings = get_settings()
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not configured — skipping alert email")
        return

    resend.api_key = settings.resend_api_key

    html_body = ALERT_EMAIL_TEMPLATE.format(
        score=item.relevance_score,
        headline=item.headline,
        summary=item.summary or "",
        strategic_relevance=item.strategic_relevance or "",
        companies=", ".join(item.companies or []),
        source_url=item.source_url or "#",
        source_name=item.source_name or "Unknown",
        dashboard_url=settings.frontend_url,
    )

    # Send to all admins
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.role == "admin", User.receive_brief == True)
        )
        admins = result.scalars().all()

    for admin in admins:
        try:
            params = resend.Emails.SendParams(
                from_=settings.email_from,
                to=[admin.email],
                subject=f"SCOUT Alert: {item.headline[:80]}",
                html=html_body,
            )
            resend.Emails.send(params)
            logger.info("Alert email sent (masked) for item score=%d", item.relevance_score)
        except Exception as exc:
            logger.error("Failed to send alert email: %s", exc)


async def send_invite_email(email: str) -> None:
    """Send a magic link invite email via Resend."""
    from config import get_settings
    import resend

    settings = get_settings()
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not configured — invite email not sent")
        return

    resend.api_key = settings.resend_api_key

    login_url = f"{settings.frontend_url}/login"
    html = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
<h2>You've been invited to SCOUT</h2>
<p>SCOUT is General Mills' competitive intelligence platform.</p>
<p>Click the link below to sign in:</p>
<a href="{login_url}" style="display:inline-block;padding:12px 24px;background:#003366;color:white;text-decoration:none;border-radius:4px;">
  Sign In to SCOUT
</a>
<p style="margin-top:24px;color:#666;font-size:13px;">
  If you didn't expect this invitation, you can ignore this email.
</p>
</body>
</html>"""

    try:
        params = resend.Emails.SendParams(
            from_=settings.email_from,
            to=[email],
            subject="You've been invited to SCOUT",
            html=html,
        )
        resend.Emails.send(params)
        logger.info("Invite email sent (email masked)")
    except Exception as exc:
        logger.error("Failed to send invite email: %s", exc)


async def send_failure_email(brief_date, error: str) -> None:
    """Send a fallback email when brief generation fails."""
    from config import get_settings
    from database import AsyncSessionLocal
    from models.user import User
    from sqlalchemy import select
    import resend

    settings = get_settings()
    if not settings.resend_api_key:
        return

    resend.api_key = settings.resend_api_key

    html = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
<h2>SCOUT Brief Generation Failed</h2>
<p>The daily brief for <strong>{brief_date}</strong> could not be generated.</p>
<p>You can view raw intelligence items in the dashboard:</p>
<a href="{settings.frontend_url}/feed" style="display:inline-block;padding:12px 24px;background:#003366;color:white;text-decoration:none;border-radius:4px;">
  View Intelligence Feed
</a>
<p style="color:#666;font-size:12px;margin-top:24px;">Technical note: {error[:200]}</p>
</body>
</html>"""

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.receive_brief == True)
        )
        users = result.scalars().all()

    for user in users:
        try:
            params = resend.Emails.SendParams(
                from_=settings.email_from,
                to=[user.email],
                subject=f"SCOUT brief generation failed for {brief_date}",
                html=html,
            )
            resend.Emails.send(params)
        except Exception as exc:
            logger.error("Failed to send failure email: %s", exc)
