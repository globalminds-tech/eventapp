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

# Signature 3-pill brand logo mark PNG (retina high-res 72x48 with smooth anti-aliased tilted pills matching header)
# Pill 1: Electric Blue (#3b82f6) tilted left (-12°)
# Pill 2: Bright Orange (#f97316) tilted right (+12°)
# Pill 3: Emerald Green (#22c55e) tilted slightly left (-6°)
BRAND_LOGO_MARK_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAEgAAAAwCAYAAACynDzrAAAMgUlEQVR42u1aW6xd11UdY669z73XjzqJX7FDCM6b"
    "69aNGydSRCI7tJVKIFIrcSwhVFRoQQIqoYKqpDx0fNQHLv0hQggFqSWulA98Pnh8ICEe8SV9qHZCQmpfHIrTOCVO"
    "sB0b1/b1OXvvNQcfe5+be+1zz97X8afX33nsxxprzrHGmGsC18f1cX1cH+9hCITAq728wYViez8MAHpHoPYseHIa"
    "nMEeR7fr13YuINqwA9PgqVmoDQDTILqIBLQcUHYe6ISZR7sRw+vUMWCWYC9euzfuyMb93G4rXDNwOhj7LLURGt5o"
    "0X2mD//Wqvv1dHq1EcWx4HTp053DrbVTd/0SzX7O87ieiZ2j20zRH/S+0115otORdbv09woOu/DndiJ5+KENjyXU"
    "z+fRbg4BF+X+7eD+TX7tnfPD/40Fh11f/1x71ftWrfwNtsIn/FJxOxO7gMBXIf/6sQ8983fzQLE+KkcCNJz0zi8P"
    "3q/EnqUl2yBAXl5BAxTjGan/e89/YdUz7wWk4aQHT2z4QCvBNyDuAAFUzwIJd3/D5b+Z7j39D0uC1OkYul3f8vJn"
    "7jbqry0N9/mlAigcIMHUgECA+HtMTH3yv+/6s/MVAloWQJ2OrAvgw6txZ5YXz9GSzUV/rgBAcJjRkoVWYq0U8uxT"
    "zz85sa8jWZfLA0kdGLoQ/nDjdJHjX5KAjf2+Sr6p1leAJlMmkciV+uPpF0/9o9oI7CEuAgfA9GOvb+gHO2iJ3Rov"
    "5BmJAMFACaIEKVm3Iil+PPjbH75+8RfRnhY4nkdH532XPsiyP7U02Vz0L+YkE5KBYCAZSEvc8+hZJkX9+c9+6eIt"
    "XdLrOGuJFVKW6S+SBBv7feVGBBIJgUAiGJEMchUmpN7nM+rc9D704Fq4uHtmiW7XB4k9GabSW+P5QU6iBSCUy0oD"
    "EQgmxem5LFnZ+vgdd676ZbDrO5/bmTQGaJgqj+4dbAX40WKu76SloyfG4DGPoTWxMg/JrwPATqAxQGojsAvPn1i7"
    "KzE+PLikaMToZxFJlqtotXhzNgifICBUO2sZa724+XufXKvMf8V/PBBpS06aZFBWuIBPQ+0wc2CXjyPtRRM6UH0u"
    "yEdCmiZSrCExUg7J8RAA7AKap9h0+VJS+BlLOJ+8Ndu36PjIZaRAAFh5w9SdTO0GRR8vXgTTIJouxa33fHv1ijqp"
    "MnLF5b6mXBuOJzCSXkTCfesvPK0VJVGr2RY6WwJi0P1VwrAmFwmAcNwAAOhV3/dmCQDxfLaSNg80x+a0A0xspW2e"
    "vKlM0Q6Xx0HiyWYiEqZiIISw6eyZ7K4yTeuvE0D2ENVBy8FtKKpUqYkeEIDxTCnChmJsugR6km8rjw7SaqKRcInE"
    "ZPbm4joAwNbZZgANU8QML8Q8d4JJvc5GDGlqJty3ME3HC9AKjMG6n4JwWx4FssmCEAZ8BwBwZPj/PQKAOGXvSLoI"
    "a6C5CedEgNJk4yKw6wDqdstbX7zUOgb3EwwtoAmvEHDpwWVsXiXXObelKRMXYoOIDV4Ibny5+uwLlYq/UZwDeIbB"
    "AEo1wSiYgQU2A8DOAyebphjV6che7HJO5GFLAiTVE3UBENgOADN70NjrGPkASNQRtAC1Alm4TqfKjparWV1TCj0e"
    "f3Rfn8FOIxAAGylkZfkt87nTlIOGKULiBYYmSlPmRQ5I9374K1oLUlAtUTsAFMKORgQNOBPAgFl+9ew5CVyUSPvb"
    "BgCex/9laGJrK1Qnk00AMIMDzQHasLW8PakX5A3IE6THTAytGwvLfxoA2r2leUgA2YWrs34VXFtVCGxC0EYg6MWS"
    "di4zruvLFOFUcgLBoLpFFQgXNFeUEXRqgxoD1DtS3TyZeMWzfkazANSkGRktNQj4EACcPDLOBJe/5QPdE4wbsgiV"
    "3FvvGQkeGvXjzipFlPkJ1GdsudUXDqahIumeN9/mq9y2Cwd+BOA1CxNoKOLg0R9cGIXjnmmy7SE1AvWcRSIUmceC"
    "xb8sJugFxACACU40qxqpjCDXuunD7RY4LyKa6CCq3VaY6T5awPCKJYRqdjIC5rkA6T50ZL3d9aZV0gONpiJ4KxAO"
    "/c/EzWeOLSLoaszsKlNEIZyACxRrUpZE4YDrpqx185r5FW4qFE9OLwjpZu6KHjMIuOOR1bgFgJY0rt1hxHA7opYW"
    "qwv5NACBfIW/g4E6I5TOUFVn8W1lsck9IRcQuIqDuXWVnmJjgIYpEoNeVNFgEiDlhYfW5CSz4gMA0N56ZcgOd5/z"
    "ncybPOJejw12MEFVHeeFJd/5SKmm0w2rTsuVwcBaNS05g4V8Ll+/0LI0AqjXLlNKVhzxvH/emFgDonYa4Iw7liTq"
    "3eXzJuewtdXi6jzCWSMQJRhcEL0EaBS/7ekKAIrT2RlFP8dgtawpQGwFhBXppoU7YTMvVmmZ735+9UmYHbW0VdWu"
    "xhfKFQGKO5Z09kMHT7+/FHTjuU2AkgDLMu8nIX6/shhLvsdr95+9wLQSi6xb0PI+fjHfvHAnbAYQgJ1DrWH2EgNq"
    "J0OCXjjkvu1jT2lipLOfHZ4w8AG4mpxOKAmEwGNIzr451FAjJ9vpGNiLEE4xWDM1TYBp2Lz8iuLiZx9qdgZAUxwA"
    "tJ+4cGFwx+XOfujgn+sgAbCtomqrVdwJYaaX2YXPF8lGjT0VhzjerqJTddUTuUCVfmxm16yWBdAwRQS+5Fkuqv7Y"
    "RVIMrVZAwg9e4ewrsHYVG2+FcHsRG1mMKojt4GIHPyLiD0yXO2/L3oSVwqZ27aOgIpYRtGd6eQANnX1Ynb7qsTjJ"
    "MMFaZ1+dODHiSo1T7WpFoW1pi63oiLUEDQRFweX/vihFx42saCwWFR0IYT1UnoiMqijYOMfS6chmPssLNDtiaQNn"
    "XxG1pPsB4MBCZz9cfXEHrKmDB4tCZ1Om/1npnTELVKpprZo8MV+rrhOLUUAe164/cmrFUlpxLAe86+xDQ2cP87yA"
    "pOmP7NUaklpA1FXKakdF0KwrMVkgaDrKvSfeES5z8JeNmcpwxn7/LeQRddEJAooOJHbD6huTJUuvjXSyDIfQxNmT"
    "VMyklq7re37vkKiHu8+bnU0r4Hi/ivq+AFUC0cGXKg4bz4FV6TUkySkvmpZeIQKT/NG59UuVXscCNK9lPL5S5IOC"
    "tFCbGkS0VgARt89HYUXQm2O8g8TmPEpks8UJ0MFm5bey9Lpi9apTiphrXHptBWjKNixVeh37kkOiPjOYeJ3CcUsm"
    "UKuohwQCPrTAtljJn9yRtMykZg4+Zu6ReHm0gx99SHz+jXPnCDQvvQaDiZuWKr3WeSy12wqzXWaEvs+EZejXXRQA"
    "OP4SAKaPQMDOssTkfjuata94aqQDb7Umkx+McvBLFQmPP7qvz8ROLaf0GgfFbUuVXmvD/OS8PeAhWtU80qSiSV4q"
    "51UWNQEgkoNmHUlQdZ5ymN235kY6+FGjKr2q8NMMbNqTpDDV8oU74bIAGjp7C+GQYqPeGtFABhyaP44elnETvYBY"
    "ninUErQRNLy0nM1kyCGcDK8imFRHBw5CIrJi9qqtRm83HJ2O8VLyvOf9w8nEVBCqfWiElCYD42AguZ6dJ/rdZWk+"
    "SU79a577axMtLslDEpQYmOdeRIv7mvHP4rqQg88qj+OP2iS3iUDPirfyO9b8EwTO7JqJV7HNU+3ZrZzpso+Azwmx"
    "MEsTyYuqY8jL8pMKAZ6unAiWoPut35/8L7QVul06AaENYxeZp/g8A0DCJBQSXGXVxyUUBGIyZYHQVyb/+J2jtU1T"
    "i8opvQh17Ifbv37Qs/iXYe1UAlcOVccP71aYogi31RMGoXv8xqf+D2jbKPpo3IrWbiv0eowPf7n/cSbJMxbCGs8B"
    "eQRBWGoAgVj0v/qtL0w9Ofz/FR0dPcTBk+t/NSGfNlqKwuECjASS8o2KqD9J9558QvsRsBu+3P5EoMM7f3Am1aWL"
    "PUuTx/1iDmVxeHxNm0qBlkFz2ZeOPbjvj4adaVfZxHklSA9+8dKWicnWpxX9MRVxnRG5mLxk8qf+7Q9az0OqovvK"
    "XeTdjrL1HzTj5yg+EnNfY4HnEfhdSN9I957852VFziiQqhLIlseP/xrJ36bjHrimYOzD9D0Zn3pt+1/9zThwrmo0"
    "Lqs1f/RrWvmxpzTRtPGz3GzeVcXq3Dap3920Tp1NK5o2dDaPpHd7F+8++pktWw5+6oG7X//slqUaPnEtu1/b+xd3"
    "uLbbCsvpelUHdnnnqtoIjbtZm3dqhZHg7W+Ha9Qn3UC1AI1E2ZK90VVHz7K4Bsvs9Ot0iK2zxJFpXev+7uvj+rg+"
    "rnr8Pw9jR0QirbPpAAAAAElFTkSuQmCC"
)

