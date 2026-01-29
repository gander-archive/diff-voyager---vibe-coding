# tRPC Evaluation Report - Issue #349

**Date:** 2026-01-29
**Status:** Complete
**Recommendation:** **Migrate to tRPC** - viable alternative with Fastify support

## Executive Summary

tRPC is a **strong candidate** for replacing @ts-rest. Unlike oRPC, tRPC has:
- ✅ Official Fastify adapter
- ✅ Active development (last commit: **today, January 29, 2026**)
- ✅ OpenAPI support via `trpc-openapi` plugin
- ✅ Vue 3 integration via community packages

**Recommendation:** Plan migration to tRPC within the next 3-6 months.

---

## 1. tRPC Activity Status

| Metric | Value |
|--------|-------|
| **Last commit** | January 29, 2026 (today!) |
| **Open issues** | 154 |
| **Maintenance** | ✅ Very active |
| **Maturity** | ✅ Established (since 2020) |

Recent commits (last 5 days):
- Jan 29: dependency updates (@actions/core v3)
- Jan 28: @clack/prompts update, react-dom optional peer dep
- Jan 27: @actions/github v9, @oxc-project/runtime update

---

## 2. Feature Comparison

| Feature | @ts-rest (current) | tRPC | oRPC |
|---------|-------------------|------|------|
| **Maintenance** | ❌ Inactive 8 months | ✅ Active (today!) | ✅ Active |
| **Fastify Adapter** | ✅ Native | ✅ Official | ❌ None |
| **Vue 3 Support** | ✅ Direct | ⚠️ Community packages | ⚠️ Pinia Colada |
| **Zod Integration** | ✅ Native | ✅ Native | ✅ Native |
| **OpenAPI** | ✅ Via metadata | ✅ Via trpc-openapi | ✅ Built-in |
| **Contract-First** | ✅ Excellent | ⚠️ Code-first | ✅ Excellent |
| **Binary Responses** | ✅ Working | ✅ Supported | ❓ Unknown |

---

## 3. tRPC Technical Details

### 3.1 Fastify Adapter

Official adapter: `@trpc/server/adapters/fastify`

```typescript
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastify from 'fastify';

const server = fastify({ maxParamLength: 5000 });

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
});
```

**Requirements:**
- Fastify ≥ 3.11.0
- WebSocket support via `@fastify/websocket`

### 3.2 Vue 3 Integration

