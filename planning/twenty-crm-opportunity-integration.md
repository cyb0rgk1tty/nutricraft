# Plan: Add Opportunity & Company Creation to Twenty CRM Integration

## Overview
Extend the contact form's Twenty CRM integration to create Opportunity and Company records (when applicable) in addition to the existing Person record creation.

## Data Flow
```
Contact Form Submission
        ↓
/api/contact.ts
        ↓
   ├─→ Email Notification (existing)
   │
   └─→ Twenty CRM Integration:
       1. Create Company (if company name provided)
       2. Create Person (existing, link to Company if created)
       3. Create Opportunity (link to Person and Company)
```

## Files to Modify

### 1. `src/utils/twentyCrm.ts`
- Add `createCompanyInTwentyCrm()` function
- Add `createOpportunityInTwentyCrm()` function
- Update `createPersonInTwentyCrm()` to accept optional `companyId` parameter
- Add shared types for CRM responses

### 2. `src/pages/api/contact.ts`
- Update CRM integration logic to:
  1. Create Company first (if company name provided)
  2. Create Person with Company link
  3. Create Opportunity linked to Person (and Company)
- Maintain non-blocking error handling pattern

### 3. `TWENTY_CRM_SETUP.md`
- Document new Opportunity and Company integration
- Add troubleshooting for new record types

## Implementation Details

### GraphQL Mutations Needed

**Create Company:**
```graphql
mutation CreateCompany($data: CompanyCreateInput!) {
  createCompany(data: $data) {
    id
    name
  }
}
```

**Create Opportunity:**
```graphql
mutation CreateOpportunity($data: OpportunityCreateInput!) {
  createOpportunity(data: $data) {
    id
    name
    stage
  }
}
```

### Twenty CRM Opportunity Schema (Confirmed)

| Field              | Type      | Required | Default        | Description                                             |
|--------------------|-----------|----------|----------------|---------------------------------------------------------|
| id                 | UUID      | No       | Auto-generated | Unique identifier                                       |
| name               | Text      | Yes      | ''             | Opportunity name                                        |
| stage              | Enum      | Yes      | NEW            | Pipeline stage                                          |
| amountAmountMicros | Numeric   | No       | null           | Amount in micros (divide by 1,000,000 for actual value) |
| amountCurrencyCode | Text      | No       | ''             | Currency code (e.g., USD, EUR)                          |
| closeDate          | Timestamp | No       | null           | Expected close date                                     |
| details            | Text      | No       | ''             | Additional details/notes                                |
| position           | Float     | No       | 0              | Display position in UI                                  |
| companyId          | UUID      | No       | null           | Related company ID (foreign key)                        |
| pointOfContactId   | UUID      | No       | null           | Related person/contact ID (foreign key)                 |
| createdAt          | Timestamp | No       | Auto-set       | Creation timestamp                                      |
| updatedAt          | Timestamp | No       | Auto-set       | Last update timestamp                                   |

### Opportunity Field Mapping (Form → CRM)

| Form Field | Opportunity Field | Transformation |
|------------|-------------------|----------------|
| name + projectType | `name` | e.g., "Private Label - John Smith" |
| - | `stage` | Set to `NEW` (default stage) |
| budget | `amountAmountMicros` | Parse upper value × 1,000,000 |
| budget | `amountCurrencyCode` | Set to `USD` |
| - | `closeDate` | null (staff will set when client pays) |
| message (Project Details) | `details` | Direct copy from form |
| personId | `pointOfContactId` | Link to created Person |
| companyId | `companyId` | Link to created/found Company |

### Budget Parsing Logic

"Micros" = dollar value × 1,000,000 (standard format used by Twenty CRM)

| Form Selection | Dollar Value | amountAmountMicros |
|----------------|--------------|-------------------|
| `$0-5,000` | $5,000 | 5,000,000,000 |
| `$5,000-10,000` | $10,000 | 10,000,000,000 |
| `$10,000+` | - | null |
| Not provided | - | null |

### Company Field Mapping

| Form Field | Company Field |
|------------|---------------|
| company | name |
| - | domainName | Could parse from email domain |

### Error Handling Strategy

Maintain the existing non-blocking pattern:
- If Company creation fails: Log error, continue without Company link
- If Person creation fails: Log error, still attempt Opportunity with no Person link
- If Opportunity creation fails: Log error, form still succeeds

### Potential Challenges

1. ~~**GraphQL Schema Discovery**~~: ✅ Resolved - Opportunity schema confirmed
2. ~~**Pipeline Stage**~~: ✅ Resolved - Using `NEW` as default stage
3. **Custom Fields**: Project Details (message) will be stored directly in `details` field
4. **Duplicate Companies**: Will search by name before creating (case-insensitive)

## Implementation Steps

1. Research Twenty CRM GraphQL schema for Opportunity and Company mutations
2. Add `createCompanyInTwentyCrm()` function with domain-based duplicate detection
3. Update `createPersonInTwentyCrm()` to accept optional companyId
4. Add `createOpportunityInTwentyCrm()` function with full lead data mapping
5. Update contact.ts to orchestrate: Company → Person → Opportunity
6. Test locally with form submissions
7. Update documentation

## Configuration

- **Initial Opportunity Stage:** `NEW` (default enum value)
- **Company Duplicate Check:** Yes, search by name before creating (case-insensitive)
- **Lead Data Storage:** Project Details (message) stored directly in `details` field
- **Amount Currency:** `USD`

## Implementation Sequence

### Step 1: Add Company Functions to `twentyCrm.ts`
```typescript
// Search for existing company by name
async function findCompanyByName(name: string): Promise<string | null>

// Create new company record
async function createCompanyInTwentyCrm(companyName: string, emailDomain?: string): Promise<TwentyCrmResponse>
```

### Step 2: Update Person Creation
```typescript
// Add optional companyId parameter
async function createPersonInTwentyCrm(
  formData: ContactFormData,
  companyId?: string  // NEW: link person to company
): Promise<TwentyCrmResponse>
```

### Step 3: Add Opportunity Function
```typescript
async function createOpportunityInTwentyCrm(
  formData: ContactFormData,
  personId: string,
  companyId?: string
): Promise<TwentyCrmResponse>
```

### Step 4: Update `contact.ts` Integration Flow
```typescript
// 1. Check/Create Company
let companyId: string | undefined;
if (company) {
  const existing = await findCompanyByName(company);
  companyId = existing || (await createCompanyInTwentyCrm(company)).companyId;
}

// 2. Create Person (with company link)
const person = await createPersonInTwentyCrm(formData, companyId);

// 3. Create Opportunity (linked to person and company)
await createOpportunityInTwentyCrm(formData, person.personId, companyId);
```

### Step 5: Test & Document
- Test locally with various form submissions
- Update `TWENTY_CRM_SETUP.md` with new features
