# oRPC Evaluation Report - Issue #349

**Date:** 2026-01-29
**Status:** Complete
**Recommendation:** Monitor both options, prepare for potential migration

## Executive Summary

The concern raised in issue #349 is **valid**. @ts-rest has been inactive for approximately **8 months** (last commit: June 2, 2025). However, oRPC currently lacks a dedicated Fastify adapter, which is a critical blocker for immediate migration.

**Recommendation:** Stay with @ts-rest short-term while actively monitoring oRPC for Fastify support. Begin planning for potential migration if @ts-rest remains unmaintained.

---

## 1. Current @ts-rest Usage Catalog

### Dependencies

| Package | Dependency | Version |
|---------|-----------|---------|
| shared | `@ts-rest/core` | ^3.52.1 |
| backend | `@ts-rest/fastify` | ^3.52.1 |
| frontend | `@ts-rest/core` | ^3.52.1 |

### Key Integration Points

**Shared Package (`packages/shared/src/api-contract.ts`)**
- ~700 lines of API contract definition
- 22+ endpoints defined using `initContract()`
- 40+ Zod schemas for validation
- Custom metadata for rate limiting and content types

**Backend Package (`packages/backend/src/api/routes-ts-rest.ts`)**
- ~1,440 lines of Fastify route handlers using `initServer()`
- Full CRUD operations for: scans, projects, runs, pages, rules, artifacts
- Integration with Swagger via metadata

**Frontend Package**
- `client.ts` - tsRestClient initialization with custom fetch/retry logic
- `projects.ts`, `runs.ts`, `pages.ts`, `rules.ts` - Type-safe API services
- Direct Pinia store integration

### Features Currently Used

1. **Contract-first design** with Zod validation
2. **Path parameters** (`/projects/:projectId`)
3. **Query parameters** with coercion (`z.coerce.number()`)
4. **Multiple response status codes** (200, 202, 400, 404)
5. **Binary responses** (screenshots, diff images)
6. **Custom metadata** (rate limiting, content-type headers)
7. **Swagger/OpenAPI generation** via route metadata

---

## 2. Feature Comparison

| Feature | @ts-rest | oRPC |
|---------|----------|------|
| **Fastify Adapter** | ✅ Dedicated `@ts-rest/fastify` | ❌ No adapter (Node.js HTTP only) |
| **Vue 3 Support** | ✅ Via `@ts-rest/core` | ⚠️ Via Pinia Colada (different pattern) |
| **Zod Integration** | ✅ Native | ✅ Native + Valibot, ArkType |
| **OpenAPI Generation** | ✅ Via metadata + @fastify/swagger | ✅ Built-in automatic |
| **Maturity** | ⚠️ 194 releases, but inactive 8 months | ✅ v1.0 Dec 2025, active development |
| **Contract-First** | ✅ Excellent | ✅ Excellent |
| **Binary Responses** | ✅ Working | ❓ Unknown/undocumented |
| **Active Maintenance** | ❌ Last commit: June 2, 2025 | ✅ Active |

### oRPC Advantages

- **Active development** (critical differentiator)
- Automatic OpenAPI spec generation (no manual metadata)
- Support for multiple validation libraries
- Dual RPC/REST endpoint serving
- Modern architecture

### @ts-rest Advantages

- **Dedicated Fastify adapter** (critical for this project)
- Already fully integrated and tested
- No migration risk (short-term)
- Known, working solution

---

## 3. Proof-of-Concept Feasibility Assessment

### Migration Scope

| Component | Files Affected | Lines of Code | Effort |
|-----------|---------------|---------------|--------|
| API Contract | 1 | ~700 | HIGH |
| Backend Routes | 1 | ~1,440 | HIGH |
| Frontend Services | 5 | ~400 | MEDIUM |
| Integration Tests | 10+ | ~2,000+ | HIGH |
| Documentation | 5+ | ~500 | LOW |

### Critical Blocker

**oRPC lacks a Fastify adapter.** Migration options:
1. Write a custom Fastify adapter for oRPC
2. Migrate from Fastify to Express (major breaking change)
3. Use generic Node.js HTTP handler with Fastify (potential compatibility issues)

### PoC Recommendation

A proof-of-concept **could be valuable** to:
1. Test custom Fastify adapter feasibility
2. Verify binary response handling works
3. Measure actual migration effort