Community packages available:
- [`@colonel-sandvich/trpc-vue-query`](https://www.npmjs.com/package/@colonel-sandvich/trpc-vue-query) - TanStack Query bridge
- [`trpc-vue-query`](https://github.com/falcondev-oss/trpc-vue-query) - Type-safe composables
- [`usetrpc`](https://github.com/michealroberts/usetrpc) - Vue 3 composables (WIP)

**Note:** Vue ecosystem is less mature than React, but functional packages exist.

### 3.3 OpenAPI Generation

Via [`trpc-openapi`](https://github.com/trpc/trpc-openapi):

```typescript
import { createOpenApiHttpHandler } from 'trpc-openapi';
import { generateOpenApiDocument } from 'trpc-openapi';

// Generate OpenAPI spec
const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Diff Voyager API',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000',
});

// Expose REST endpoints
app.use('/api', createOpenApiHttpHandler({ router: appRouter }));
```

**Supports:** Express, Next.js, Fastify, Serverless, Node:HTTP

---

## 4. Migration Scope Assessment

### 4.1 Code Changes Required

| Component | Current (@ts-rest) | Target (tRPC) | Effort |
|-----------|-------------------|---------------|--------|
| **API Contract** | `initContract()` | `initTRPC.create()` | HIGH |
| **Backend Routes** | `s.router(contract, {...})` | `t.router({...})` | HIGH |
| **Frontend Client** | `initClient(contract)` | `trpc.useQuery()` / `client.query()` | MEDIUM |
| **Validation** | Zod schemas | Zod schemas (same!) | LOW |
| **OpenAPI** | Metadata + Swagger | trpc-openapi plugin | MEDIUM |

### 4.2 Key Differences

**Contract Definition:**
```typescript
// @ts-rest (current)
const contract = c.router({
  getProject: {
    method: 'GET',
    path: '/projects/:id',
    responses: { 200: projectSchema },
  }
});

// tRPC (target)
const appRouter = t.router({
  getProject: t.procedure
    .input(z.object({ id: z.string() }))
    .output(projectSchema)
    .query(({ input }) => { /* handler */ }),
});
```

**Client Usage:**
```typescript
// @ts-rest (current)
const result = await client.getProject({ params: { id } });

// tRPC (target)
const result = await trpc.getProject.query({ id });
// or with Vue Query:
const { data } = useQuery(['project', id], () => trpc.getProject.query({ id }));
```

### 4.3 Migration Effort Estimate

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Phase 1: Setup** | Install deps, configure tRPC + Fastify | 2-3 days |
| **Phase 2: Backend** | Migrate 22+ endpoints | 1-2 weeks |
| **Phase 3: Frontend** | Migrate 5 services + stores | 1 week |
| **Phase 4: OpenAPI** | Configure trpc-openapi + Swagger | 2-3 days |
| **Phase 5: Tests** | Update 20+ integration tests | 1 week |
| **Phase 6: Polish** | Bug fixes, documentation | 3-5 days |
| **Total** | | **4-6 weeks** |

---

## 5. Risk Evaluation

### 5.1 Migration Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Vue integration maturity | MEDIUM | MEDIUM | Use proven `trpc-vue-query` package |
| Code-first vs contract-first | LOW | CERTAIN | Acceptable trade-off |
| Binary response handling | LOW | LOW | tRPC supports Buffers |
| Test suite breakage | MEDIUM | HIGH | Incremental migration |
| Learning curve | LOW | CERTAIN | Good documentation |

### 5.2 Staying with @ts-rest Risks

| Risk | Severity | Likelihood | Impact |
|------|----------|------------|--------|
| Security vulnerability | HIGH | MEDIUM | No patches for 8+ months |
| Dependency conflicts | MEDIUM | MEDIUM | Zod 4, Fastify updates |
| Community abandonment | MEDIUM | HIGH | Less help available |
| Feature stagnation | LOW | CERTAIN | No improvements |

### 5.3 Risk Comparison

| Aspect | Stay with @ts-rest | Migrate to tRPC |
|--------|-------------------|-----------------|
| Short-term risk | LOW | MEDIUM |
| Long-term risk | HIGH | LOW |
| Effort | None | 4-6 weeks |
| Future-proofing | ❌ Poor | ✅ Good |

---

## 6. Strategic Recommendation

### Decision: **Migrate to tRPC**

### Rationale

1. **Active maintenance** - tRPC commits daily vs @ts-rest inactive 8 months
2. **Official Fastify adapter** - No custom adapter needed (unlike oRPC)
3. **OpenAPI support** - Via mature `trpc-openapi` plugin
4. **Zod compatibility** - Same validation library, minimal schema changes
5. **Acceptable effort** - 4-6 weeks is reasonable for long-term stability

### Migration Plan

#### Phase 1: Preparation (Week 1)
- [ ] Install tRPC packages
- [ ] Set up parallel tRPC router alongside @ts-rest
- [ ] Migrate 2-3 simple endpoints as PoC
- [ ] Verify Fastify integration works

#### Phase 2: Backend Migration (Weeks 2-3)
- [ ] Migrate all 22+ endpoints incrementally
- [ ] Keep @ts-rest routes active during transition
- [ ] Update tests as endpoints migrate

#### Phase 3: Frontend Migration (Week 4)
- [ ] Install `@colonel-sandvich/trpc-vue-query`
- [ ] Migrate API services one by one
- [ ] Update Pinia stores

#### Phase 4: OpenAPI & Cleanup (Weeks 5-6)
- [ ] Configure `trpc-openapi` for REST endpoints
- [ ] Update Swagger documentation
- [ ] Remove @ts-rest dependencies
- [ ] Final testing and documentation

### Success Criteria

- [ ] All 22+ endpoints functional on tRPC
- [ ] All integration tests passing
- [ ] OpenAPI/Swagger documentation working
- [ ] Frontend type-safety maintained
- [ ] No regression in functionality

---

## 7. Comparison Summary

| Aspect | @ts-rest | tRPC | oRPC |
|--------|----------|------|------|
| **Recommendation** | ❌ Abandon | ✅ **Migrate** | ❌ Not ready |
| **Maintenance** | ❌ 8mo inactive | ✅ Daily commits | ✅ Active |
| **Fastify** | ✅ Yes | ✅ Yes | ❌ No |
| **Vue 3** | ✅ Direct | ⚠️ Community | ⚠️ Different |
| **OpenAPI** | ✅ Metadata | ✅ Plugin | ✅ Built-in |
| **Migration effort** | N/A | 4-6 weeks | Blocked |
| **Long-term viability** | ❌ Poor | ✅ Excellent | ✅ Good |

---

## Appendix: Sources

### tRPC
- GitHub: [https://github.com/trpc/trpc](https://github.com/trpc/trpc)
- Documentation: [https://trpc.io/docs](https://trpc.io/docs)
- Fastify adapter: [https://trpc.io/docs/server/adapters/fastify](https://trpc.io/docs/server/adapters/fastify)
- OpenAPI plugin: [https://github.com/trpc/trpc-openapi](https://github.com/trpc/trpc-openapi)

### Vue 3 Integration
- trpc-vue-query: [https://github.com/falcondev-oss/trpc-vue-query](https://github.com/falcondev-oss/trpc-vue-query)
- @colonel-sandvich/trpc-vue-query: [https://www.npmjs.com/package/@colonel-sandvich/trpc-vue-query](https://www.npmjs.com/package/@colonel-sandvich/trpc-vue-query)

### Comparisons
- tRPC vs OpenAPI: [https://medium.com/@Modexa/ship-faster-with-type-safe-apis-trpc-vs-openapi-9aa977b4331b](https://medium.com/@Modexa/ship-faster-with-type-safe-apis-trpc-vs-openapi-9aa977b4331b)
- trpc-openapi vs ts-rest: [https://catalins.tech/public-api-trpc/](https://catalins.tech/public-api-trpc/)

---

*Report generated: January 29, 2026*
*Evaluation performed by: Claude Code Agent*
