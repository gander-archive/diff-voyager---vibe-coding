# Changelog

## [0.1.24](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.23...diff-voyager-backend-v0.1.24) (2026-01-31)


### Bug Fixes

* **deps:** downgrade Fastify to v4 for @ts-rest/fastify compatibility ([158dc0c](https://github.com/gander-tools/diff-voyager/commit/158dc0ceb739f0ca8e5780c8bfcde57e759a590f))
* **tests:** increase timeout for large image visual comparator tests ([8b422c7](https://github.com/gander-tools/diff-voyager/commit/8b422c7f697e862681110931ad0f6c89b3fc7868))

## [0.1.23](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.22...diff-voyager-backend-v0.1.23) (2026-01-26)


### Bug Fixes

* **tests:** correct test expectations to match actual implementation ([f440bc5](https://github.com/gander-tools/diff-voyager/commit/f440bc59a4bb555fa7f4258c0fc8077d357b693a))
* **tests:** replace insecure HTTP URL with HTTPS in CSP test ([9b2c67b](https://github.com/gander-tools/diff-voyager/commit/9b2c67bbf0ae710acaee04e735252afe9b167a61))

## [0.1.22](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.21...diff-voyager-backend-v0.1.22) (2026-01-14)


### Bug Fixes

* **backend:** prevent UNIQUE constraint violation on duplicate snapshot creation ([b4a3720](https://github.com/gander-tools/diff-voyager/commit/b4a372036a95c13543accbec4181288250db3c22))


### Performance Improvements

* **backend:** add database indexes for query optimization ([27f3d42](https://github.com/gander-tools/diff-voyager/commit/27f3d4227fa644b4bfe65ba8da259080a6d2a9d5))

## [0.1.21](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.20...diff-voyager-backend-v0.1.21) (2026-01-14)


### Bug Fixes

* **backend:** add missing RuleScope and RuleCondition imports ([6e65a5e](https://github.com/gander-tools/diff-voyager/commit/6e65a5e4b8cbb8afd6456725866ab0acd90ef6f7))
* **backend:** configure CORS to allow frontend requests ([bc28a10](https://github.com/gander-tools/diff-voyager/commit/bc28a1023d918835f46e29589e11ecadba150a34))

## [0.1.20](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.19...diff-voyager-backend-v0.1.20) (2026-01-14)


### Features

* **backend:** add rules database schema and migration ([eafa1be](https://github.com/gander-tools/diff-voyager/commit/eafa1be4395749508384ffbe96e213328fc2922b))
* **backend:** implement rules API route handlers ([bbbd830](https://github.com/gander-tools/diff-voyager/commit/bbbd830fd15885e7e26ea84376ddc8bbd8cbe365))


### Bug Fixes

* **backend:** add missing pino-pretty dependency for logger ([69e3013](https://github.com/gander-tools/diff-voyager/commit/69e3013a9b28dd3b88e78503ad562714e1677146))
* **ci:** resolve Biome lint errors in Rules implementation ([270116b](https://github.com/gander-tools/diff-voyager/commit/270116b5b51950a0833de4946f19c3c4898ac720))

## [0.1.19](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.18...diff-voyager-backend-v0.1.19) (2026-01-11)


### Features

* **backend:** implement [@ts-rest](https://github.com/ts-rest) handlers for artifacts endpoints ([2777a1a](https://github.com/gander-tools/diff-voyager/commit/2777a1a64b52c322662c8050a5b776f8558f92e2))

## [0.1.18](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.17...diff-voyager-backend-v0.1.18) (2026-01-11)


### Features

* **backend:** add CaptureLogger utility for comprehensive page capture diagnostics ([a5db43a](https://github.com/gander-tools/diff-voyager/commit/a5db43a27c0a933ceb3f0bb9b973348342c4db6b))
* **backend:** integrate CaptureLogger into page capture pipeline ([5eef516](https://github.com/gander-tools/diff-voyager/commit/5eef5168e44e42e06b9233ef38a68d0f593e7f06))


### Bug Fixes

* **backend:** organize Swagger routes with proper tags using onRoute hook ([317ce22](https://github.com/gander-tools/diff-voyager/commit/317ce22d84e8f2ead99c485aa78b94afa592eaf1))

## [0.1.17](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.16...diff-voyager-backend-v0.1.17) (2026-01-11)


### Features

* **backend:** add retry functionality for snapshots and runs ([f2cbed7](https://github.com/gander-tools/diff-voyager/commit/f2cbed7802635ad332c429cc32d1f5b5d3080832))
* **backend:** add separate log level configuration for console and file ([43a1388](https://github.com/gander-tools/diff-voyager/commit/43a1388a7e11e448453fb00a5290144bcc024585))


### Bug Fixes

* **backend,frontend:** fix re-scan not starting and incorrect status codes ([f7d072b](https://github.com/gander-tools/diff-voyager/commit/f7d072b56f8f1687f9c10aeed1363e8a4ae62da3))
* **backend:** add disableLogging option for tests ([d26c456](https://github.com/gander-tools/diff-voyager/commit/d26c456594da7782374cc27caf84431771577ec9))
* **backend:** add disableLogging to all integration tests ([ddb9dc9](https://github.com/gander-tools/diff-voyager/commit/ddb9dc91b0074d2591acf69e8795a7565130e3d2))
* resolve Biome lint errors in retry functionality ([fb5cb75](https://github.com/gander-tools/diff-voyager/commit/fb5cb75275f76e5ec554936bfbfca37e96f1010a))

## [0.1.16](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.15...diff-voyager-backend-v0.1.16) (2026-01-09)


### Bug Fixes

* **backend:** add ES module support and resolve TypeScript errors ([85d98e5](https://github.com/gander-tools/diff-voyager/commit/85d98e5ced2aa740ac114f0f6f1f7226c45d627a))

## [0.1.15](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.14...diff-voyager-backend-v0.1.15) (2026-01-09)


### Bug Fixes

* **backend:** add CORS support for frontend development ([f9d2b68](https://github.com/gander-tools/diff-voyager/commit/f9d2b6893565199af83888b6158ab6ebf478e62d))

## [0.1.14](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.13...diff-voyager-backend-v0.1.14) (2026-01-09)


### Features

* **backend:** implement project deletion with cascade ([f18b147](https://github.com/gander-tools/diff-voyager/commit/f18b147c630a47d27d029e8232dac7296b452848))

## [0.1.13](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.12...diff-voyager-backend-v0.1.13) (2026-01-09)


### Features

* **backend:** add missing [@ts-rest](https://github.com/ts-rest) endpoints and fix field names ([9ea8f9d](https://github.com/gander-tools/diff-voyager/commit/9ea8f9d9b89583356f742a8b4a4cc8d11df29c2c))
* **backend:** install @ts-rest/fastify for type-safe route handlers ([ce20834](https://github.com/gander-tools/diff-voyager/commit/ce208341f312e2c267a566e20cfa4b78ba035658))
* **backend:** integrate @ts-rest/fastify route handlers ([07cef30](https://github.com/gander-tools/diff-voyager/commit/07cef30b9879f7030808555653f9da9b7744a88e))


### Bug Fixes

* **backend:** fix multiple-runs tests with proper drizzleDb ([0b8f99b](https://github.com/gander-tools/diff-voyager/commit/0b8f99b7bab2a28079ce02ea5e40cd5fa1c7000f))
* **backend:** fix page-details tests with proper drizzleDb ([484a646](https://github.com/gander-tools/diff-voyager/commit/484a6467c4d4f5919a755ed736f2ef75d299e08a))
* **backend:** fix page-diff tests with proper drizzleDb ([2f61342](https://github.com/gander-tools/diff-voyager/commit/2f61342ce0b3d7401afd9f2d45c0e3e47432bda8))
* **backend:** fix project-details tests with proper drizzleDb ([81a9613](https://github.com/gander-tools/diff-voyager/commit/81a9613afbb185228961ace0c16ca38cb6431753))
* **backend:** fix project-list tests with proper drizzleDb ([9dea55c](https://github.com/gander-tools/diff-voyager/commit/9dea55c35b280edd99ae49ffe83e4442c235c46e))
* **backend:** fix project-runs-list tests with proper drizzleDb ([78a24d6](https://github.com/gander-tools/diff-voyager/commit/78a24d6cdfb30175fa9e9e6bff8d2e9d43ce3c5d))
* **backend:** fix run-details tests with proper drizzleDb ([540416e](https://github.com/gander-tools/diff-voyager/commit/540416eedf7a20a003c01e7456e908f96a393fe0))
* **backend:** fix run-pages-list tests with proper drizzleDb ([66783f9](https://github.com/gander-tools/diff-voyager/commit/66783f9d432c89954786dd7bad68c4db0f1b5187))
* **backend:** fix scan-endpoints tests with proper drizzleDb ([18544c3](https://github.com/gander-tools/diff-voyager/commit/18544c34c24029afecc1b0cb4a7d46f683d8d613))
* **backend:** fix task-status tests with proper drizzleDb ([a940c4f](https://github.com/gander-tools/diff-voyager/commit/a940c4f63feb7ec709b3c2cb230bd4a650d2d7ea))
* **backend:** use Drizzle repository implementations in [@ts-rest](https://github.com/ts-rest) routes ([1e25bfa](https://github.com/gander-tools/diff-voyager/commit/1e25bfabdac718b4fbd1e644c3312049e8e1109a))
* **shared:** use z.coerce for query parameters in API contract ([24d1392](https://github.com/gander-tools/diff-voyager/commit/24d139229d40863c6791b2ebae06ed44344440fa))

## [0.1.12](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.11...diff-voyager-backend-v0.1.12) (2026-01-08)


### Features

* **backend:** implement HAR file collection in PageCapturer (GREEN phase) ([e7f0e72](https://github.com/gander-tools/diff-voyager/commit/e7f0e72c05df4baebd8f29e91444fb66a43a6077))


### Bug Fixes

* **backend:** conditionally return artifact URLs in Pages endpoint ([a2f9733](https://github.com/gander-tools/diff-voyager/commit/a2f9733a49edd0982a0d8ec00ae135f712de17ff))

## [0.1.11](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.10...diff-voyager-backend-v0.1.11) (2026-01-08)


### Features

* **ci:** add test coverage reporting for all packages ([a8bd155](https://github.com/gander-tools/diff-voyager/commit/a8bd1554c016bb396f25e2784e9bf14bac418238))


### Bug Fixes

* **api:** add additionalProperties to scan endpoint schemas ([5a8dee1](https://github.com/gander-tools/diff-voyager/commit/5a8dee155e645a2fe3097ca9d7213ddd78359bf5))
* **api:** fix project details endpoint statistics and schema issues ([46599e1](https://github.com/gander-tools/diff-voyager/commit/46599e18c93cdc55f929be14604ebc4749352ce0))
* make capturedAt optional in CreateSnapshotInput with default value ([9927880](https://github.com/gander-tools/diff-voyager/commit/99278808f1d11af4726467a885976079ac851f62))
* **security:** complete tmpdir() replacement and remove unused imports ([2da5365](https://github.com/gander-tools/diff-voyager/commit/2da5365ca97df6d6970bf684e6b75fafc689730b))
* **security:** use tmp library for secure temporary file creation in artifacts-endpoint test ([715d5c3](https://github.com/gander-tools/diff-voyager/commit/715d5c3f5e863f34631e7255c043992017eadce8))
* **security:** use tmp library in project-details-endpoint test ([5475eb0](https://github.com/gander-tools/diff-voyager/commit/5475eb097b21ba06ccffa3fd97e4492ccdc81abc))
* **security:** use tmp library in remaining integration/api tests ([7651a8a](https://github.com/gander-tools/diff-voyager/commit/7651a8af8649cd7220a73f5ecb42c264b8f94488))
* **security:** use tmp library in scan-endpoints test ([2e9c0a5](https://github.com/gander-tools/diff-voyager/commit/2e9c0a5e5c8d17816cbcc16801fec14be0480be7))
* **security:** use tmp library in unit tests and test helpers ([ea7714b](https://github.com/gander-tools/diff-voyager/commit/ea7714bd7dc8e6dffe7c6687867d0d516d91f344))
* update scan-processor test to match graceful error handling ([0f7e73f](https://github.com/gander-tools/diff-voyager/commit/0f7e73fcb0b573e17ac6b64233a75f1b7ec311c8))

## [0.1.10](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.9...diff-voyager-backend-v0.1.10) (2026-01-08)


### Bug Fixes

* **deps:** update dependency drizzle-orm to ^0.45.0 ([55b96cf](https://github.com/gander-tools/diff-voyager/commit/55b96cfd5513bce0c9eadc1a9fef0852b2ef90a3))

## [0.1.9](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.8...diff-voyager-backend-v0.1.9) (2026-01-08)


### Features

* **backend:** create Drizzle DB helper and test utilities ([d6f5c68](https://github.com/gander-tools/diff-voyager/commit/d6f5c681259e7458df78886e913253a6ac24cb9a))
* **backend:** define Drizzle schemas for all tables ([f9a1197](https://github.com/gander-tools/diff-voyager/commit/f9a1197331e96fc0d05d47f3234e421a90e9979c))
* **backend:** implement DiffRepository with Drizzle ORM - FINAL MIGRATION ([e251db1](https://github.com/gander-tools/diff-voyager/commit/e251db19c176e11fef1bbd0a7073b03c92bb8b7d))
* **backend:** implement PageRepository with Drizzle ORM ([69c9afd](https://github.com/gander-tools/diff-voyager/commit/69c9afd2842196a57a6bca834ac858604ea5d53e))
* **backend:** implement ProjectRepository with Drizzle ORM ([a956875](https://github.com/gander-tools/diff-voyager/commit/a956875f0a292f3c84be0ea46d72823bc273bb66))
* **backend:** implement RunRepository with Drizzle ORM ([8d5d097](https://github.com/gander-tools/diff-voyager/commit/8d5d097773342d20f26b5bc2a18c855bc5f123c4))
* **backend:** implement SnapshotRepository with Drizzle ORM ([f2d9207](https://github.com/gander-tools/diff-voyager/commit/f2d9207a8bfbf4bd6b83ae57fd29baeb4da02822))
* **backend:** implement TaskQueue with Drizzle ORM ([acc61d9](https://github.com/gander-tools/diff-voyager/commit/acc61d9a3a3e713e98bf53e97ffe8ca05246bd39))

## [0.1.8](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.7...diff-voyager-backend-v0.1.8) (2026-01-07)


### Features

* **api:** implement GET /pages/:pageId endpoint (partial) ([54a6ce8](https://github.com/gander-tools/diff-voyager/commit/54a6ce8994e1c1493fc46cc44f1c7a8331c211f3))
* **api:** implement GET /pages/:pageId/diff endpoint ([8004c0b](https://github.com/gander-tools/diff-voyager/commit/8004c0b89aa99f6e72ef802a43677018f5cc5ee6))
* **api:** implement GET /projects endpoint with pagination ([ab528fc](https://github.com/gander-tools/diff-voyager/commit/ab528fcb7f3c10206860470ed00e64b69e6e684f))
* **api:** implement GET /projects/:projectId/runs endpoint ([1f60303](https://github.com/gander-tools/diff-voyager/commit/1f60303ea1a369696af9786425ad691935a3ccb8))
* **api:** implement GET /runs/:runId endpoint ([d789956](https://github.com/gander-tools/diff-voyager/commit/d789956623e3ef61043bcae5b757ea716ad5063b))
* **api:** implement GET /runs/:runId/pages endpoint with filtering ([3631790](https://github.com/gander-tools/diff-voyager/commit/3631790bd9d11307fb95392ccae2be6ce42661a4))
* **api:** implement GET /tasks/:taskId endpoint ([2014cab](https://github.com/gander-tools/diff-voyager/commit/2014cabf64cb7f62cf0f1f5ea615ec5b5654ff79))

## [0.1.7](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.6...diff-voyager-backend-v0.1.7) (2026-01-07)


### Features

* **backend:** integrate Crawlee for multi-page URL discovery ([67083d7](https://github.com/gander-tools/diff-voyager/commit/67083d7da9e1f7486db42eb03f0b8fa86b3efcfa))


### Bug Fixes

* **security:** restrict file permissions for artifact storage ([12c1bf2](https://github.com/gander-tools/diff-voyager/commit/12c1bf22fd1ee1e442ea1e3e8e665af932f37639))

## [0.1.6](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.5...diff-voyager-backend-v0.1.6) (2026-01-07)


### Features

* **backend:** add task timestamps for created, started, and completed events ([516bd80](https://github.com/gander-tools/diff-voyager/commit/516bd8021803aa361aa28d88c98c1757af383e3c))
* **crawler:** add browser manager for browser instance pooling ([6f04453](https://github.com/gander-tools/diff-voyager/commit/6f044530b0d7a4ce998b1044acbfb02fb63c4cd8))
* **crawler:** add Phase 3 crawler types and interfaces ([9cfc148](https://github.com/gander-tools/diff-voyager/commit/9cfc14893d867de2f48d87b3cbd69b1208e1e8f0))
* **crawler:** add single page processor with TDD tests ([246a7b3](https://github.com/gander-tools/diff-voyager/commit/246a7b3edd08ccf7538b9169e3582b357412773e))
* **crawler:** implement Crawlee-based site crawler ([43671d9](https://github.com/gander-tools/diff-voyager/commit/43671d96925e7922409ce82488bbdce9133f8e8d))


### Bug Fixes

* **backend:** add undefined checks for baseline and diff image buffers ([37aac9c](https://github.com/gander-tools/diff-voyager/commit/37aac9c595b45c549dfb6220b26206e1d21004ce))
* **storage:** update SnapshotRepository to accept full snapshot data on creation ([03642fb](https://github.com/gander-tools/diff-voyager/commit/03642fbc0e70621b160d3c6307df6979b8ca6e4d))
* **tests:** add missing fullSeo HTML fixture for SEO extraction tests ([60e54d7](https://github.com/gander-tools/diff-voyager/commit/60e54d735020ab06fb4d316257cd30493871394b))
* **tests:** use seoData property name in single-page-processor tests ([5b501d9](https://github.com/gander-tools/diff-voyager/commit/5b501d99a7a5ccae49c491839b9cc9f2e009218a))

## [0.1.5](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.4...diff-voyager-backend-v0.1.5) (2026-01-07)


### Features

* **backend:** add Full Page Comparator orchestrating all comparison logic ([96f0b79](https://github.com/gander-tools/diff-voyager/commit/96f0b7944bac71a9d51a54031f5eaf40fbb218f2))
* **backend:** add Header Comparator for HTTP header change detection ([62f79a9](https://github.com/gander-tools/diff-voyager/commit/62f79a97733df5f4facd800b6f2769198d87cd2d))
* **backend:** add Performance Comparator for load time and size metrics ([72ff54e](https://github.com/gander-tools/diff-voyager/commit/72ff54e9824b89cf2c855abae7cf8b9ead8cf978))
* **backend:** add SEO Comparator for detecting SEO metadata changes ([30ea4c0](https://github.com/gander-tools/diff-voyager/commit/30ea4c077badad52606bd4517604b31a7728676d))
* **backend:** add Visual Comparator for screenshot pixel-by-pixel diff ([5d3c92f](https://github.com/gander-tools/diff-voyager/commit/5d3c92f16e00e9b4740114da51fd45608ad6917b))

## [0.1.4](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.3...diff-voyager-backend-v0.1.4) (2026-01-07)


### Features

* **backend:** add support for multiple comparison runs per project ([fd5e079](https://github.com/gander-tools/diff-voyager/commit/fd5e079a9add2b506d50869d7f047248c36a6ec7))
* **backend:** add task queue table migration and types ([a92dc7d](https://github.com/gander-tools/diff-voyager/commit/a92dc7d3ac9fe0284bc98a2f51608b9f599db341))
* **backend:** implement PageTaskQueue for batch operations ([26ec8cb](https://github.com/gander-tools/diff-voyager/commit/26ec8cb612e57d198262e9253b2485dea91fb3ba))
* **backend:** implement retry logic and stale task recovery ([e7a49df](https://github.com/gander-tools/diff-voyager/commit/e7a49dff1a74f2f5d680700455159d990025ee4c))
* **backend:** implement TaskProcessor and progress tracking ([0da285d](https://github.com/gander-tools/diff-voyager/commit/0da285dcd4ed9ef3abc1efabee1fe296f1e5a7b3))
* **backend:** implement TaskQueue.complete() and fail() methods ([c9b697e](https://github.com/gander-tools/diff-voyager/commit/c9b697ef71a6585ff1adfb3e005c58e93cfc3df4))
* **backend:** implement TaskQueue.dequeue() method ([70451d1](https://github.com/gander-tools/diff-voyager/commit/70451d1f8ab3df0f281c03237b15a9cdf630014b))
* **backend:** implement TaskQueue.enqueue() method ([d6a58cf](https://github.com/gander-tools/diff-voyager/commit/d6a58cfe7e1a9c4b2374c0061b97f5fc383cc1c1))


### Bug Fixes

* **backend:** resolve Biome lint issues in queue implementation ([17fa1a5](https://github.com/gander-tools/diff-voyager/commit/17fa1a5e33555a52b2dc94f1394ca40955baed21))

## [0.1.3](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.2...diff-voyager-backend-v0.1.3) (2026-01-07)


### Bug Fixes

* **tests:** use PLAYWRIGHT_AVAILABLE for conditional test skipping ([#63](https://github.com/gander-tools/diff-voyager/issues/63)) ([9c947e7](https://github.com/gander-tools/diff-voyager/commit/9c947e7d68c52828f23e42839cbce6075f71163e))

## [0.1.2](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.1...diff-voyager-backend-v0.1.2) (2026-01-07)


### Features

* **backend:** add Swagger UI for API documentation ([e7754e0](https://github.com/gander-tools/diff-voyager/commit/e7754e0eb6e6c3126c7370eff1c612edf274e92a))
* **backend:** implement minimal API structure ([#46](https://github.com/gander-tools/diff-voyager/issues/46)) ([90ee11b](https://github.com/gander-tools/diff-voyager/commit/90ee11b65770a9f4764227926925c3494e8344e9))
* **config:** configure Biome for monorepo structure ([a2befa0](https://github.com/gander-tools/diff-voyager/commit/a2befa0f1d27a50a373fcc49a352b32311289739))


### Bug Fixes

* **deps:** update dependency better-sqlite3 to v12 ([519bb4c](https://github.com/gander-tools/diff-voyager/commit/519bb4c299a03a7aa745e276b19dedddfb3c0390))
* **lint:** fix TypeScript any type and unused variables ([7403d7a](https://github.com/gander-tools/diff-voyager/commit/7403d7a2dcdbcecd3303457539f377dfb5b41d44))
* **tests:** prefix unused PLAYWRIGHT_AVAILABLE with underscore ([085851c](https://github.com/gander-tools/diff-voyager/commit/085851c5eeee0b1de8eef5fda58708b5a5583c71))

## [0.1.1](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-backend-v0.1.0...diff-voyager-backend-v0.1.1) (2026-01-05)


### Bug Fixes

* **deps:** update dependency pixelmatch to v7 ([02b6f2e](https://github.com/gander-tools/diff-voyager/commit/02b6f2e0c1e4f4617f15e3909312b984f366ff6d))

## 0.1.0 (2026-01-05)


### Features

* **shared:** add README with package overview and usage ([#30](https://github.com/gander-tools/diff-voyager/issues/30)) ([2612d8a](https://github.com/gander-tools/diff-voyager/commit/2612d8a40380e8b54941ecb183c909a063fd438e))
