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

"""Security boundary and business logic unit tests for the redeem_discount_code tool."""

import pytest
from app.tools import _DISCOUNT_STORE, _REGISTERED_USERS, DiscountCode, redeem_discount_code


@pytest.fixture(autouse=True)
def clean_discount_store():
    """Fixture to ensure a clean in-memory discount store before and after each test."""
    # Backup original store
    original_store = {
        code: DiscountCode(
            code=item.code,
            discount_percent=item.discount_percent,
            description=item.description,
            redeemed=item.redeemed,
            redeemed_by=item.redeemed_by
        )
        for code, item in _DISCOUNT_STORE.items()
    }

    yield

    # Restore original store
    _DISCOUNT_STORE.clear()
    for code, item in original_store.items():
        _DISCOUNT_STORE[code] = item


def test_redeem_unregistered_user() -> None:
    """Security Boundary: Unregistered users must be blocked from redeeming codes."""
    unregistered_user = "attacker_999"
    result = redeem_discount_code(user_id=unregistered_user, code="WELCOME50")

    assert result["success"] is False
    assert "not registered" in result["message"]
    assert result["discount_percent"] is None
    assert result["description"] is None
    assert _DISCOUNT_STORE["WELCOME50"].redeemed is False


def test_redeem_invalid_code() -> None:
    """Business Logic Guardrail: Non-existent discount codes must return failure."""
    registered_user = "user_001"
    invalid_code = "FAKECODE100"
    result = redeem_discount_code(user_id=registered_user, code=invalid_code)

    assert result["success"] is False
    assert "does not exist" in result["message"]
    assert result["discount_percent"] is None
    assert result["description"] is None


def test_redeem_successful() -> None:
    """Business Logic Guardrail: Valid code and registered user must succeed."""
    registered_user = "user_001"
    code = "WELCOME50"
    result = redeem_discount_code(user_id=registered_user, code=code)

    assert result["success"] is True
    assert "successfully redeemed" in result["message"]
    assert result["discount_percent"] == 50
    assert result["description"] == "50% off your first purchase — welcome offer"

    # Verify store changes
    assert _DISCOUNT_STORE[code].redeemed is True
    assert _DISCOUNT_STORE[code].redeemed_by == registered_user


def test_redeem_single_use_restriction() -> None:
    """Security Boundary: Single-use codes cannot be redeemed more than once."""
    user1 = "user_001"
    user2 = "user_002"
    code = "WELCOME50"

    # First redemption succeeds
    first_result = redeem_discount_code(user_id=user1, code=code)
    assert first_result["success"] is True
    assert _DISCOUNT_STORE[code].redeemed is True

    # Second redemption by same user must fail
    second_result_same_user = redeem_discount_code(user_id=user1, code=code)
    assert second_result_same_user["success"] is False
    assert "already been redeemed" in second_result_same_user["message"]

    # Third redemption by different user must also fail
    third_result_diff_user = redeem_discount_code(user_id=user2, code=code)
    assert third_result_diff_user["success"] is False
    assert "already been redeemed" in third_result_diff_user["message"]


def test_redeem_case_insensitivity_and_spacing() -> None:
    """Business Logic Guardrail: Code names must normalize spaces and letter casing."""
    registered_user = "user_001"
    code_with_spaces_and_casing = "  summer20  "

    result = redeem_discount_code(user_id=registered_user, code=code_with_spaces_and_casing)

    assert result["success"] is True
    assert result["discount_percent"] == 20
    assert _DISCOUNT_STORE["SUMMER20"].redeemed is True
    assert _DISCOUNT_STORE["SUMMER20"].redeemed_by == registered_user
