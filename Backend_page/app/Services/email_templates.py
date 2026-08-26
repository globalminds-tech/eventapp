"""
BookMyEvent Modular & Reusable HTML Email Template Engine
Provides responsive, beautifully styled HTML email templates for all application workflows:
- OTP Email Verification
- Password Reset Security OTP
- Organizer Onboarding Welcome & Verification
- Exhibitor Vendor Onboarding Welcome
- Ticket Booking Confirmation with QR Pass & Food Tags
"""

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
        <a href="http://localhost:5173/OrganizerHome" class="btn">Launch Organizer Workspace &rarr;</a>
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
        <a href="http://localhost:5173/exhibitor/dashboard" class="btn" style="background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);">Open Booth Dashboard &rarr;</a>
    </div>
    """

    html = render_email_layout(title, subtitle, content_html)
    return subject, html
