import re
import os

# 1. Update MoreView.jsx
moreview_path = "frontend/src/pages/dashboard/MoreView.jsx"
if os.path.exists(moreview_path):
    with open(moreview_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove category block
    content = re.sub(
        r",\s*\{\s*id:\s*['\"]categories['\"].*?icon:\s*\(.*?\)\s*\}",
        "",
        content,
        flags=re.DOTALL
    )
    content = content.replace("Purchase Orders & Stock Inward", "Purchase Orders")
    with open(moreview_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated MoreView.jsx")

# 2. Update AppRoutes.jsx
approutes_path = "frontend/src/routes/AppRoutes.jsx"
if os.path.exists(approutes_path):
    with open(approutes_path, "r", encoding="utf-8") as f:
        content = f.read()

    content = re.sub(r"\s*\}\s*else\s*if\s*\(normalizedPath\s*===\s*['\"]/categories['\"]\)\s*\{\s*tab\s*=\s*['\"]categories['\"];", "", content)
    with open(approutes_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated AppRoutes.jsx")

# 3. Update PurchaseManager.jsx
purchases_path = "frontend/src/components/purchases/PurchaseManager.jsx"
if os.path.exists(purchases_path):
    with open(purchases_path, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("Stock Inward #", "Purchase Order #")
    content = content.replace("Supplier Purchases & Stock Inward", "Supplier Purchases & Orders")
    content = content.replace("+ New Inward Order", "+ New Purchase Order")
    content = content.replace("Record First Inward Shipment", "Record First Purchase Order")
    content = content.replace("New Stock Inward Shipment", "New Supplier Purchase Order")
    content = content.replace("Confirm & Process Stock Inward", "Confirm & Save Purchase Order")
    content = content.replace("Processing Inward...", "Processing Purchase...")
    with open(purchases_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated PurchaseManager.jsx")

# 4. Update InventoryManager.jsx
inventory_path = "frontend/src/components/inventory/InventoryManager.jsx"
if os.path.exists(inventory_path):
    with open(inventory_path, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("'Manual Stock Inward'", "'Manual Stock Entry'")
    content = content.replace("Stock Inward completed for", "Stock Entry completed for")
    content = content.replace("+ Record Stock Inward", "+ Add Stock Entry")
    with open(inventory_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated InventoryManager.jsx")

# 5. Update EmptyState.jsx
emptystate_path = "frontend/src/components/common/EmptyState.jsx"
if os.path.exists(emptystate_path):
    with open(emptystate_path, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("defaultAction: 'Record Stock Inward'", "defaultAction: 'Add Stock Entry'")
    with open(emptystate_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated EmptyState.jsx")

