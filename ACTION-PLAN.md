# Action Plan: Bold Routes Partners Security & Performance

**Created:** 2024-12-19  
**Owner:** Development Team  
**Status:** In Progress

## Priority Matrix

| Item | Type | Effort | Impact | Owner | Status | Acceptance Criteria |
|------|------|--------|--------|-------|--------|-------------------|
| **P0 - Critical (This Week)** |
| RLS-001 | Security | M | High | BE | 🔄 | All tables have proper RLS policies, unauthorized access blocked |
| STOR-001 | Security | S | High | BE | 🔄 | File uploads restricted to deals/ prefix only |
| AUTH-001 | Security | S | High | BE | 🔄 | Admin operations verify role in backend, not just frontend |
| FILE-001 | Security | M | High | FE | 🔄 | File uploads validate MIME type, size limits enforced |
| **P1 - High (Next 2 Weeks)** |
| PERF-001 | Performance | M | High | FE | ⏳ | React Query implemented, API calls cached, loading states |
| VALID-001 | Security | S | Medium | FE | ⏳ | Input length limits, numeric bounds, phone normalization |
| ADMIN-001 | Feature | M | Medium | FE | ⏳ | Pagination, search, filtering on admin lists |
| ERROR-001 | DX | S | Medium | FE | ⏳ | Error boundaries, user-friendly error messages |
| **P2 - Medium (Next Month)** |
| RATE-001 | Security | L | Medium | BE | ⏳ | Rate limiting on public forms, CAPTCHA integration |
| AUDIT-001 | Security | M | Medium | BE | ⏳ | Audit table tracks admin actions with timestamps |
| MONITOR-001 | Ops | M | Medium | FE/BE | ⏳ | Error tracking, performance monitoring setup |
| EXPORT-001 | Feature | S | Low | FE | ⏳ | CSV export functionality for admin data |

**Legend:** 
- Effort: S(mall) = 1-2 days, M(edium) = 3-5 days, L(arge) = 1-2 weeks
- Status: 🔄 In Progress, ⏳ Planned, ✅ Complete, ❌ Blocked

## Detailed Implementation Plan

### P0 Items (Critical - Complete by Dec 26, 2024)

#### RLS-001: Implement Row Level Security
**Owner:** Backend  
**Effort:** Medium (4 days)  
**Dependencies:** None

**Acceptance Criteria:**
- [ ] `partner_applications` table: anon can INSERT only, admin can SELECT all
- [ ] `closed_deals` table: anon can INSERT only, admin can SELECT all  
- [ ] `profiles` table: users can SELECT/UPDATE own profile, admin can SELECT all
- [ ] Storage bucket: admin can SELECT files, anon can INSERT to deals/ only
- [ ] All policies tested with different user roles

**Test Cases:**
```sql
-- Test 1: Anon cannot read applications
SELECT * FROM partner_applications; -- Should fail

-- Test 2: Anon can insert application
INSERT INTO partner_applications (full_name, phone, company_name, agents_count, has_papers) 
VALUES ('Test User', '+1234567890', 'Test Co', 1, true); -- Should succeed

-- Test 3: Admin can read all
-- (With admin role in profiles)
SELECT * FROM partner_applications; -- Should succeed

-- Test 4: User cannot read other profiles
SELECT * FROM profiles WHERE id != auth.uid(); -- Should fail
```

#### STOR-001: Restrict Storage Paths
**Owner:** Backend  
**Effort:** Small (1 day)  
**Dependencies:** None

**Acceptance Criteria:**
- [ ] Storage policy enforces `deals/` prefix for uploads
- [ ] Attempts to upload to other paths fail with proper error
- [ ] Existing files remain accessible to admin users

**Test Cases:**
- Upload to `deals/test.pdf` → Success
- Upload to `../admin/test.pdf` → Fail  
- Upload to `test.pdf` → Fail

#### AUTH-001: Backend Admin Verification
**Owner:** Backend  
**Effort:** Small (2 days)  
**Dependencies:** RLS-001

**Acceptance Criteria:**
- [ ] `listApplications()` verifies admin role via RLS
- [ ] `listDeals()` verifies admin role via RLS
- [ ] `signUrl()` checks admin role before generating URLs
- [ ] Direct API calls fail for non-admin users

**Test Cases:**
- Non-admin calls admin API endpoints → 403 Forbidden
- Admin calls admin API endpoints → Success
- Frontend admin check bypass → Still blocked by backend

#### FILE-001: File Upload Validation
**Owner:** Frontend  
**Effort:** Medium (3 days)  
**Dependencies:** None