def get_brand_logo_html(theme: str = "light", font_size: int = 22, align: str = "left", use_cid: bool = True) -> str:
    """
    Centralized official BookMyEvent brand logo mark with signature 3-pill icon.
    Renders with the signature tilted 3-pill dynamic alignment matching the application header:
    - Pill 1: Electric Blue (#3b82f6) tilted left (-12°)
    - Pill 2: Bright Orange (#f97316) tilted right (+12°)
    - Pill 3: Emerald Green (#22c55e) tilted slightly left (-6°)
    - Typography: Bold BookMyEvent brand label in dark slate or pure white.

    Email Client Reliability:
    Email clients (Gmail, Outlook, Yahoo) completely strip CSS `transform: rotate(...)`.
    Using an embedded high-resolution retina PNG ensures the tilted alignment renders identically
    in Gmail, Outlook, Apple Mail, mobile inboxes, and web viewports without distortion or straight bars.
    """
    text_color = "#ffffff" if theme == "dark" else "#0f172a"
    margin_css = "0 auto" if align == "center" else "0"
    
    # Proportional logo mark sizing matching header typography
    img_h = max(16, int(font_size * 0.95))
    img_w = int(img_h * 1.5)  # 36:24 aspect ratio
    
    img_src = "cid:bme_logo_mark" if use_cid else f"data:image/png;base64,{BRAND_LOGO_MARK_B64}"

    return f"""<table cellpadding="0" cellspacing="0" border="0" style="display: inline-table; vertical-align: middle; margin: {margin_css}; border-collapse: collapse;">
      <tr>
        <td style="vertical-align: middle; padding-right: 9px; line-height: 0;">
          <img src="{img_src}" width="{img_w}" height="{img_h}" alt="" style="display: block; width: {img_w}px; height: {img_h}px; border: 0; outline: none; text-decoration: none; vertical-align: middle;" />
        </td>
        <td style="vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: {font_size}px; font-weight: 900; letter-spacing: -0.6px; color: {text_color}; line-height: 1; text-decoration: none; white-space: nowrap;">
          BookMyEvent
        </td>
      </tr>
    </table>"""


