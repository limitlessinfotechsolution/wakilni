
# Phase 3 Completion: Missing Features Implementation
## Completing DonatePage Migration, ProfileSettingsPage Enhancement, and Additional Feature Modules

---

## Executive Summary

After thorough exploration of the codebase, I've identified the following missing features from the Phase 3 redesign plan:

1. **DonatePage.tsx** - Still uses `MainLayout`, needs conditional `DashboardLayout` migration
2. **ProfileSettingsPage.tsx** - Missing GlassCard styling and security section
3. **Feature Modules** - Missing `locations`, `reports`, and `services` modules
4. **Test Coverage** - Missing tests for hooks, components, and role-based routing
5. **Module Index Files** - Need to add new module exports

---

## Batch 1: DonatePage Migration

### Current State
- Uses `MainLayout` for all users
- No conditional layout based on authentication
- Missing animated donation counter
- Missing Zakat calculator tab
- Missing recurring donation toggle

### Changes Required

**File**: `src/pages/donate/DonatePage.tsx`

1. **Conditional Layout Pattern**:
```typescript
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MainLayout } from '@/components/layout';

// Inside component
const Layout = user ? DashboardLayout : MainLayout;
return <Layout>...</Layout>;
```

2. **Add Animated Counter**:
   - Apply `animate-counter-up` class to stats
   - Add visual counter increment animation

3. **Add Zakat Calculator Tab**:
   - New tab in the form section
   - Calculate Zakat based on wealth input (2.5%)
   - Auto-fill donation amount from calculation

4. **Add Recurring Donation Toggle**:
   - Switch component for monthly recurring
   - Update form state to include `is_recurring`

5. **GlassCard Styling**:
   - Wrap stats in GlassCard components
   - Add hover effects and glow

---

## Batch 2: ProfileSettingsPage Enhancement

### Current State
- Uses `DashboardLayout` (correct)
- Uses standard `Card` components
- Missing GlassCard styling
- Missing security section with session management
- Missing data export button

### Changes Required

**File**: `src/pages/settings/ProfileSettingsPage.tsx`

1. **GlassCard Styling**:
   - Import and wrap all sections in `GlassCard`
   - Add `hoverable` and `glow` props

2. **Avatar Camera Overlay Animation**:
   - Add hover scale effect on avatar container
   - Add gradient overlay on hover

3. **Add Security Tab**:
   - New tab alongside Profile, Notifications, Preferences
   - Include:
     - Password change section
     - Active sessions list (mock data)
     - Two-factor authentication toggle (placeholder)
     - Account deletion option

4. **Add Data Export Button**:
   - GDPR compliance
   - Button to request data export
   - Toast confirmation

5. **Animated Toggle Switches**:
   - Add haptic feedback on toggle
   - Visual feedback animation

---

## Batch 3: New Feature Modules

### 3.1 Locations Module
**File**: `src/modules/locations/index.ts`

```typescript
export { useGeolocation } from '@/hooks/useGeolocation';
export { useRitualLocation } from '@/hooks/useRitualLocation';
export { HOLY_SITES } from '@/config/constants';
```

### 3.2 Reports Module
**File**: `src/modules/reports/index.ts`

```typescript
export { useAdminStats } from '@/hooks/useAdminStats';
export { useAuditLogs } from '@/hooks/useAuditLogs';
export * as AuditAPI from '@/api/services/audit.service';
```

### 3.3 Services Module
**File**: `src/modules/services/index.ts`

```typescript
export { useServices } from '@/hooks/useServices';
export { useProviderServices } from '@/hooks/useProviderServices';
export * as ServicesAPI from '@/api/services/services.service';
export { SERVICE_TYPES, SERVICE_TYPE_LABELS } from '@/config/constants';
```

### 3.4 Providers Module
**File**: `src/modules/providers/index.ts`

```typescript
export { useProvider } from '@/hooks/useProvider';
export { usePublicProvider } from '@/hooks/usePublicProvider';
export { useProviderAvailability } from '@/hooks/useProviderAvailability';
export { usePilgrimCertification } from '@/hooks/usePilgrimCertification';
export * as ProvidersAPI from '@/api/services/providers.service';
```

### 3.5 Update Module Index
**File**: `src/modules/index.ts`

Add exports for new modules.

