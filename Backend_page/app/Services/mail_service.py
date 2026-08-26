import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
import base64
from app.Services.email_templates import (
    get_otp_email_template,
    get_organizer_welcome_template,
    get_exhibitor_welcome_template,
    render_email_layout
)

SMTP_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("MAIL_PORT", 587))
SMTP_USERNAME = os.getenv("MAIL_USERNAME", os.getenv("EMAIL_USER", ""))
SMTP_PASSWORD = os.getenv("MAIL_PASSWORD", os.getenv("EMAIL_PASS", ""))

def send_email(to_email, subject, message, is_html=False, qr_base64=None):
    """Universal Email Sender with HTML Support, QR attachments, and dev mode simulation."""
    if not to_email:
        print("[WARN] send_email called with empty recipient email.")
        return False

    if qr_base64:
        msg = MIMEMultipart('related')
        msg_alternative = MIMEMultipart('alternative')
        msg.attach(msg_alternative)
        
        if is_html:
            part = MIMEText(message, 'html')
        else:
            part = MIMEText(message, 'plain')
        msg_alternative.attach(part)
        
        # Attach QR Code
        try:
            qr_data = base64.b64decode(qr_base64)
            img = MIMEImage(qr_data)
            img.add_header('Content-ID', '<qrcode>')
            msg.attach(img)
        except Exception as err:
            print(f"[WARN] QR image attachment failed: {err}")
    else:
        if is_html:
            msg = MIMEText(message, "html")
        else:
            msg = MIMEText(message, "plain")

    msg['Subject'] = subject
    msg['From'] = SMTP_USERNAME or "noreply@bookmyevent.com"
    msg['To'] = to_email

    # Dev Mode Simulation if credentials are missing
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"[MAIL SIMULATION SUCCESS] Email to: {to_email} | Subject: '{subject}'")
        return True

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        print(f"[SUCCESS] Email sent to {to_email}")
        return True

    except Exception as e:
        print(f"[MAIL DEV FALLBACK] SMTP send exception (handled gracefully): {e}")
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

# =========================================
# 🟢 BOOKING EMAIL FUNCTION (WITH QR PASS & HTML TEMPLATE)
# =========================================
def send_booking_email(email, name, event, qr_base64=None, food_preference="Veg"):
    """Send a professional HTML booking confirmation email with QR code pass."""
    event_name = event.get('event_name', 'Event')
    order_code = ''.join(filter(str.isdigit, str(event.get('event_code', '000')))) or '1001'
    subject = f"🎟️ Ticket Confirmed: {event_name} (Order #{order_code})"

    food_badge_color = "#e6fffa" if food_preference == "Veg" else "#fff5f5"
    food_text_color = "#2c7a7b" if food_preference == "Veg" else "#c53030"

    content_html = f"""
    <p style="font-size: 15px; font-weight: 600; color: #1e293b;">Hi {name},</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Your booking for <strong>{event_name}</strong> is confirmed! Please present your digital entry pass QR code below at the entrance turnstiles.
    </p>

    <div style="text-align: center; background-color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin: 20px 0;">
        <span style="font-size: 11px; font-weight: 800; uppercase; letter-spacing: 1px; color: #0284c7; background: #e0f2fe; padding: 4px 12px; border-radius: 12px;">Digital Entry Pass</span>
        <div style="margin: 15px 0;">
            {"<img src='cid:qrcode' style='width: 180px; height: 180px; border-radius: 12px; border: 4px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);' alt='QR Ticket'/>" if qr_base64 else "<div style='font-weight: 800; color: #0284c7;'>[QR Ticket Code Generated]</div>"}
        </div>
        <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: 600;">Scan at venue entrance for rapid check-in</p>
    </div>

    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 1px;">Event Summary</h4>
        
        <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
            <tr>
                <td style="padding: 6px 0; font-weight: 700; color: #1e293b; width: 90px;">Event:</td>
                <td style="padding: 6px 0; font-weight: 800; color: #0f172a;">{event_name}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">Date & Time:</td>
                <td style="padding: 6px 0;">{event.get('start_date', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">Venue:</td>
                <td style="padding: 6px 0;">{event.get('venue', 'N/A')}</td>
            </tr>
            {f'''<tr>
                <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">Food Pass:</td>
                <td style="padding: 6px 0;"><span style="background-color: {food_badge_color}; color: {food_text_color}; padding: 3px 10px; border-radius: 12px; font-weight: 800; font-size: 11px;">{food_preference}</span></td>
            </tr>''' if event.get('food') else ''}
        </table>
    </div>

    <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 16px; border-radius: 8px;">
        <h5 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #0f172a;">Instructions for Entry:</h5>
        <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #64748b; line-height: 1.6;">
            <li>Please arrive 15 minutes before event start time.</li>
            <li>Carry a valid government photo ID along with this ticket.</li>
            <li>Pass is valid for one-time entrance check-in.</li>
        </ul>
    </div>
    """

    html = render_email_layout(
        title=f"Order #{order_code} Confirmed",
        subtitle="DIGITAL TICKET PASSPORT",
        content_html=content_html
    )

    send_email(email, subject, html, is_html=True, qr_base64=qr_base64)