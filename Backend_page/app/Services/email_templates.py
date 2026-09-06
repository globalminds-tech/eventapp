"""
BookMyEvent Modular & Reusable HTML Email Template Engine
Provides responsive, beautifully styled HTML email templates for all application workflows:
- OTP Email Verification
- Password Reset Security OTP
- Organizer Onboarding Welcome & Verification
- Exhibitor Vendor Onboarding Welcome
- Ticket Booking Confirmation with QR Pass & Food Tags
"""
from app.config import Config

def render_email_layout(title: str, subtitle: str, content_html: str, footer_text: str = None) -> str:
    """Master reusable HTML layout container with modern dark slate gradient styling."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            -webkit-font-smoothing: antialiased;
        }}
        .email-wrapper {{
            width: 100%;
            background-color: #f8fafc;
            padding: 24px 8px;
            box-sizing: border-box;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
        }}
        .header {{
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0284c7 100%);
            padding: 32px 20px;
            text-align: center;
            color: #ffffff;
        }}
        .brand-logo {{
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #ffffff;
            text-decoration: none;
        }}
        .brand-accent {{
            color: #38bdf8;
        }}
        .header-subtitle {{
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #38bdf8;
            margin-top: 8px;
        }}
        .header-title {{
            font-size: 20px;
            font-weight: 800;
            color: #ffffff;
            margin-top: 6px;
            margin-bottom: 0;
        }}
        .body-content {{
            padding: 28px 20px;
        }}
        .footer {{
            background-color: #f8fafc;
            padding: 20px 20px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.5;
        }}
        .btn {{
            display: inline-block;
            background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%);
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 800;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 14px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3);
            margin-top: 12px;
        }}
        .info-card {{
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 16px;
            margin: 20px 0;
        }}
        .otp-code-box {{
            font-family: 'Courier New', Courier, monospace, sans-serif !important;
            font-size: 28px !important;
            font-weight: 900 !important;
            letter-spacing: 6px !important;
            color: #0284c7 !important;
            margin: 12px 0 !important;
            white-space: nowrap !important;
            word-break: keep-all !important;
            display: inline-block !important;
            max-width: 100% !important;
        }}
        @media only screen and (max-width: 480px) {{
            .email-wrapper {{
                padding: 12px 4px !important;
            }}
            .body-content {{
                padding: 20px 14px !important;
            }}
            .otp-card-container {{
                padding: 18px 10px !important;
            }}
            .otp-code-box {{
                font-size: 22px !important;
                letter-spacing: 4px !important;
            }}
        }}
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header">
                <div class="brand-logo">Book<span class="brand-accent">MyEvent</span></div>
                <div class="header-subtitle">{subtitle}</div>
                <h1 class="header-title">{title}</h1>
            </div>
            
            <div class="body-content">
                {content_html}
            </div>
            
            <div class="footer">
                <p>{footer_text or "You received this email from BookMyEvent Platform Services."}</p>
                <p>&copy; 2026 BookMyEvent Inc. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>"""


