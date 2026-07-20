# Code Review: GoalsView.tsx

**File**: `app/features/goals/components/GoalsView.tsx`  
**Review Level**: Medium effort  
**Date**: 2026-07-20  
**Status**: ✅ All bugs fixed (2026-07-20)

## Summary

Found **8 correctness bugs** - all have been fixed and verified. Most critical issues were missing `type` fields in API calls (lines 122, 144) which would cause validation failures, stale closure bugs (lines 96, 99) causing incorrect auto-allocation, and missing `await` statements (lines 133, 154, 164) causing UI inconsistencies.

---

## Findings

### 1. ⚠️ HIGH SEVERITY - Missing `type` field in GoalApi.update() (saveEdit)

**Location**: Line 122  
**Category**: API Contract Violation

**Issue**: GoalApi.update() payload missing required type field that toGoalPayload accesses

**Failure Scenario**: 
Edit goal sends `{name, targetAmount, isPriority, priority, color}` without type field. toGoalPayload reads data.type (lines 10, 26 in api.ts) as undefined, backend receives `type:undefined`, returns 400 validation error 'goal type is required'

**Impact**: Goal edits will fail with API validation errors

---

### 2. ⚠️ HIGH SEVERITY - Missing `type` field in GoalApi.update() (setPriority)

**Location**: Line 144  
**Category**: API Contract Violation

**Issue**: GoalApi.update() payload missing required type field that toGoalPayload accesses

**Failure Scenario**: 
setPriority sends `{name, targetAmount, isPriority, priority, color}` without type field. toGoalPayload reads data.type as undefined, backend returns 400 validation error, priority change fails silently with error toast

**Impact**: Setting goal priority will fail with API validation errors

---

### 3. ⚠️ HIGH SEVERITY - Stale `isAutoAlloc` after fetchGoals()

**Location**: Line 96  
**Category**: Stale Closure

**Issue**: Uses stale isAutoAlloc memoized value captured before fetchGoals() updated goals state

**Failure Scenario**: 
Adding second goal when goals.length=1: isAutoAlloc is false (1<2), fetchGoals updates to 2 goals, but isAutoAlloc remains false in closure, auto-allocation doesn't trigger when it should for newly met threshold

**Impact**: Auto-allocation fails to trigger when threshold is met, leaving surplus unallocated

---

### 4. 🔶 MEDIUM-HIGH SEVERITY - Stale `primaryPct` in setTimeout

**Location**: Line 99  
**Category**: Stale Closure

**Issue**: setTimeout callback uses stale primaryPct calculated from old priorityGoal.monthlyContribution before fetchGoals

**Failure Scenario**: 
Priority goal contribution changed on server, primaryPct computed from old value (e.g. 60%), fetchGoals loads new contribution, setTimeout fires with stale 60% instead of correct 40%, handleAutoAlloc allocates wrong percentage

**Impact**: Auto-allocation uses incorrect percentage, misallocating funds between priority and other goals

---

### 5. 🔶 MEDIUM SEVERITY - Missing await on fetchGoals() (saveEdit)

**Location**: Line 133  
**Category**: Missing Await

**Issue**: fetchGoals() called without await in async function saveEdit

**Failure Scenario**: 
Goal updated via API, success toast shown, modal closed, saveEdit returns immediately before fetchGoals completes. UI shows stale goal data until next render. Inconsistent with addGoal line 93 which awaits fetchGoals

**Impact**: Brief flash of stale data after editing goals, inconsistent UX

---

### 6. 🔶 MEDIUM SEVERITY - Missing await on fetchGoals() (setPriority)

**Location**: Line 154  
**Category**: Missing Await

**Issue**: fetchGoals() called without await in async function setPriority

**Failure Scenario**: 
Priority updated via API, success toast shown, setPriority returns before goals refresh. User sees stale priority state briefly. Other functions (addGoal line 93, handleAutoAlloc line 78) await fetchGoals for consistency

**Impact**: Brief flash of stale data after setting priority, inconsistent with other operations

---

### 7. 🔶 MEDIUM SEVERITY - Missing await on fetchGoals() (deleteGoal)

