from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid
import random

app = FastAPI(title="Account Service")

# Mock Database
accounts = {} # map of account_id -> details

ALLOWED_BRANCHES = ["Hyderabad", "Bangalore", "Pune", "Bidar", "Chennai"]

def generate_11_digit_id():
    # Enforces exactly 11 numeric digits, e.g. '04928371948'
    return ''.join([str(random.randint(0, 9)) for _ in range(11)])

class AccountCreate(BaseModel):
    user_id: str
    branch: str

class BalanceUpdate(BaseModel):
    amount: float

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/accounts")
def create_account(req: AccountCreate):
    if req.branch not in ALLOWED_BRANCHES:
        raise HTTPException(status_code=400, detail=f"Invalid branch. Must be one of: {ALLOWED_BRANCHES}")

    account_id = generate_11_digit_id()
    # Ensure uniqueness just in case
    while account_id in accounts:
        account_id = generate_11_digit_id()

    accounts[account_id] = {
        "id": account_id,
        "user_id": req.user_id,
        "branch": req.branch,
        "balance": 0.0
    }
    return accounts[account_id]

@app.get("/accounts/{user_id}")
def get_accounts(user_id: str):
    user_accounts = [acc for acc in accounts.values() if acc["user_id"] == user_id]
    return user_accounts

@app.get("/accounts/details/{account_id}")
def get_account(account_id: str):
    if account_id not in accounts:
        raise HTTPException(status_code=404, detail="Account not found")
    return accounts[account_id]

@app.post("/accounts/{account_id}/update_balance")
def update_balance(account_id: str, req: BalanceUpdate):
    if account_id not in accounts:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Simple race-condition prone mock update for demo
    accounts[account_id]["balance"] += req.amount
    return accounts[account_id]
