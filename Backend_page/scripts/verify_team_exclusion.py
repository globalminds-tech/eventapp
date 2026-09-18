from app.modules.admin.services.admin_service import AdminService
from app.modules.finance.services.finance_service import FinanceService

print("=== 1. TESTING ADMIN KYC GET_ALL_USERS ===")
res = AdminService.get_all_users()
print(f"Total users returned in KYC directory: {len(res)}")
for u in res:
    print(f" - {u.get('name')} | Email: {u.get('email')} | Roles: {u.get('roles')} | KYC: {u.get('kyc_status')}")

emails_in_kyc = [u.get('email') for u in res]
assert 'supporttabillbook@gmail.com' not in emails_in_kyc, "ERROR: Sam should not be in KYC directory!"
assert 'ashokbabu3843@gmail.com' not in emails_in_kyc, "ERROR: Ram should not be in KYC directory!"
assert 'ashokbabu3483@gmail.com' not in emails_in_kyc, "ERROR: Smith should not be in KYC directory!"
print(">>> KYC Directory Test PASSED: No team members found!")

print("\n=== 2. TESTING FINANCE GET_ADMIN_PAYOUT_QUEUE ===")
payout_queue = FinanceService.get_admin_payout_queue()
print(f"Total entries in Payout Queue: {len(payout_queue)}")
for p in payout_queue:
    print(f" - {p.get('name')} | Email: {p.get('email')} | Company: {p.get('company_name')} | Escrow: {p.get('available_balance')} | KYC: {p.get('kyc_status')}")

emails_in_payout = [p.get('email') for p in payout_queue]
assert 'supporttabillbook@gmail.com' not in emails_in_payout, "ERROR: Sam should not be in Payout Queue!"
assert 'ashokbabu3843@gmail.com' not in emails_in_payout, "ERROR: Ram should not be in Payout Queue!"
assert 'ashokbabu3483@gmail.com' not in emails_in_payout, "ERROR: Smith should not be in Payout Queue!"
print(">>> Payout Queue Test PASSED: No team members found!")
