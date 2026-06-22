# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Tools for the Shopping Assistant agent."""

from dataclasses import dataclass


@dataclass
class DiscountCode:
    """Represents a single-use discount code."""

    code: str
    discount_percent: int
    description: str
    redeemed: bool = False
    redeemed_by: str | None = None


# ---------------------------------------------------------------------------
# In-memory discount code store
# ---------------------------------------------------------------------------
_DISCOUNT_STORE: dict[str, DiscountCode] = {
    "WELCOME50": DiscountCode(
        code="WELCOME50",
        discount_percent=50,
        description="50% off your first purchase — welcome offer",
    ),
    "SUMMER20": DiscountCode(
        code="SUMMER20",
        discount_percent=20,
        description="20% off any summer collection item",
    ),
    "LOYALTY10": DiscountCode(
        code="LOYALTY10",
        discount_percent=10,
        description="10% loyalty discount for returning customers",
    ),
}

# Simulated registered user IDs (stand-in for a real user database)
_REGISTERED_USERS: set[str] = {"user_001", "user_002", "user_003", "user_vip"}


def redeem_discount_code(user_id: str, code: str) -> dict:
    """Redeem a single-use discount code for a registered user.

    Checks the in-memory discount code store to verify that:
      - The requesting user is registered in the system.
      - The discount code exists.
      - The discount code has not already been redeemed.

    If all checks pass, the code is marked as redeemed and the discount
    details are returned to the caller.

    Args:
        user_id: The unique identifier of the registered user attempting
            to redeem the code (e.g. "user_001").
        code: The discount code string to redeem (e.g. "WELCOME50").

    Returns:
        A dict with the following fields:
          - "success" (bool): Whether the redemption succeeded.
          - "message" (str): Human-readable outcome description.
          - "discount_percent" (int | None): The discount value if redeemed.
          - "description" (str | None): The code description if redeemed.
    """
    # --- Validate user registration ---
    if user_id not in _REGISTERED_USERS:
        return {
            "success": False,
            "message": (
                f"User '{user_id}' is not registered. "
                "Please create an account before redeeming discount codes."
            ),
            "discount_percent": None,
            "description": None,
        }

    # --- Normalize and look up the code ---
    normalized_code = code.strip().upper()
    discount = _DISCOUNT_STORE.get(normalized_code)

    if discount is None:
        return {
            "success": False,
            "message": f"Discount code '{code}' does not exist.",
            "discount_percent": None,
            "description": None,
        }

    # --- Enforce single-use policy ---
    if discount.redeemed:
        return {
            "success": False,
            "message": (
                f"Discount code '{normalized_code}' has already been redeemed "
                f"and cannot be used again."
            ),
            "discount_percent": None,
            "description": None,
        }

    # --- Redeem the code ---
    discount.redeemed = True
    discount.redeemed_by = user_id

    return {
        "success": True,
        "message": (
            f"Code '{normalized_code}' successfully redeemed by user '{user_id}'. "
            f"You receive {discount.discount_percent}% off!"
        ),
        "discount_percent": discount.discount_percent,
        "description": discount.description,
    }


def browse_products(category: str = "") -> dict:
    """Browse available products in the retail store catalogue.

    Args:
        category: Optional product category filter (e.g. "electronics",
            "clothing", "home"). Leave empty to browse all categories.

    Returns:
        A dict containing a list of product dicts, each with "name",
        "category", "price_usd", and "in_stock" fields.
    """
    catalogue = [
        {
            "name": "Wireless Noise-Cancelling Headphones",
            "category": "electronics",
            "price_usd": 199.99,
            "in_stock": True,
        },
        {
            "name": "Bluetooth Mechanical Keyboard",
            "category": "electronics",
            "price_usd": 129.99,
            "in_stock": True,
        },
        {
            "name": "Summer Linen Shirt",
            "category": "clothing",
            "price_usd": 49.99,
            "in_stock": True,
        },
        {
            "name": "Floral Maxi Dress",
            "category": "clothing",
            "price_usd": 69.99,
            "in_stock": False,
        },
        {
            "name": "Bamboo Desk Organiser",
            "category": "home",
            "price_usd": 34.99,
            "in_stock": True,
        },
        {
            "name": "Scented Soy Candle Set",
            "category": "home",
            "price_usd": 24.99,
            "in_stock": True,
        },
        {
            "name": "Running Trainers (Unisex)",
            "category": "footwear",
            "price_usd": 119.99,
            "in_stock": True,
        },
    ]

    if category:
        filtered = [p for p in catalogue if p["category"].lower() == category.lower()]
        return {"products": filtered, "total": len(filtered)}

    return {"products": catalogue, "total": len(catalogue)}


def get_order_status(order_id: str) -> dict:
    """Look up the current status of a customer order.

    Args:
        order_id: The unique order identifier (e.g. "ORD-20240001").

    Returns:
        A dict with "order_id", "status", "estimated_delivery", and
        "tracking_number" fields. Returns an error message if not found.
    """
    # Simulated order records
    orders = {
        "ORD-20240001": {
            "order_id": "ORD-20240001",
            "status": "shipped",
            "estimated_delivery": "2026-06-25",
            "tracking_number": "TRK-9981234567",
        },
        "ORD-20240002": {
            "order_id": "ORD-20240002",
            "status": "processing",
            "estimated_delivery": "2026-06-28",
            "tracking_number": None,
        },
        "ORD-20240003": {
            "order_id": "ORD-20240003",
            "status": "delivered",
            "estimated_delivery": "2026-06-20",
            "tracking_number": "TRK-9987654321",
        },
    }

    order = orders.get(order_id.upper())
    if order is None:
        return {
            "order_id": order_id,
            "status": "not_found",
            "estimated_delivery": None,
            "tracking_number": None,
            "message": f"No order found with ID '{order_id}'.",
        }
    return order