def get_otp_email_template(otp: str, email_type: str = "verification") -> tuple[str, str]:
    """Generates subject and responsive HTML content for OTP Verification or Password Reset."""
    if email_type == "reset":
        subject = f"🔑 Password Reset Security OTP: {otp}"
        subtitle = "SECURITY & ACCOUNT ACCESS"
        title = "Password Reset Request"
        content_html = f"""
        <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin-top: 0;">Hello,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            We received a request to reset your password for your BookMyEvent account. Use the 6-digit security code below to authorize this password reset:
        </p>

        <div class="otp-card-container" style="background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 16px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0369a1; background: #e0f2fe; padding: 4px 12px; border-radius: 12px; display: inline-block;">6-Digit Security OTP</span>
            <div style="text-align: center; margin: 10px 0;">
                <span class="otp-code-box" style="font-family: 'Courier New', Courier, monospace, sans-serif; font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #0284c7; white-space: nowrap; word-break: keep-all; display: inline-block;">{otp}</span>
            </div>
            <span style="font-size: 12px; color: #64748b; font-weight: 600; display: inline-block;">⏳ Valid for 5 minutes only</span>
        </div>

        <div class="info-card">
            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                🔒 <strong>Security Warning:</strong> If you did not request a password reset, please ignore this email. Do not share this OTP code with anyone.
            </p>
        </div>
        """
    else:
        subject = f"Your Verification Code: {otp}"
        subtitle = "ACCOUNT VERIFICATION"
        title = "Verify Your Email Address"
        content_html = f"""
        <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin-top: 0;">Welcome to BookMyEvent!</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Thank you for starting your account setup. Please enter the 6-digit verification code below to verify your official email address:
        </p>

        <div class="otp-card-container" style="background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 16px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0369a1; background: #e0f2fe; padding: 4px 12px; border-radius: 12px; display: inline-block;">One-Time Password</span>
            <div style="text-align: center; margin: 10px 0;">
                <span class="otp-code-box" style="font-family: 'Courier New', Courier, monospace, sans-serif; font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #0284c7; white-space: nowrap; word-break: keep-all; display: inline-block;">{otp}</span>
            </div>
            <span style="font-size: 12px; color: #64748b; font-weight: 600; display: inline-block;">⏳ Valid for 5 minutes</span>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            Enter this code into your registration form to complete email verification and proceed to the next step.
        </p>
        """

    html = render_email_layout(title, subtitle, content_html)
    return subject, html


def get_organizer_welcome_template(name: str, company_name: str = None) -> tuple[str, str]:
    """Welcome email template for registered Event Organizers."""
    subject = f"🎪 Welcome {name} - Organizer Account Verified!"
    subtitle = "PARTNER ONBOARDING"
    title = "Organizer Account Active"

    company_display = f" ({company_name})" if company_name else ""
    content_html = f"""
    <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin-top: 0;">Congratulations {name}{company_display}!</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Your Event Organizer account has been onboarded and verified. You now have full access to host live concerts, tech expos, workshops, and business summits.
    </p>

    <div class="info-card" style="border-left: 4px solid #06b6d4;">
        <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #0f172a;">⚡ Your Organizer Capabilities:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
            <li><strong>Event Creation Wizard:</strong> Publish events with multi-tier ticket pricing.</li>
            <li><strong>Gate Scanner Control:</strong> Validate attendee QR tickets at entrance turnstiles.</li>
            <li><strong>Instant Payouts:</strong> Automated bank settlement for ticket sales.</li>
            <li><strong>Exhibitor Booth Management:</strong> Layout booth stall floor plans for vendors.</li>
        </ul>
    </div>

    <div style="text-align: center; margin-top: 24px;">
        <a href="{Config.FRONTEND_URL}/OrganizerHome" class="btn">Launch Organizer Workspace &rarr;</a>
    </div>
    """

    html = render_email_layout(title, subtitle, content_html)
    return subject, html


def get_exhibitor_welcome_template(name: str, company_name: str = None, category: str = None) -> tuple[str, str]:
    """Welcome email template for registered Exhibitor Vendors."""
    subject = f"🏬 Welcome {name} - Vendor Partner Account Activated!"
    subtitle = "EXHIBITOR PARTNER HUB"
    title = "Exhibitor Account Ready"

    company_display = f" ({company_name})" if company_name else ""
    category_display = f" | {category}" if category else ""
    content_html = f"""
    <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin-top: 0;">Welcome {name}{company_display}!</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Your Exhibitor Vendor profile{category_display} is officially active. You can now reserve vendor stalls, showcase products at trade expos, and manage GST tax invoices.
    </p>

    <div class="info-card" style="border-left: 4px solid #10b981;">
        <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #0f172a;">🏬 Exhibitor Partner Features:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
            <li><strong>Interactive Floor Plan Stalls:</strong> Reserve prime booth locations.</li>
            <li><strong>GSTIN Tax Invoices:</strong> Download official invoices for booth rentals.</li>
            <li><strong>Lead Capture Badges:</strong> Scan attendee badges for business leads.</li>
        </ul>
    </div>

    <div style="text-align: center; margin-top: 24px;">
        <a href="{Config.FRONTEND_URL}/exhibitor/dashboard" class="btn" style="background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);">Open Booth Dashboard &rarr;</a>
    </div>
    """

    html = render_email_layout(title, subtitle, content_html)
    return subject, html


