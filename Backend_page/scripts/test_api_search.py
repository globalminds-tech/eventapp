from app.modules.admin.services.admin_service import AdminService
from app.modules.finance.services.finance_service import FinanceService

print("=== 1. TESTING CATEGORY API-DRIVEN SEARCH ===")
all_cats = AdminService.get_categories()
print(f"Total categories (unfiltered): {len(all_cats)}")
search_res = AdminService.get_categories(search="music")
print(f"Categories matching 'music': {len(search_res)} -> {[c['name'] for c in search_res]}")

print("\n=== 2. TESTING PAYOUT QUEUE API-DRIVEN SEARCH ===")
all_payouts = FinanceService.get_admin_payout_queue()
print(f"Total payouts (unfiltered): {len(all_payouts)} -> {[p['name'] for p in all_payouts]}")
ashok_payouts = FinanceService.get_admin_payout_queue(search="ashok")
print(f"Payouts matching 'ashok': {len(ashok_payouts)} -> {[p['name'] for p in ashok_payouts]}")
nomatch_payouts = FinanceService.get_admin_payout_queue(search="nonexistentquery")
print(f"Payouts matching 'nonexistentquery': {len(nomatch_payouts)}")
assert len(nomatch_payouts) == 0, "Should return 0 for nonexistent query"
print("\n>>> ALL API SEARCH TESTS PASSED SUCCESSFULLY!")