def render_email_layout(title: str, subtitle: str, content_html: str, footer_text: str = None) -> str:
    """Master reusable HTML layout container with modern dark slate gradient styling."""
    logo_header = get_brand_logo_html(theme="dark", font_size=20, align="left")
    logo_footer = get_brand_logo_html(theme="light", font_size=16, align="center")

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
            padding: 28px 20px;
            text-align: center;
            color: #ffffff;
        }}
        .header-subtitle {{
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #38bdf8;
            margin-top: 4px;
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
            padding: 24px 20px;
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
            <!-- Top Brand Navigation Bar -->
            <div style="background: #0f172a; padding: 16px 22px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td align="left" style="vertical-align: middle;">
                            {logo_header}
                        </td>
                        <td align="right" style="vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8;">
                            Official
                        </td>
                    </tr>
                </table>
            </div>

            <div class="header">
                <div class="header-subtitle">{subtitle}</div>
                <h1 class="header-title">{title}</h1>
            </div>
            
            <div class="body-content">
                {content_html}
            </div>
            
            <div class="footer">
                <div style="margin-bottom: 8px;">
                    {logo_footer}
                </div>
                <p style="margin: 0 0 4px 0;">{footer_text or "You received this email from BookMyEvent Platform Services."}</p>
                <p style="margin: 0;">&copy; 2026 BookMyEvent Inc. All rights reserved.</p>
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
    """Generates official entry pass confirmation email matching the frontend web UI pass design with 100% mobile responsiveness."""
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
        price_display = f"₹ {price_float:,.2f}" if price_float > 0 else "FREE PASS"
    except (ValueError, TypeError):
        price_display = str(price_val) or "FREE PASS"

    from datetime import datetime
    now = datetime.now()
    now_str = now.strftime("%d %b, %I:%M %p")
    subject = f"🎟️ Entry Pass Confirmed: {event_name} • Ref #{booking_code} • {now_str}"

    qr_html = (
        '<img src="cid:qrcode" width="136" height="136" style="width: 136px; height: 136px; display: block; margin: 0 auto; border-radius: 8px; object-fit: contain;" alt="Digital QR Pass"/>'
        if has_qr else
        '<div style="width: 136px; height: 136px; margin: 0 auto; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; display: table-cell; vertical-align: middle; text-align: center; color: #94a3b8; font-size: 11px; font-weight: 700;">QR Pass Issued</div>'
    )

    food_clean = (food_preference or "").strip()
    food_html = ""
    if food_clean and food_clean.lower() != "none":
        food_icon = "🥗" if "veg" in food_clean.lower() and "non" not in food_clean.lower() else "🍗"
        food_html = f"""
        <div style="margin-top: 10px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 3px;">MEAL PASS</div>
          <span style="display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800;">
            {food_icon} {food_clean} Included
          </span>
        </div>
        """

    logo_header = get_brand_logo_html(theme="light", font_size=20, align="left")
    logo_footer = get_brand_logo_html(theme="light", font_size=16, align="center")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            color: #1e293b;
        }}
        table {{
            border-collapse: collapse;
        }}
        .email-wrapper {{
            width: 100%;
            background-color: #f1f5f9;
            padding: 32px 12px;
            box-sizing: border-box;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 12px 30px -6px rgba(15, 23, 42, 0.08);
        }}
        @media only screen and (max-width: 600px) {{
            .email-wrapper {{
                padding: 12px 6px !important;
            }}
            .email-container {{
                border-radius: 16px !important;
            }}
            .pass-header {{
                padding: 20px 16px !important;
            }}
            .pass-body {{
                padding: 20px 16px !important;
            }}
            .stack-column {{
                display: block !important;
                width: 100% !important;
                box-sizing: border-box !important;
                padding-right: 0 !important;
                text-align: center !important;
            }}
            .stack-column-details {{
                display: block !important;
                width: 100% !important;
                box-sizing: border-box !important;
                margin-top: 18px !important;
                text-align: left !important;
            }}
            .mobile-center {{
                text-align: center !important;
            }}
            .mobile-qr-wrapper {{
                margin: 0 auto !important;
                display: table !important;
            }}
            .event-title {{
                font-size: 18px !important;
            }}
            .btn-full {{
                display: block !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }}
        }}
    </style>