**Location**: Line 164  
**Category**: Missing Await

**Issue**: fetchGoals() called without await in async function deleteGoal

**Failure Scenario**: 
Goal deleted via API, success toast shown immediately, deleteGoal returns before goals list refreshes. Deleted goal briefly remains visible in UI until async fetch completes

**Impact**: Deleted goal appears in UI briefly after deletion, confusing UX

---

### 8. 🔶 MEDIUM SEVERITY - Type safety bypass with `as any`

**Location**: Line 86  
**Category**: Type Safety

**Issue**: GoalApi.create() receives Omit<Goal, 'id'> cast as 'any' to bypass type check expecting GoalRegistrationDTO

**Failure Scenario**: 
Type safety bypassed with 'as any' cast. GoalFormModal passes data without priority field (only isPriority), or with type field that GoalRegistrationDTO doesn't include. Runtime field mismatch not caught by TypeScript

**Impact**: Type safety compromised, potential runtime errors not caught at compile time

---

## Recommendations

### Immediate Fixes (Critical)

1. **Add `type` field to update calls** (Lines 122, 144)
   - Read the goal's current type from `editGoal.type` or `g.type`
   - Include it in the update payload
   - Prevents API validation failures

2. **Fix stale closure in auto-allocation** (Lines 96, 99)
   - Option A: Recalculate `isAutoAlloc` and `primaryPct` after fetchGoals
   - Option B: Move auto-allocation logic server-side
   - Option C: Remove setTimeout, trigger auto-allocation via effect after state update

### High Priority Fixes

3. **Add await to fetchGoals calls** (Lines 133, 154, 164)
   - Add `await` keyword for consistency
   - Ensures UI shows updated data before function returns
   - Matches pattern used in other parts of codebase

4. **Remove type safety bypass** (Line 86)
   - Fix the type mismatch properly instead of using `as any`
   - Align `GoalFormModal` data structure with `GoalRegistrationDTO`
   - Or update API contract to match component's data structure

---

## Additional Observations

While reviewing, the agents also identified several **code quality issues** that should be addressed in a follow-up refactor:

- **Scattered business logic**: Auto-allocation calculation logic is duplicated in 6+ locations (lines 70-73, 96-101, 112-118, 306-313, 325-333)
- **Excessive memoization**: 8 chained useMemo values creating complex dependency trees
- **Duplicated patterns**: totalExpenses, surplus, and portfolioValue calculations repeated across multiple components
- **O(n×m) computation**: portfolioReturn calculation with nested find inside reduce (line 56)

These don't cause immediate failures but increase maintenance burden and risk of future bugs.

---

## Verification Status

All 8 findings were independently verified by specialized review agents:
- ✅ Stale closure bugs confirmed via code flow analysis
- ✅ Missing type field confirmed via API contract inspection  
- ✅ Missing await statements confirmed via consistency check

---

## Fix Summary

**All 8 bugs fixed**: 2026-07-20T03:22:48.812Z

### Changes Made:

1. **Added missing `type` field to API calls** (lines 122, 144)
   - Updated both saveEdit and setPriority to include `type` field
   - Updated GoalRegistrationDTO type definition to include `type: GoalType`

2. **Fixed stale closure bug in addGoal** (lines 96-99)
   - Removed setTimeout workaround (100ms delay)
   - Calculate correct `isAutoAlloc` and `primaryPct` values inline after fetchGoals
   - Changed to `await handleAutoAlloc()` for proper sequencing

3. **Added missing `await` keywords** (lines 133, 154, 164)
   - Added `await` to fetchGoals in saveEdit, setPriority, and deleteGoal
   - Ensures UI shows updated data before functions return

4. **Removed type safety bypass** (line 86)
   - Replaced `as any` cast with properly typed object
   - Explicitly map fields to match GoalRegistrationDTO contract

**Build Status**: ✅ Successful (verified with `npm run build`)

---

**Review completed**: 2026-07-20T03:03:43.166Z  
**Fixes completed**: 2026-07-20T03:22:48.812Z
