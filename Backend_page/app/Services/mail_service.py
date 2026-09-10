import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
import base64
from app.Services.email_templates import (
    BRAND_LOGO_MARK_B64,
    get_otp_email_template,
    get_organizer_welcome_template,
    get_exhibitor_welcome_template,
    get_team_invitation_template,
    get_user_welcome_template,
    get_booking_email_template,
    render_email_layout
)

_BRAND_LOGO_PNG_BYTES = base64.b64decode(BRAND_LOGO_MARK_B64)

def _get_smtp_config():
    server = os.getenv("MAIL_SERVER", "smtp.gmail.com").strip()
    try:
        port = int(os.getenv("MAIL_PORT", 587))
    except (ValueError, TypeError):
        port = 587
    username = (os.getenv("MAIL_USERNAME", "") or os.getenv("EMAIL_USER", "")).strip()
    # Auto-strip spaces that are copied from Google's 16-character app password format (e.g. 'cujb rsli ihts oewf' -> 'cujbrsliihtsoewf')
    password = (os.getenv("MAIL_PASSWORD", "") or os.getenv("EMAIL_PASS", "")).replace(" ", "").strip()
    return server, port, username, password

SMTP_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com").strip()
SMTP_PORT = int(os.getenv("MAIL_PORT", 587))
SMTP_USERNAME = (os.getenv("MAIL_USERNAME", "") or os.getenv("EMAIL_USER", "")).strip()
SMTP_PASSWORD = (os.getenv("MAIL_PASSWORD", "") or os.getenv("EMAIL_PASS", "")).replace(" ", "").strip()

import concurrent.futures
import logging

logger = logging.getLogger("mail_service")

# Background thread pool dedicated to non-blocking SMTP delivery
_mail_executor = concurrent.futures.ThreadPoolExecutor(max_workers=10, thread_name_prefix="bme_mail_worker")

def _smtp_deliver_task(msg, to_email):
    """Worker task executed in background thread pool to avoid blocking API threads.
    Sanitizes credentials, supports Port 465 (SSL) and Port 587 (TLS), and automatically
    falls back to SSL if TLS fails or is blocked on cloud platforms.
    """
    server_host, port, username, password = _get_smtp_config()

    if not username or not password:
        logger.warning(f"[MAIL SIMULATION] No credentials provided. Email to {to_email} skipped.")
        return

    # Primary delivery attempt
    try:
        if port == 465:
            with smtplib.SMTP_SSL(server_host, port, timeout=15) as server:
                server.login(username, password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(server_host, port, timeout=15) as server:
                server.starttls()
                server.login(username, password)
                server.send_message(msg)
        print(f"[SUCCESS] Background email delivered to {to_email} via {server_host}:{port}")
        return
    except Exception as primary_err:
        print(f"[MAIL WARN] Primary delivery to {to_email} via port {port} failed: {primary_err}")

    # Fallback attempt: If Port 587 failed (common cloud host port-block/TLS issue), try SSL Port 465
    if port != 465:
        try:
            print(f"[MAIL FALLBACK] Retrying delivery to {to_email} via SSL port 465...")
            with smtplib.SMTP_SSL(server_host, 465, timeout=15) as server:
                server.login(username, password)
                server.send_message(msg)
            print(f"[SUCCESS] Email delivered to {to_email} via {server_host}:465 (SSL fallback)")
            return
        except Exception as fallback_err:
            print(f"[MAIL ERROR] Fallback delivery on port 465 also failed: {fallback_err}")

def send_email(to_email, subject, message, is_html=False, qr_base64=None, sync=False):
    """Universal Email Sender with HTML Support, brand mark & QR attachments, and asynchronous non-blocking dispatch."""
    if not to_email:
        print("[WARN] send_email called with empty recipient email.")
        return False

    if is_html:
        msg = MIMEMultipart('related')
        msg_alternative = MIMEMultipart('alternative')
        msg.attach(msg_alternative)

        part = MIMEText(message, 'html')
        msg_alternative.attach(part)

        # Attach signature 3-pill brand mark as inline CID resource
        try:
            logo_img = MIMEImage(_BRAND_LOGO_PNG_BYTES, 'png')
            logo_img.add_header('Content-ID', '<bme_logo_mark>')
            logo_img.add_header('Content-Disposition', 'inline', filename='bme_logo_mark.png')
            msg.attach(logo_img)
        except Exception as err:
            print(f"[WARN] Brand logo image attachment failed: {err}")

        # Attach QR Code if provided
        if qr_base64:
            try:
                qr_data = base64.b64decode(qr_base64)
                img = MIMEImage(qr_data, 'png')
                img.add_header('Content-ID', '<qrcode>')
                img.add_header('Content-Disposition', 'inline', filename='qrcode.png')
                msg.attach(img)
            except Exception as err:
                print(f"[WARN] QR image attachment failed: {err}")
    else:
        msg = MIMEText(message, 'plain')

    import email.utils
    import uuid
    server_host, port, username, password = _get_smtp_config()
    msg['Subject'] = subject
    msg['From'] = username or "noreply@bookmyevent.com"
    msg['To'] = to_email
    msg['Message-ID'] = email.utils.make_msgid(domain='bookmyevent.com')
    msg['X-Entity-Ref-ID'] = str(uuid.uuid4())

    # Dev Mode Simulation if credentials are missing
    if not username or not password:
        print(f"[MAIL SIMULATION SUCCESS] Email to: {to_email} | Subject: '{subject}'")
        return True

    # High-concurrency async delivery
    if sync:
        _smtp_deliver_task(msg, to_email)
    else:
        _mail_executor.submit(_smtp_deliver_task, msg, to_email)

    return True

def send_otp_email(email, otp):
    """Send modern HTML OTP verification email."""
    subject, html = get_otp_email_template(otp, "verification")
    send_email(email, subject, html, is_html=True)

def send_otp_email_reset(email, otp):
    """Send modern HTML password reset OTP email."""
    subject, html = get_otp_email_template(otp, "reset")
    send_email(email, subject, html, is_html=True)

def send_organizer_welcome_email(email, name, company_name=None):
    """Send welcome email to newly onboarded Event Organizers."""
    subject, html = get_organizer_welcome_template(name, company_name)
    send_email(email, subject, html, is_html=True)

def send_exhibitor_welcome_email(email, name, company_name=None, category=None):
    """Send welcome email to newly onboarded Exhibitor Vendors."""
    subject, html = get_exhibitor_welcome_template(name, company_name, category)
    send_email(email, subject, html, is_html=True)

def send_team_invitation_email(email, name, org_name, role_name, raw_token, temp_password=None):
    """Send team member invitation email with secure join link and direct credentials."""
    subject, html = get_team_invitation_template(name, org_name, role_name, raw_token, temp_password=temp_password)
    send_email(email, subject, html, is_html=True)

def send_user_welcome_email(email, name):
    """Send welcome email to newly registered general users and attendees."""
    subject, html = get_user_welcome_template(name, email)
    send_email(email, subject, html, is_html=True)


# =========================================
# 🟢 BOOKING EMAIL FUNCTION (WITH QR PASS & LIGHT THEME PASS TEMPLATE)
# =========================================
def send_booking_email(email, name, event, qr_base64=None, food_preference="Veg"):
    """Send official entry pass booking confirmation email (light theme matching Frontend web UI pass)."""
    subject, html = get_booking_email_template(
        name=name,
        email=email,
        event=event,
        has_qr=bool(qr_base64),
        food_preference=food_preference
    )
    send_email(email, subject, html, is_html=True, qr_base64=qr_base64)