def get_team_invitation_template(name: str, org_name: str, role_name: str, raw_token: str, temp_password: str = None) -> tuple[str, str]:
    """Clean light theme team member invitation email with temporary password."""
    invite_url = f"{Config.FRONTEND_URL}/accept-invite?token={raw_token}"
    subject = f"🤝 Invitation & Login Credentials to join {org_name} on BookMyEvent"
    subtitle = "TEAM INVITATION"
    title = f"Join {org_name}"

    pw_section = ""
    if temp_password:
        pw_section = f"""
        <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 14px; padding: 18px 20px; margin: 22px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px;">
                    🔐 Your Direct Sign-In Credentials
                </h4>
                <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; border: 1px solid #bbf7d0;">
                    First-Time Login
                </span>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 8px;">
                <tr>
                    <td style="color: #64748b; padding: 6px 0; width: 150px; font-weight: 600;">Temporary Password:</td>
                    <td style="padding: 6px 0;">
                        <code style="font-family: 'SFMono-Regular', Consolas, Menlo, Monaco, monospace; font-size: 15px; font-weight: 800; color: #047857; background: #ffffff; border: 1px solid #86efac; padding: 5px 12px; border-radius: 6px; letter-spacing: 1px;">{temp_password}</code>
                    </td>
                </tr>
            </table>

            <p style="margin: 10px 0 0; font-size: 12px; color: #15803d; line-height: 1.4;">
                🔒 <strong>First-Time Login Security:</strong> Please use this temporary password to log in. You will be prompted to set your own secure permanent password upon your first sign in.
            </p>
        </div>
        """

    login_url = f"{Config.FRONTEND_URL}/login"

    content_html = f"""
    <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin-top: 0;">Hello {name or 'there'},</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        You have been invited to join <strong>{org_name}</strong> on BookMyEvent as a <strong>{role_name}</strong>.
        As a team member, you will have access to manage events, turnstile check-ins, and collaborate with your team.
    </p>

    <div class="info-card" style="border-left: 4px solid #0284c7;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;">⚡ Your Role Access:</h4>
        <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
            Role: <strong style="color: #0284c7;">{role_name}</strong> &bull; Organization: <strong style="color: #0f172a;">{org_name}</strong>
        </p>
    </div>

    {pw_section}

    <div style="text-align: center; margin: 28px 0 16px;">
        <a href="{login_url}" class="btn" style="padding: 14px 32px; font-size: 13px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);">
            Sign In with Temporary Password &rarr;
        </a>
        <div style="margin-top: 12px;">
            <a href="{invite_url}" style="color: #0284c7; text-decoration: underline; font-weight: 600; font-size: 12px;">
                Or activate workspace via one-click link &rarr;
            </a>
        </div>
    </div>

    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center; margin-bottom: 0;">
        ⏳ This invitation link is valid for 7 days. If you did not expect this invitation, you can safely ignore this email.
    </p>
    """
    html = render_email_layout(title, subtitle, content_html)
    return subject, html


