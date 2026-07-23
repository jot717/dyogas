# REAL USER ACCEPTANCE — Browser Session

Generated: 2026-07-23T04:38:29.436Z
Base: http://127.0.0.1:8787

| Item | Result | ms | Detail |
|------|--------|----|--------|
| 1. Start application | **PASS** | 30 | {"ok":true,"service":"personal-brain"} |
| 2-3. Open browser / page loads without hanging | **PASS** | 304 | loadMs=101 |
| 4. Login/authentication flow exists | **PASS** | 406 | dashboard after login |
| 5. User workspace exists | **PASS** | 6 | Knowledge0 Pending0 WorkspaceReal UAT Brain |
| 6. Capture flow | **PASS** | 857 | Queued for approval: Real UAT Capture
Real UAT note: Personal Brain stores owner-approved knowledge for Ask My Brain. |
| 7. Approval flow (capture pending) | **PASS** | 355 | capture approve/reject controls worked |
| 8. Knowledge experience | **PASS** | 390 | detailChars=222 |
| 9. Ask My Brain human approval workflow | **PASS** | 29044 | propose→evidence→edit→approve→learn OK |

Screenshots under `stage/real-uat/`.