**Suggested scope:** Migrate 2-3 simple endpoints (e.g., `listProjects`, `getProject`) to oRPC with a custom Fastify wrapper.

---

## 4. Risk Evaluation

### Staying with @ts-rest Risks

| Risk | Severity | Likelihood | Impact |
|------|----------|------------|--------|
| Security vulnerability without fix | HIGH | MEDIUM | No patches available |
| Breaking changes in dependencies | MEDIUM | MEDIUM | Zod/Fastify updates may break |
| Feature stagnation | LOW | HIGH | No new features |
| Community abandonment | MEDIUM | MEDIUM | Less support available |

### Migration to oRPC Risks

| Risk | Severity | Likelihood | Impact |
|------|----------|------------|--------|
| No Fastify adapter | HIGH | CERTAIN | Requires custom solution |
| Breaking test suite | MEDIUM | HIGH | 20+ integration tests need rewrite |
| Binary response handling | MEDIUM | MEDIUM | May require workarounds |
| Learning curve | LOW | CERTAIN | New patterns for team |
| Bug introduction | MEDIUM | MEDIUM | New code = new bugs |

### Cost-Benefit Analysis

**Migration Cost:**
- Estimated effort: **4-7 weeks**
- Risk: Medium-High (Fastify adapter uncertainty)

**Staying Cost:**
- Short-term: Low (everything works)
- Long-term: Medium-High (unmaintained dependency risk)

---

## 5. Strategic Decision

### Recommendation: **Prepare for Migration**

Given the 8-month inactivity of @ts-rest, the project should:

### Immediate Actions (Next 2-4 weeks)

1. **Create a GitHub issue** to track oRPC Fastify adapter development
2. **Pin @ts-rest version** to prevent unexpected breaking changes
3. **Audit current @ts-rest features** used - document exactly what needs to work

### Short-term (1-3 months)

4. **Build a minimal PoC** with oRPC + custom Fastify handler for 2-3 endpoints
5. **Monitor oRPC releases** for official Fastify adapter
6. **Evaluate alternative: tRPC** as backup option (has Fastify adapter)

### Migration Trigger Conditions

Begin full migration when ANY of these occur:
- oRPC releases official Fastify adapter
- Security vulnerability discovered in @ts-rest
- @ts-rest reaches 12+ months of inactivity
- Critical dependency (Zod 4, Fastify 6) requires @ts-rest update that won't come

### Alternative Consideration: tRPC

If oRPC Fastify support doesn't materialize, consider **tRPC**:
- Has Fastify adapter (`@trpc/server/adapters/fastify`)
- More mature than oRPC
- Active development
- Similar contract-first approach
- Drawback: Less OpenAPI-focused

---

## 6. Summary

| Aspect | @ts-rest | oRPC | tRPC (backup) |
|--------|----------|------|---------------|
| Maintenance | ❌ Inactive 8mo | ✅ Active | ✅ Active |
| Fastify Support | ✅ Native | ❌ None | ✅ Native |
| Migration Effort | N/A | HIGH | MEDIUM |
| OpenAPI | ✅ Via metadata | ✅ Built-in | ⚠️ Via plugin |
| Recommendation | Short-term only | Monitor | Backup plan |

---

## Appendix: Sources

### @ts-rest Repository Activity

- **Last commit: June 2, 2025** (~8 months ago)
- Last release: v3.52.1
- Open issues: 105
- Source: [https://github.com/ts-rest/ts-rest](https://github.com/ts-rest/ts-rest)

### oRPC Documentation

- Official website: [https://orpc.dev/](https://orpc.dev/)
- GitHub: [https://github.com/unnoq/orpc](https://github.com/unnoq/orpc)
- v1.0 Announcement: [https://orpc.unnoq.com/blog/v1-announcement](https://orpc.unnoq.com/blog/v1-announcement)
- LogRocket comparison: [https://blog.logrocket.com/trpc-vs-orpc-type-safe-rpc/](https://blog.logrocket.com/trpc-vs-orpc-type-safe-rpc/)

---

*Report generated: January 29, 2026*
*Evaluation performed by: Claude Code Agent*
*Corrected: Initial analysis incorrectly stated @ts-rest was active*