def get_user_welcome_template(name: str, email: str) -> tuple[str, str]:
    """Welcome email template for registered general users and attendees."""
    subject = f"🎉 Welcome to BookMyEvent, {name or 'Explorer'}!"
    subtitle = "ACCOUNT ACTIVATED"
    title = "Welcome to BookMyEvent"
    login_url = f"{Config.FRONTEND_URL}/all-events"

    content_html = f"""
    <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin-top: 0;">Hi {name or 'there'},</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Welcome to <strong>BookMyEvent</strong>! We're thrilled to have you join our vibrant community of event enthusiasts, attendees, and professionals.
    </p>

    <div class="info-card" style="border-left: 4px solid #10b981;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;">🌟 Here is what you can do next:</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #64748b; line-height: 1.8;">
            <li>Explore trending conferences, concerts, sports, and expos</li>
            <li>Book tickets &amp; instant digital QR entry passes with 1 click</li>
            <li>Access fast-track gate turnstile verification on event days</li>
        </ul>
    </div>

    <div style="text-align: center; margin: 28px 0 16px;">
        <a href="{login_url}" class="btn" style="padding: 14px 32px; font-size: 13px;">
            Explore Live Events Now &rarr;
        </a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center; margin-bottom: 0;">
        Need assistance? Reach out to our 24/7 concierge support at support@bookmyevent.com.
    </p>
    """
    html = render_email_layout(title, subtitle, content_html)
    return subject, html



