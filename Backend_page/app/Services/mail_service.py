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

def send_team_invitation_email(email, name, org_name, role_name, raw_token):
    """Send team member invitation email with secure join link."""
    invite_url = f"http://localhost:5173/accept-invite?token={raw_token}"
    subject = f"🤝 Invitation to join {org_name} on BookMyEvent"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="margin:0; padding:0; background-color:#0f172a; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width:540px; margin:30px auto; background-color:#1e293b; border:1px solid #334155; border-radius:20px; overflow:hidden; color:#f8fafc;">
        <div style="background: linear-gradient(135deg, #06b6d4, #2563eb); padding: 30px 24px; text-align: center;">
          <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:800;">Team Invitation</h1>
          <p style="color:#e0f2fe; margin:8px 0 0; font-size:14px;">You've been invited to join <strong>{org_name}</strong></p>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size:16px; color:#cbd5e1; margin-top:0;">Hello <strong>{name or 'there'}</strong>,</p>
          <p style="font-size:14px; line-height:1.6; color:#94a3b8;">
            You have been invited to join <strong>{org_name}</strong> on BookMyEvent as a <strong>{role_name}</strong>.
            As a team member, you will have access to manage events, operations, and collaborate with your team.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="{invite_url}" style="background: linear-gradient(to right, #06b6d4, #2563eb); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.35);">
              Accept Invitation & Join Team &rarr;
            </a>
          </div>
          <p style="font-size:12px; color:#64748b; line-height:1.5;">
            This invitation link is valid for 7 days. If you did not expect this invitation, you can safely ignore this email.
          </p>
          <hr style="border:0; border-top:1px solid #334155; margin:24px 0;" />
          <div style="font-size:11px; color:#64748b; text-align:center;">
            BookMyEvent Platform &bull; Secure Multi-Tenant Access
          </div>
        </div>
      </div>
    </body>
    </html>
    """
    send_email(email, subject, html, is_html=True)

# =========================================
# 🟢 BOOKING EMAIL FUNCTION (WITH QR PASS & HTML TEMPLATE)
# =========================================
def send_booking_email(email, name, event, qr_base64=None, food_preference="Veg"):
    """Send a BookMyShow-style HTML booking confirmation email."""
    event_name = event.get('event_name', 'Event')
    booking_code = f"BKG-{''.join(filter(str.isdigit, str(event.get('id', '101')))) or '101'}"
    subject = f"🎟️ Booking Confirmed: {event_name} (ID: {booking_code})"

    price_val = event.get('price') or event.get('price_inr') or event.get('pass_fee') or 200.0
    price_display = f"{float(price_val):.2f}"
    banner_url = event.get('banner_url') or event.get('image') or "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="margin:0; padding:0; background-color:#09090b; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width:560px; margin:20px auto; background-color:#18181b; border:1px solid #27272a; border-radius:24px; overflow:hidden; color:#f4f4f5; box-shadow:0 20px 40px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <div style="text-align:center; padding:28px 24px 20px; border-bottom:1px solid #27272a; background:#111113;">
          <div style="font-size:22px; font-weight:900; letter-spacing:-0.5px; color:#ffffff; margin-bottom:12px;">
            book<span style="background:#ef4444; color:#ffffff; padding:2px 8px; border-radius:6px; margin-left:4px; font-size:17px;">my</span>event
          </div>
          <div style="color:#22c55e; font-size:20px; font-weight:900; margin-bottom:4px;">Your booking is confirmed!</div>
          <div style="font-size:12px; color:#a1a1aa; font-weight:700; font-family:monospace;">Booking ID: <strong style="color:#ffffff;">{booking_code}</strong></div>
        </div>

        <!-- Event Details Card -->
        <div style="padding:24px 24px 16px;">
          <div style="background:#27272a; border:1px solid #3f3f46; border-radius:20px; padding:18px;">
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="width:76px; vertical-align:top; padding-right:16px;">
                  <img src="{banner_url}" style="width:76px; height:76px; object-fit:cover; border-radius:14px; border:1px solid #52525b; display:block;" alt="Poster"/>
                </td>
                <td style="vertical-align:top;">
                  <div style="font-size:16px; font-weight:900; color:#ffffff; line-height:1.3; margin-bottom:4px;">{event_name}</div>
                  <div style="font-size:13px; font-weight:700; color:#ef4444; margin-bottom:4px;">{event.get('start_time', '04:15 PM')} | {event.get('start_date', 'Confirmed Date')}</div>
                  <div style="font-size:12px; color:#a1a1aa; font-weight:500;">{event.get('venue', 'Exhibition Venue')}</div>
                </td>
              </tr>
            </table>

            {"<div style='margin-top:16px; padding-top:16px; border-top:1px dashed #52525b; text-align:center;'><img src='cid:qrcode' style='width:160px; height:160px; border-radius:14px; border:4px solid #ffffff; background:#ffffff;' alt='QR Ticket'/></div>" if qr_base64 else ""}

            <div style="margin-top:16px; padding-top:14px; border-top:1px dashed #3f3f46; text-align:center;">
              <a href="http://localhost:5173/my-passes" style="display:inline-block; background:#ef4444; color:#ffffff; font-weight:800; font-size:13px; text-decoration:none; padding:11px 28px; border-radius:12px;">Open Ticket Pass</a>
            </div>
          </div>
        </div>

        <!-- Rewards Banner -->
        <div style="margin:0 24px 20px; background:linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); border-radius:20px; padding:20px; color:#ffffff;">
          <div style="font-size:17px; font-weight:900; margin-bottom:4px;">You've Won Rewards!</div>
          <div style="font-size:12px; opacity:0.9; margin-bottom:10px;">Hurray! You've unlocked 2 rewards with this ticket transaction.</div>
          <a href="http://localhost:5173/profile" style="color:#ffffff; font-weight:800; font-size:12px; text-decoration:underline;">Tap to view them now →</a>
        </div>

        <!-- Order Summary -->
        <div style="padding:0 24px 24px;">
          <div style="font-size:11px; font-weight:800; color:#a1a1aa; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">Order Summary</div>
          <div style="background:#27272a; border:1px solid #3f3f46; border-radius:20px; padding:18px; font-size:13px; color:#d4d4d8;">
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <tr>
                <td style="padding-bottom:8px; font-weight:700; color:#a1a1aa;">TICKET AMOUNT</td>
                <td style="padding-bottom:8px; font-weight:800; color:#ffffff; text-align:right;">Rs. {price_display}</td>
              </tr>
              <tr style="border-bottom:1px dashed #52525b;">
                <td style="padding-bottom:10px; font-weight:600; color:#71717a; font-size:12px;">CONVENIENCE FEES</td>
                <td style="padding-bottom:10px; font-weight:600; color:#71717a; font-size:12px; text-align:right;">Rs. 0.00</td>
              </tr>
              <tr>
                <td style="padding-top:14px; font-weight:900; font-size:15px; color:#ffffff;">AMOUNT PAID</td>
                <td style="padding-top:14px; font-weight:900; font-size:16px; color:#ef4444; text-align:right;">Rs. {price_display}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align:center; padding:16px 24px 24px; border-top:1px solid #27272a; font-size:11px; color:#71717a;">
          <p style="margin:0 0 4px 0;">Need Help? Contact BookMyEvent 24x7 Customer Support.</p>
          <p style="margin:0;">BookMyEvent Intermediary Platform • All Rights Reserved</p>
        </div>

      </div>
    </body>
    </html>
    """

    send_email(email, subject, html, is_html=True, qr_base64=qr_base64)