**Acceptance Criteria:**
- [ ] File type whitelist: PDF, DOC, DOCX, JPG, PNG only
- [ ] Maximum file size: 10MB per file
- [ ] Maximum files: 5 per deal
- [ ] Upload progress indicator shown
- [ ] Detailed error messages for rejection reasons

**Test Cases:**
- Upload 15MB file → Reject with size error
- Upload .exe file → Reject with type error
- Upload valid PDF → Success with progress bar
- Upload 6 files → Reject 6th file with count error

### P1 Items (High Priority - Complete by Jan 9, 2025)

#### PERF-001: React Query Implementation
**Owner:** Frontend  
**Effort:** Medium (4 days)  
**Dependencies:** None

**Acceptance Criteria:**
- [ ] All Supabase calls wrapped in React Query
- [ ] Proper cache keys and stale times configured
- [ ] Loading states implemented for all data fetching
- [ ] Error states with retry functionality
- [ ] Optimistic updates where appropriate

**Implementation Details:**
```typescript
// Example implementation
const useCommissions = () => {
  return useQuery({
    queryKey: ['commissions'],
    queryFn: getCommissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};
```

#### VALID-001: Input Validation Hardening
**Owner:** Frontend  
**Effort:** Small (2 days)  
**Dependencies:** None

**Acceptance Criteria:**
- [ ] String fields limited to reasonable lengths (name: 100, company: 200)
- [ ] Deal value capped at 1 billion EGP
- [ ] Phone numbers normalized to E.164 format
- [ ] All validation errors user-friendly

#### ADMIN-001: Enhanced Admin Interface
**Owner:** Frontend  
**Effort:** Medium (4 days)  
**Dependencies:** PERF-001

**Acceptance Criteria:**
- [ ] Pagination (20 items per page) for applications and deals
- [ ] Search functionality by name, company, phone
- [ ] Date range filtering
- [ ] Sort by any column
- [ ] CSV export button
- [ ] Empty states with helpful messages

### P2 Items (Medium Priority - Complete by Feb 15, 2025)

#### RATE-001: Rate Limiting & Anti-Spam
**Owner:** Backend  
**Effort:** Large (8 days)  
**Dependencies:** None

**Acceptance Criteria:**
- [ ] Edge Function implements rate limiting (5 submissions/IP/hour)
- [ ] CAPTCHA integration on public forms
- [ ] Blocked IPs logged for analysis
- [ ] Admin notification for suspected abuse

#### AUDIT-001: Audit Logging
**Owner:** Backend  
**Effort:** Medium (5 days)  
**Dependencies:** RLS-001

**Acceptance Criteria:**
- [ ] Audit table tracks all admin actions
- [ ] Log includes: user_id, action, table, record_id, timestamp, IP
- [ ] Admin interface to view audit logs
- [ ] Retention policy (1 year) implemented

## Risk Mitigation

### Deployment Strategy
1. **Staging Environment:** Test all P0 changes in staging first
2. **Feature Flags:** Use environment variables to enable/disable new features
3. **Rollback Plan:** Database migrations must be reversible
4. **Monitoring:** Set up alerts before deploying security changes

### Dependencies
- **External Services:** Consider CAPTCHA service selection early
- **Team Coordination:** Backend and frontend changes must be synchronized
- **Data Migration:** Existing data needs status columns populated

### Success Metrics
- **Security:** Zero unauthorized access attempts succeed
- **Performance:** Page load times < 2 seconds, API calls < 500ms
- **User Experience:** Form submission success rate > 95%
- **Operational:** Zero critical security incidents

## Timeline

```
Week 1 (Dec 19-26):  RLS-001, STOR-001, AUTH-001, FILE-001
Week 2 (Dec 27-Jan 2): PERF-001, VALID-001
Week 3 (Jan 3-9):    ADMIN-001, ERROR-001
Week 4 (Jan 10-16):  RATE-001 (start)
Week 5 (Jan 17-23):  RATE-001 (complete), AUDIT-001
```

## Communication Plan

- **Daily Standups:** Progress updates on P0 items
- **Weekly Reviews:** Demo completed features to stakeholders
- **Monthly Retrospectives:** Process improvements and lessons learned
- **Security Reviews:** External security audit after P0 completion

## Definition of Done

Each item is considered complete when:
- [ ] Implementation passes all acceptance criteria
- [ ] All test cases pass
- [ ] Code review approved by 2+ team members
- [ ] Documentation updated
- [ ] Deployed to staging and tested
- [ ] Security review passed (for security items)
- [ ] Performance benchmarks met (for performance items)
