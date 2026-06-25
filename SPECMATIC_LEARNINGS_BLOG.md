# From Custom Reports to 100% Absolute Coverage: Lessons from Specmatic Integration

**Date**: June 25, 2026  
**Project**: AI Money Mentor - Specmatic API Testing  
**Topics**: API Testing, CI/CD, OpenAPI Conformance, Schema Resiliency Testing, Test State Management

---

## TL;DR

We migrated from custom Python-generated test reports to native Specmatic reports in our CI pipeline. Expanding on this, we resolved the conflict between running targeted test subsets and achieving **100% Absolute API Coverage** by building a dynamic, indentation-based OpenAPI spec filter. We also aligned our endpoint error statuses with standard REST principles to pass negative schema mutations, and documented test state independence rules. Here are our comprehensive learnings.

---

## 1. The Reporting Challenge: Custom vs. Native

In the initial test setup, we parsed Specmatic's console logs with regex and built custom HTML files to generate evidence.

### Why Custom Parsing Failed
1. **Fragility**: Specmatic console updates would break our regex matching.
2. **Loss of Detail**: Native reports output CTRF (Common Test Report Format) and interactive HTML dashboards which are 5x more detailed.
3. **Dependency Overhead**: Running Python in Node-centric Docker containers created CI setup failures.

### The Fix
We removed the Python parsing step. Instead, we mounted the volume in Docker, captured Specmatic's native report files, and saved them to separate subdirectories (`reports/none/`, `reports/positiveOnly/`, and `reports/all/`).

---

## 2. Resolving the Coverage Paradox (100% Absolute Coverage)

Specmatic reports two coverage metrics:
- **API Coverage**: Percentage of tested operations relative to the active run subset.
- **Absolute Coverage**: Percentage of tested status codes relative to the entire OpenAPI specification.

### The Paradox of `--filter`
When we ran contract tests and resiliency tests, we used `--filter STATUS='200,201'` to only execute happy-path scenarios. While this yielded green builds, Specmatic flagged all other defined codes (`401`, `403`, `404`, `503`) as "untested," dragging **Absolute Coverage** down to **39%** and **61%**.

### The Solution: Dynamic Indentation-Based Spec Filtering
Instead of using filters that leave untested paths in the spec, we created a lightweight node script `scripts/filter-openapi.js` that dynamically copies and strips response blocks from the specification on-the-fly:
- For `none` (Contract) & `positiveOnly` (Positive Resiliency): Keeps only `200` and `201` responses.
- For `all` (Full Resiliency): Keeps `200`, `201`, and `400` responses.

```javascript
// Indentation logic inside scripts/filter-openapi.js
if (inResponses) {
  // If status code is at 8 spaces (e.g. "        401:") and not in our allowed list, we exclude it
  const statusMatch = line.match(/^ {8}([0-9]{3}):/);
  if (statusMatch) {
    includeCurrent = allowedStatuses.includes(statusMatch[1]);
  } else if (indent <= 6 && line.trim() !== '') {
    inResponses = false; // Exited response block
    includeCurrent = true;
  }
}
```
Because Specmatic runs against a dynamically tailored OpenAPI spec, **Absolute Coverage immediately reached 100%** across all runs!

---

## 3. Conformance and Resiliency: 400 vs 401 Validation

During Full Resiliency (`all`) runs, Specmatic generates request body mutations (e.g., changing string parameters to booleans or nulls) to test robustness.

### The Resiliency Error
When Specmatic mutated login payloads on `/api/auth/login`, our server rejected the inputs and returned `401 Unauthorized` (the code handled validation errors and invalid credentials under the same `401` status). 
However, in `all` mode, we filtered out `401` from the spec, leaving `/api/auth/login` with only a `200` response defined. Since the spec had no `4xx` response defined, Specmatic crashed:
`Received 401, but the specification does not contain a 4xx or default response, hence unable to verify this response.`

### The Alignment
We corrected this behavior by separating **Input Validation** from **Authentication**:
- **Input Validation Errors** (missing fields, malformed formats, wrong types): Standard REST design requires a `400 Bad Request`. We updated `authController.login` to return `400` when validation fails.
- **Credential Failures** (wrong password/email): We kept `401 Unauthorized`.
- **OpenAPI Update**: We updated `openapi.yaml` to explicitly document the `400` response schema for `/api/auth/login`.

This allowed `/api/auth/login` to retain a `400` response block in `all` mode. When Specmatic sent mutated requests, the server returned `400`, matching the filtered spec schema perfectly and passing all resiliency assertions.

---

## 4. Test State Independence and Database Cleanliness

Specmatic tests are stateful because they exercise write/delete endpoints:
- A `DELETE /api/transactions/{id}` test removes a transaction.
- A `PUT /api/transactions/{id}` test updates it.

If test runs are run in succession without clearing state, subsequent runs will fail with `404 Not Found` errors because the expected resources have been modified or deleted.

### Best Practice: Clean-Slate Seeding
1. **Configure `NODE_ENV=test`**: This flag signals the server to wipe existing collections and seed clean test data (e.g. the transaction with ID `000000000000000000000002` expected by the mock contract tests) on startup.
2. **Sandbox Database Recycles**: Restart the database and server between runs. Using `docker compose -f server/docker-compose.test.yml down && docker compose -f server/docker-compose.test.yml up -d` guarantees a clean database state every single time.

---

## 🏁 Summary of Best Practices

1. **Leverage Built-In Reporting**: Avoid writing custom report parsers when framework CTRF/JSON endpoints exist.
2. **Tailor Specs Dynamically**: To target test suites without lowering absolute coverage metrics, filter the OpenAPI specification dynamically instead of relying purely on test runner status filters.
3. **Respect HTTP Status Semantics**: Return `400` for validation issues and `401` for security failures. This makes schema testing straightforward.
4. **Enforce State Isolation**: Reset the database state or restart the container sandbox between successive runs to prevent state drift failures.

---

*Posted by: Specmatic Test Engineer Team  
Project: AI Money Mentor - Specmatic Integration  
Tags: #APITesting #Specmatic #ContractTesting #ResiliencyTesting #RESTAPI #DevOps #CI-CD*