</head>
<body>
    <!-- Anti-thread-collapse token prevents Gmail from trimming message pass in threads -->
    <div style="display:none !important; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; mso-hide:all;">
        Entry Pass Confirmed for {event_name} • Ref #{booking_code} • Issued {now.strftime('%Y-%m-%d %H:%M:%S')}
    </div>
    <div class="email-wrapper">
        <div class="email-container">
            
            <!-- Website-Style Top Navigation Bar with Left-Aligned Brand Logo -->
            <div style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td align="left" style="vertical-align: middle;">
                            {logo_header}
                        </td>
                        <td align="right" style="vertical-align: middle;">
                            <span style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #0284c7; background: #f0f9ff; border: 1px solid #bae6fd; padding: 4px 10px; border-radius: 9999px;">
                                Verified Pass
                            </span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Confirmation Hero Header (Starts with emerald checkmark, matching website step 3) -->
            <div style="text-align: center; padding: 26px 24px 18px; background: #ffffff;">
                <!-- Glowing Emerald Confirmation Checkmark -->
                <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 12px;">
                    <tr>
                        <td style="width: 48px; height: 48px; background: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 24px; color: #059669; font-weight: 900; line-height: 48px;">
                            ✓
                        </td>
                    </tr>
                </table>

                <h1 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.3px;">
                    Ticket Pass Confirmed!
                </h1>
                <p style="font-size: 11px; color: #0284c7; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px 0;">
                    PASS REF: #{booking_code} &bull; ISSUED {now.strftime('%d %b %Y, %I:%M %p')}
                </p>
                <p style="font-size: 13px; color: #64748b; margin: 0; font-weight: 500; line-height: 1.5;">
                    Your digital QR entry pass and booking verification are ready below.
                </p>
            </div>

            <!-- Pass Container (Boarding Pass Card) -->
            <div style="padding: 0 20px 24px;">
                <div style="border: 1px solid #cbd5e1; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 18px rgba(15, 23, 42, 0.06); background: #ffffff;">
                    
                    <!-- Pass Header: Dark Slate / Indigo Gradient -->
                    <div class="pass-header" style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0369a1 100%); padding: 22px 24px; color: #ffffff;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="vertical-align: middle;">
                                    <span style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 6px; display: inline-block;">
                                        OFFICIAL ENTRY PASS
                                    </span>
                                </td>
                                <td style="text-align: right; vertical-align: middle;">
                                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 800; color: #ffffff; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.25); padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px;">
                                        {booking_code}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <div class="event-title" style="font-size: 20px; font-weight: 900; color: #ffffff; margin-top: 14px; line-height: 1.3;">
                            {event_name}
                        </div>

                        <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 8px; width: 100%;">
                            <tr>
                                <td style="font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                                    📍 <strong>{venue_display}</strong>
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size: 12px; color: #38bdf8; font-weight: 700; padding-top: 4px;">
                                    🗓️ {event_date} &bull; ⏰ {event_time}
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Perforated Ticket Divider -->
                    <div style="background: #ffffff;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="border-top: 2px dashed #cbd5e1; height: 1px; font-size: 0; line-height: 0;">&nbsp;</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Pass Body: QR Code & Attendee Information -->
                    <div class="pass-body" style="padding: 24px; background: #ffffff;">
                        <table style="width: 100%; border-collapse: collapse;" class="responsive-table">
                            <tr>
                                <!-- Left / Center: QR Code Container -->
                                <td class="stack-column" style="width: 160px; vertical-align: top; text-align: center; padding-right: 20px;">
                                    <div class="mobile-qr-wrapper" style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.04); display: inline-block;">
                                        {qr_html}
                                        <div style="font-size: 9px; font-weight: 900; color: #64748b; letter-spacing: 0.8px; text-transform: uppercase; margin-top: 8px;">
                                            SCAN AT GATE TURNSTILE
                                        </div>
                                    </div>
                                </td>

                                <!-- Right / Bottom: Attendee Details -->
                                <td class="stack-column-details" style="vertical-align: top;">
                                    <div style="margin-bottom: 12px;">
                                        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 2px;">
                                            ATTENDEE NAME
                                        </div>
                                        <div style="font-size: 16px; font-weight: 800; color: #0f172a;">
                                            {name}
                                        </div>
                                    </div>

                                    <div style="margin-bottom: 12px;">
                                        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 2px;">
                                            REGISTERED EMAIL
                                        </div>
                                        <div style="font-size: 13px; font-weight: 600; color: #475569; word-break: break-all;">
                                            {email}
                                        </div>
                                    </div>

                                    <div style="margin-bottom: 12px;">
                                        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 2px;">
                                            ENTRY STATUS
                                        </div>
                                        <div style="font-size: 12px; font-weight: 800; color: #059669;">
                                            ● Verified &amp; Confirmed Pass
                                        </div>
                                    </div>

                                    {food_html}
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Order Breakdown -->
                    <div style="background: #f8fafc; border-top: 1px dashed #e2e8f0; padding: 18px 24px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <tr>
                                <td style="padding-bottom: 6px; font-weight: 600; color: #64748b;">Pass Category</td>
                                <td style="padding-bottom: 6px; font-weight: 800; color: #0f172a; text-align: right;">Single Entry Pass</td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 6px; font-weight: 600; color: #64748b;">Pass Fee</td>
                                <td style="padding-bottom: 6px; font-weight: 800; color: #0f172a; text-align: right;">{price_display}</td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 8px; font-weight: 600; color: #64748b;">Platform Convenience Fee</td>
                                <td style="padding-bottom: 8px; font-weight: 800; color: #059669; text-align: right;">₹ 0 (Waived)</td>
                            </tr>
                            <tr style="border-top: 1px solid #e2e8f0;">
                                <td style="padding-top: 10px; font-weight: 900; font-size: 14px; color: #0f172a;">TOTAL AMOUNT</td>
                                <td style="padding-top: 10px; font-weight: 900; font-size: 16px; color: #ea580c; text-align: right;">{price_display}</td>
                            </tr>
                        </table>
                    </div>

                </div>

                <!-- Call-to-Action Button -->
                <div style="text-align: center; margin-top: 24px;">
                    <a href="{Config.FRONTEND_URL}/my-passes" class="btn-full" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff !important; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; padding: 15px 36px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);">
                        View My Passes &amp; Download Pass &rarr;
                    </a>
                </div>

                <!-- Event Day Instructions -->
                <div style="margin-top: 24px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 14px; padding: 16px; font-size: 12px; color: #0369a1; line-height: 1.6;">
                    <div style="font-weight: 800; font-size: 13px; color: #0c4a6e; margin-bottom: 6px;">
                        🎟️ Important Gate Entry Instructions:
                    </div>
                    <ul style="margin: 0; padding-left: 18px;">
                        <li>Keep your phone screen brightness high when scanning this QR pass at turnstiles.</li>
                        <li>You can also save this pass offline or take a screenshot on your mobile device.</li>
                        <li>Please carry a valid government/student photo ID for entry verification if requested.</li>
                    </ul>
                </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 24px 20px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                <div style="margin-bottom: 8px;">
                    {logo_footer}
                </div>
                <p style="margin: 0 0 4px 0;">Need Help? Contact BookMyEvent 24x7 Support at support@bookmyevent.com</p>
                <p style="margin: 0;">&copy; 2026 BookMyEvent Inc. All rights reserved.</p>
            </div>

        </div>
    </div>
</body>
</html>"""
    return subject, html