---

## Batch 4: Test Coverage Expansion

### 4.1 Hooks Tests
**File**: `src/tests/hooks/auth.test.ts`
- Test `hasPermission` function
- Test role hierarchy
- Test `canAccessRoute` helper

### 4.2 Components Tests
**File**: `src/tests/components/feedback.test.ts`
- Test ConfirmDialog behavior
- Test EmptyState rendering
- Test LoadingState variants

### 4.3 Role-Based Routing Tests
**File**: `src/tests/routing/protected-routes.test.ts`
- Test ProtectedRoute component
- Test role-based redirects
- Test unauthorized access handling

### 4.4 API Services Tests
**File**: `src/tests/api/providers.test.ts`
- Test provider CRUD operations
- Test availability management
- Test KYC status updates

---

## Files to Create

```text
src/modules/
  locations/
    index.ts
  reports/
    index.ts
  services/
    index.ts
  providers/
    index.ts

src/tests/
  hooks/
    auth.test.ts
  components/
    feedback.test.ts
  routing/
    protected-routes.test.ts
  api/
    providers.test.ts
```

## Files to Modify

```text
Pages:
  - src/pages/donate/DonatePage.tsx (conditional layout, GlassCard, Zakat calculator)
  - src/pages/settings/ProfileSettingsPage.tsx (GlassCard, security tab, data export)

Modules:
  - src/modules/index.ts (add new module exports)
```

---

## Technical Implementation Details

### Conditional Layout Pattern
```typescript
export default function DonatePage() {
  const { user } = useAuth();
  const Layout = user ? DashboardLayout : MainLayout;

  return (
    <Layout>
      {/* content */}
    </Layout>
  );
}
```

### Zakat Calculator Component
```typescript
const ZakatCalculator = () => {
  const [wealth, setWealth] = useState(0);
  const zakatAmount = wealth * 0.025; // 2.5% Zakat

  return (
    <GlassCard>
      <Input 
        type="number" 
        value={wealth} 
        onChange={(e) => setWealth(Number(e.target.value))} 
        placeholder="Enter total wealth..."
      />
      <p>Zakat Due: {zakatAmount.toLocaleString()} SAR</p>
      <Button onClick={() => setAmount(zakatAmount)}>
        Use This Amount
      </Button>
    </GlassCard>
  );
};
```

### Security Section Structure
```typescript
<TabsContent value="security">
  <GlassCard>
    <CardTitle>Change Password</CardTitle>
    {/* Password change form */}
  </GlassCard>
  
  <GlassCard>
    <CardTitle>Active Sessions</CardTitle>
    {/* List of active sessions with device info */}
    {/* "Sign out all" button */}
  </GlassCard>
  
  <GlassCard>
    <CardTitle>Two-Factor Authentication</CardTitle>
    {/* 2FA setup placeholder */}
  </GlassCard>
  
  <GlassCard variant="destructive">
    <CardTitle>Delete Account</CardTitle>
    {/* Account deletion with ConfirmDialog */}
  </GlassCard>
</TabsContent>
```

---

## Implementation Order

### Step 1: Create New Feature Modules
1. Create `src/modules/locations/index.ts`
2. Create `src/modules/reports/index.ts`
3. Create `src/modules/services/index.ts`
4. Create `src/modules/providers/index.ts`
5. Update `src/modules/index.ts`

### Step 2: Migrate DonatePage
1. Add conditional layout pattern
2. Add GlassCard styling to stats
3. Add Zakat calculator tab
4. Add recurring donation toggle
5. Add animated counter

### Step 3: Enhance ProfileSettingsPage
1. Add Security tab
2. Wrap sections in GlassCard
3. Add animated toggle switches
4. Add data export button
5. Add session management section

### Step 4: Add Test Skeletons
1. Create hooks tests
2. Create component tests
3. Create routing tests
4. Create API tests

---

## Success Criteria

- DonatePage uses conditional DashboardLayout/MainLayout
- DonatePage has Zakat calculator tab
- DonatePage has recurring donation toggle
- ProfileSettingsPage has Security tab with session management
- ProfileSettingsPage uses GlassCard throughout
- All new feature modules created and exported
- Test skeletons for hooks, components, routing, and API
- All components support RTL
- Premium animations applied throughout