def get_booking_email_template(
    name: str,
    email: str,
    event: dict,
    has_qr: bool = True,
    food_preference: str = "Veg"
) -> tuple[str, str]:
    """Generates official entry pass confirmation email matching the frontend web UI pass design."""
    event_name = event.get('event_name') or event.get('name') or event.get('title') or 'Live Event Pass'
    raw_code = event.get('ticket_code') or event.get('booking_id') or event.get('id') or '101'
    digits_code = ''.join(filter(str.isalnum, str(raw_code)))
    booking_code = f"BKG-{digits_code}" if not str(raw_code).startswith("BKG-") else str(raw_code)

    venue = event.get('venue') or 'Official Event Venue'
    address = event.get('address') or ''
    venue_display = f"{venue}, {address}".strip(", ") if address else venue

    event_date = str(event.get('start_date') or event.get('date') or 'Confirmed Schedule')
    event_time = str(event.get('start_time') or event.get('time') or '04:00 PM')

    price_val = event.get('price') or event.get('price_inr') or event.get('pass_fee') or 0.0
    try:
        price_float = float(price_val)
        price_display = f"Rs. {price_float:.2f}" if price_float > 0 else "Free Pass"
    except (ValueError, TypeError):
        price_display = str(price_val) or "Free Pass"

    subject = f"🎟️ Ticket Pass Confirmed: {event_name} ({booking_code})"

    qr_html = (
        '<img src="cid:qrcode" width="132" height="132" style="width: 132px; height: 132px; display: block; border-radius: 8px; object-fit: contain;" alt="Digital QR Pass"/>'
        if has_qr else
        '<div style="width: 132px; height: 132px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; display: table-cell; vertical-align: middle; text-align: center; color: #94a3b8; font-size: 11px; font-weight: 700;">QR Pass Issued</div>'
    )

    food_clean = (food_preference or "").strip()
    food_html = ""
    if food_clean and food_clean.lower() != "none":
        food_html = f"""
        <div style="margin-top: 10px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 3px;">MEAL PASS</div>
          <span style="display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 3px 9px; border-radius: 8px; font-size: 11px; font-weight: 800;">
            🥗 {food_clean} Included
          </span>
        </div>
        """

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
    <div style="width: 100%; background-color: #f8fafc; padding: 32px 12px; box-sizing: border-box;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);">
            
            <!-- Top Confirmation Status -->
            <div style="text-align: center; padding: 32px 24px 20px; background: #ffffff;">
                <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; margin-bottom: 16px;">
                    Book<span style="color: #0284c7;">MyEvent</span>
                </div>
                <div style="width: 52px; height: 52px; margin: 0 auto 12px; background-color: #dcfce7; border: 1px solid #86efac; border-radius: 50%; text-align: center; line-height: 52px; font-size: 26px; color: #16a34a;">
                    ✓
                </div>
                <h1 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0 0 6px 0;">Ticket Pass Confirmed!</h1>
                <p style="font-size: 13px; color: #64748b; margin: 0; font-weight: 500;">
                    Your official entry ticket pass and digital QR code have been issued.
                </p>
            </div>

            <!-- Pass Container (Matching Web UI Step 3 Pass) -->
            <div style="padding: 0 24px 24px;">
                <div style="border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05); background: #ffffff;">
                    
                    <!-- Midnight Gradient Pass Header -->
                    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%); padding: 22px 24px; color: #ffffff;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="vertical-align: middle;">
                                    <span style="background: #f97316; color: #ffffff; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 6px; display: inline-block;">
                                        OFFICIAL ENTRY PASS
                                    </span>
                                </td>
                                <td style="text-align: right; vertical-align: middle;">
                                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #cbd5e1; background: rgba(255,255,255,0.12); padding: 3px 8px; border-radius: 6px;">
                                        {booking_code}
                                    </span>
                                </td>
                            </tr>
                        </table>
                        <div style="font-size: 20px; font-weight: 900; color: #ffffff; margin-top: 12px; line-height: 1.3;">
                            {event_name}
                        </div>
                        <div style="font-size: 12px; color: #cbd5e1; margin-top: 6px;">
                            📍 {venue_display}
                        </div>
                    </div>

                    <!-- Pass Body: QR Box & Attendee Details -->
                    <div style="padding: 24px; background: #ffffff;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <!-- Left: QR Box -->
                                <td style="width: 154px; vertical-align: top; text-align: center; padding-right: 20px;">
                                    <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: inline-block;">
                                        {qr_html}
                                        <div style="font-size: 9px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 8px;">
                                            Scan At Gate
                                        </div>
                                    </div>
                                </td>

                                <!-- Right: Attendee Meta -->
                                <td style="vertical-align: top;">
                                    <div style="margin-bottom: 12px;">
                                        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 2px;">ATTENDEE NAME</div>
                                        <div style="font-size: 15px; font-weight: 800; color: #0f172a;">{name}</div>
                                    </div>

                                    <div style="margin-bottom: 12px;">
                                        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 2px;">EMAIL ADDRESS</div>
                                        <div style="font-size: 13px; font-weight: 600; color: #475569;">{email}</div>
                                    </div>

                                    <div style="margin-bottom: 12px;">
                                        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 2px;">DATE & TIME</div>
                                        <div style="font-size: 13px; font-weight: 700; color: #0284c7;">{event_date} &bull; {event_time}</div>
                                    </div>

                                    {food_html}
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Order Summary Box -->
                    <div style="background: #f8fafc; border-top: 1px dashed #e2e8f0; padding: 18px 24px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <tr>
                                <td style="padding-bottom: 6px; font-weight: 600; color: #64748b;">Pass Type</td>
                                <td style="padding-bottom: 6px; font-weight: 800; color: #0f172a; text-align: right;">Single Entry</td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 6px; font-weight: 600; color: #64748b;">Ticket Amount</td>
                                <td style="padding-bottom: 6px; font-weight: 800; color: #0f172a; text-align: right;">{price_display}</td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 8px; font-weight: 600; color: #64748b;">Convenience Fee</td>
                                <td style="padding-bottom: 8px; font-weight: 700; color: #10b981; text-align: right;">FREE</td>
                            </tr>
                            <tr style="border-top: 1px solid #e2e8f0;">
                                <td style="padding-top: 10px; font-weight: 900; font-size: 14px; color: #0f172a;">TOTAL AMOUNT PAID</td>
                                <td style="padding-top: 10px; font-weight: 900; font-size: 16px; color: #f97316; text-align: right;">{price_display}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin-top: 24px;">
                    <a href="{Config.FRONTEND_URL}/my-passes" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; padding: 14px 32px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);">
                        Open My Ticket Passes &rarr;
                    </a>
                </div>

                <!-- Trust / Verification Note -->
                <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                    🛡️ <strong>Instant E-Pass Generation:</strong> Present this digital QR pass at the entrance turnstiles for gate scanner check-in.
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                <p style="margin: 0 0 4px 0;">Need Help? Contact BookMyEvent 24x7 Customer Support.</p>
                <p style="margin: 0;">&copy; 2026 BookMyEvent Inc. All rights reserved.</p>
            </div>

        </div>
    </div>
</body>
</html>"""
    return subject, html
