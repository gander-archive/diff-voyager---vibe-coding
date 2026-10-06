# Changelog

## [0.1.24](https://github.com/gander-tools/diff-voyager---vibe-coding/compare/diff-voyager-frontend-v0.1.23...diff-voyager-frontend-v0.1.24) (2026-10-06)


### Bug Fixes

* **deps:** update dependency vue-router to v5 ([02aedcc](https://github.com/gander-tools/diff-voyager---vibe-coding/commit/02aedcc8d980cb3f5cb0cfb7087ca6f45146f835))

## [0.1.23](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.22...diff-voyager-frontend-v0.1.23) (2026-02-01)


### Bug Fixes

* **tests:** replace explicit 'any' types with proper TypeScript types ([6ef3ca4](https://github.com/gander-tools/diff-voyager/commit/6ef3ca4e697451a7ccceba9c2ffd74e744e6ce85))

## [0.1.22](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.21...diff-voyager-frontend-v0.1.22) (2026-01-31)


### Bug Fixes

* **frontend:** add [@ts-expect-error](https://github.com/ts-expect-error) for i18n runtime vs TypeScript mismatch ([75cb1b1](https://github.com/gander-tools/diff-voyager/commit/75cb1b110da803a8df9b5ed40d062e8f09a3946c))
* **frontend:** add missing enum imports and fix type assertions in API services ([9eaf354](https://github.com/gander-tools/diff-voyager/commit/9eaf3549b5ad3059753feee508912bb5e77d044f))
* **frontend:** add type cast for HTMLInputElement in RulesListView tests ([0702a7d](https://github.com/gander-tools/diff-voyager/commit/0702a7d823042501f8211a6259cc3b162757dc8e))
* **frontend:** correct DiffSummary test expectation for empty changesByType ([f52fc32](https://github.com/gander-tools/diff-voyager/commit/f52fc320e8383563b8193eb95a8bb2aa307eec01))
* **frontend:** correct test expectations for RunProgress component ([b384f7f](https://github.com/gander-tools/diff-voyager/commit/b384f7f0d3ebd7eb18e3f521da23aa2b918a23eb))
* **frontend:** expose computed properties for testing in RunProgress ([18b23df](https://github.com/gander-tools/diff-voyager/commit/18b23df095de1941772aa5f198ba10007e678287))
* **frontend:** fix DiffSummary structure and add null checks in component tests ([19558ea](https://github.com/gander-tools/diff-voyager/commit/19558ea0804fe9c2d03640042359238e55a3ce5c))
* **frontend:** replace string literals with enum values in components ([b3e95aa](https://github.com/gander-tools/diff-voyager/commit/b3e95aaf484f326bfb4bcc6f5fcbc4c61afedb72))
* **frontend:** replace string literals with enums in rule tests ([f3d2a50](https://github.com/gander-tools/diff-voyager/commit/f3d2a50e28aa6e5dd24396dae9dd7e80ca21b134))
* **frontend:** use native enums in Zod validators for type safety ([01cb9f2](https://github.com/gander-tools/diff-voyager/commit/01cb9f2857003cf97911e7498944f278e0c6a651))

## [0.1.21](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.20...diff-voyager-frontend-v0.1.21) (2026-01-26)


### Bug Fixes

* **tests:** configure Pinia and Naive UI providers in accessibility tests ([0fbbd0c](https://github.com/gander-tools/diff-voyager/commit/0fbbd0cc633b0b4263fc4dd319b92717da1dd5d7))
* **tests:** mock useMessage in accessibility tests ([8660b9e](https://github.com/gander-tools/diff-voyager/commit/8660b9eee82c3a1d90471fe2b58508a1f265f590))

## [0.1.20](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.19...diff-voyager-frontend-v0.1.20) (2026-01-23)


### Bug Fixes

* **frontend:** add delete confirmation dialog to project list view ([531ca4b](https://github.com/gander-tools/diff-voyager/commit/531ca4b112733fb2a56bab0fbb8693ad00456036))
* **frontend:** add dialog provider wrapper to ProjectListView tests ([7d100d4](https://github.com/gander-tools/diff-voyager/commit/7d100d46a8988f49625b985f05a2371bebd1f2c9))

## [0.1.19](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.18...diff-voyager-frontend-v0.1.19) (2026-01-14)


### Bug Fixes

* **frontend:** correct project wizard stepper highlighting ([e1586db](https://github.com/gander-tools/diff-voyager/commit/e1586db66e0ecfdbfd0524f770ecf916cf825128))

## [0.1.18](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.17...diff-voyager-frontend-v0.1.18) (2026-01-14)


### Features

* **frontend:** add comprehensive tests for RuleCreateView and SettingsView (issue [#242](https://github.com/gander-tools/diff-voyager/issues/242)) ([91d523b](https://github.com/gander-tools/diff-voyager/commit/91d523b36d15a5690e5516a0cfe682cf1fd26f57))
* **frontend:** create rules API service ([9d69b44](https://github.com/gander-tools/diff-voyager/commit/9d69b444cc41bed457f9de1ef2ee997ad04162f5))
* **frontend:** implement RuleCard and RuleScopeBadge components ([06f5fd2](https://github.com/gander-tools/diff-voyager/commit/06f5fd2f81faafbad2323c2bc76fd57e34231737)), closes [#207](https://github.com/gander-tools/diff-voyager/issues/207)
* **frontend:** implement RuleConditionBuilder component ([#208](https://github.com/gander-tools/diff-voyager/issues/208)) ([4957f28](https://github.com/gander-tools/diff-voyager/commit/4957f28a5dbe07d073389127f6b8d7ba1a78f691))
* **frontend:** implement RuleCreateView ([873e5cd](https://github.com/gander-tools/diff-voyager/commit/873e5cd4df8915a9ce3bb308fcee127721f321d4)), closes [#204](https://github.com/gander-tools/diff-voyager/issues/204)
* **frontend:** implement RuleForm component ([#206](https://github.com/gander-tools/diff-voyager/issues/206)) ([e1d5c29](https://github.com/gander-tools/diff-voyager/commit/e1d5c29bba9c3222ee30c5e937e2f684cce115a3))
* **frontend:** implement RulesListView component ([0c673a0](https://github.com/gander-tools/diff-voyager/commit/0c673a094a411f67f8614b9c74f7931b5df6e195)), closes [#203](https://github.com/gander-tools/diff-voyager/issues/203)
* **frontend:** implement SettingsView component (issue [#205](https://github.com/gander-tools/diff-voyager/issues/205)) ([82fdae5](https://github.com/gander-tools/diff-voyager/commit/82fdae580e954c9f77af3b1be5bdd34f61361f41))
* **frontend:** integrate rules API with store ([9f98d61](https://github.com/gander-tools/diff-voyager/commit/9f98d61d45a2d2ed55403019013577ab147c7abc))


### Bug Fixes

* **ci:** resolve Biome lint errors in Rules implementation ([270116b](https://github.com/gander-tools/diff-voyager/commit/270116b5b51950a0833de4946f19c3c4898ac720))
* **i18n:** replace hardcoded strings with translation keys across frontend ([a155cbe](https://github.com/gander-tools/diff-voyager/commit/a155cbe799ffb1107f849b3c6eb059987d797062)), closes [#266](https://github.com/gander-tools/diff-voyager/issues/266)
* **tests:** correct import order in setup.ts for Biome linter ([c55b0d5](https://github.com/gander-tools/diff-voyager/commit/c55b0d58509078e8a1ff65ac533e4db0a1d99653))
* **tests:** remove non-null assertion in PageList.test.ts ([2ce116d](https://github.com/gander-tools/diff-voyager/commit/2ce116d11b2165f0f98a985088dbcd092c47010f))
* **tests:** update test expectations for i18n translations ([d3c28f3](https://github.com/gander-tools/diff-voyager/commit/d3c28f36e7124ee931c4ac4343105e42d341bfd8))

## [0.1.17](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.16...diff-voyager-frontend-v0.1.17) (2026-01-13)


### Bug Fixes

* **frontend:** resolve unused variable linting issue in E2E tests ([a58b2a1](https://github.com/gander-tools/diff-voyager/commit/a58b2a1b23ad030323fa07efd6e690d7621cf182))

## [0.1.16](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.15...diff-voyager-frontend-v0.1.16) (2026-01-13)


### Features

* **frontend:** implement DiffActions component ([#202](https://github.com/gander-tools/diff-voyager/issues/202)) ([fb44987](https://github.com/gander-tools/diff-voyager/commit/fb44987f0891ce84e94888d8aa492c6ec72b110c))
* **frontend:** implement DiffBadge component ([150d1df](https://github.com/gander-tools/diff-voyager/commit/150d1dfac0bc77663a2763b0a721f92c933985fe)), closes [#198](https://github.com/gander-tools/diff-voyager/issues/198)
* **frontend:** implement DiffSummary component for issue [#197](https://github.com/gander-tools/diff-voyager/issues/197) ([03769af](https://github.com/gander-tools/diff-voyager/commit/03769afcd922ff0ad483720da0af02e630853173))
* **frontend:** implement PageDetailView with four tabs and diff actions ([a710bc9](https://github.com/gander-tools/diff-voyager/commit/a710bc9f956b768ed260f66e40a9ccab0e9c9002)), closes [#193](https://github.com/gander-tools/diff-voyager/issues/193)
* **frontend:** implement PageFilters component ([c92ab4d](https://github.com/gander-tools/diff-voyager/commit/c92ab4d7ebb2280219f336092392a154e4c0c495)), closes [#196](https://github.com/gander-tools/diff-voyager/issues/196)
* **frontend:** implement PageList component ([6ad7238](https://github.com/gander-tools/diff-voyager/commit/6ad723833837a66d3fb3a06f2b0b91d8dea0a1a2)), closes [#194](https://github.com/gander-tools/diff-voyager/issues/194)
* **frontend:** implement PageStatusBadge component ([501b0d3](https://github.com/gander-tools/diff-voyager/commit/501b0d3dcb5b471ede10dc1adb7432fdbae3cf83))
* **frontend:** implement SeoDiffView component ([a8d9c56](https://github.com/gander-tools/diff-voyager/commit/a8d9c56ca45e4633fecf7df85c83740c3b075600)), closes [#199](https://github.com/gander-tools/diff-voyager/issues/199)


### Bug Fixes

* **frontend:** add NNotificationProvider wrapper to DiffActions tests ([c30adbc](https://github.com/gander-tools/diff-voyager/commit/c30adbc98f94b74839425cf6d6cf939d7c515846))
* **frontend:** import DiffStatus as value not type in DiffActions ([3eb0fa9](https://github.com/gander-tools/diff-voyager/commit/3eb0fa92609fe4728f6d9fd2ddc0036f8490a503))
* **frontend:** remove confirmation message tests from DiffActions ([e496f0d](https://github.com/gander-tools/diff-voyager/commit/e496f0d4e2f73c4741e52a7194434e86fc4f733e))
* **frontend:** simplify DiffActions tests to focus on behavior ([e248ae3](https://github.com/gander-tools/diff-voyager/commit/e248ae3bf14c4d1fb747b00eb9468a56d3476deb))

## [0.1.15](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.14...diff-voyager-frontend-v0.1.15) (2026-01-12)


### Features

* **frontend:** implement RunCreateView for issue [#186](https://github.com/gander-tools/diff-voyager/issues/186) ([f23a141](https://github.com/gander-tools/diff-voyager/commit/f23a14139a0cc08a14ad2757a6df9bde84a9e71b))
* **frontend:** implement RunDetailView for issue [#187](https://github.com/gander-tools/diff-voyager/issues/187) ([78b5840](https://github.com/gander-tools/diff-voyager/commit/78b58402f99307e3bfe47b2ee8095bef749c6159))
* **frontend:** implement RunForm component with loading and error states ([9536ba2](https://github.com/gander-tools/diff-voyager/commit/9536ba2827864856caebc092c8a0d3e21db0b6eb))
* **frontend:** implement RunListView for issue [#185](https://github.com/gander-tools/diff-voyager/issues/185) ([c7278e9](https://github.com/gander-tools/diff-voyager/commit/c7278e93c66e561969ab4fe070c00a015b64b64f))
* **frontend:** implement RunProgress component for issue [#191](https://github.com/gander-tools/diff-voyager/issues/191) ([9dd1f6b](https://github.com/gander-tools/diff-voyager/commit/9dd1f6bccad9b0a05afeed3284c2bfa5eada9ccd))
* **frontend:** implement RunStatistics component for issue [#192](https://github.com/gander-tools/diff-voyager/issues/192) ([950c914](https://github.com/gander-tools/diff-voyager/commit/950c914d9db3621e1c1b2ef33c75903ad2466a21))
* **frontend:** implement RunStatusBadge component with proper types and animation ([bfe19fe](https://github.com/gander-tools/diff-voyager/commit/bfe19fe058155332cea272772454122bba173526)), closes [#190](https://github.com/gander-tools/diff-voyager/issues/190)
* **frontend:** refactor RunCard to use shared API types ([#188](https://github.com/gander-tools/diff-voyager/issues/188)) ([d8694cc](https://github.com/gander-tools/diff-voyager/commit/d8694ccef29cf23d0f2bab5582f7a6b1f037d7db))
* **frontend:** refactor RunCard to use shared API types ([#188](https://github.com/gander-tools/diff-voyager/issues/188)) ([7f20ebe](https://github.com/gander-tools/diff-voyager/commit/7f20ebe73fe54dd71cbf1ad0c58e4ec835641e03))

## [0.1.14](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.13...diff-voyager-frontend-v0.1.14) (2026-01-11)


### Features

* **frontend:** migrate getPageDiff and listRunPages to [@ts-rest](https://github.com/ts-rest) ([dafdd7a](https://github.com/gander-tools/diff-voyager/commit/dafdd7ad93cff4d5cfe071016d3d10098b41a01a))


### Bug Fixes

* **frontend:** make project name optional and reorder form fields ([533666c](https://github.com/gander-tools/diff-voyager/commit/533666cb13d3d7a41d41515ec667f44c8d2b5da7))

## [0.1.13](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.12...diff-voyager-frontend-v0.1.13) (2026-01-11)


### Bug Fixes

* **frontend:** only set Content-Type header when request has body ([f56196d](https://github.com/gander-tools/diff-voyager/commit/f56196da420c07d652ef489546bd2eff1cb5cbd0))

## [0.1.12](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.11...diff-voyager-frontend-v0.1.12) (2026-01-11)


### Features

* **frontend:** add retry functionality UI for failed pages ([6f4fa06](https://github.com/gander-tools/diff-voyager/commit/6f4fa06e72ed7ea688fedf20a7615e07850aada9))


### Bug Fixes

* **backend,frontend:** fix re-scan not starting and incorrect status codes ([f7d072b](https://github.com/gander-tools/diff-voyager/commit/f7d072b56f8f1687f9c10aeed1363e8a4ae62da3))
* **frontend:** add missing NNotificationProvider to App.vue ([1d0878f](https://github.com/gander-tools/diff-voyager/commit/1d0878f82d4a52add550cbc049f2f9323c2f21f2))
* resolve Biome lint errors in retry functionality ([fb5cb75](https://github.com/gander-tools/diff-voyager/commit/fb5cb75275f76e5ec554936bfbfca37e96f1010a))

## [0.1.11](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.10...diff-voyager-frontend-v0.1.11) (2026-01-09)


### Bug Fixes

* **frontend:** downgrade zod to v3 for vee-validate compatibility ([7fc585b](https://github.com/gander-tools/diff-voyager/commit/7fc585b12583b4743ced8f4d6c08562c697c358f))
* **frontend:** resolve component type errors after dependency updates ([3459140](https://github.com/gander-tools/diff-voyager/commit/345914098a31609ebdb59e26b18d6ea30c8a27e8))
* **frontend:** resolve vue-tsc type-check errors for production build ([107e014](https://github.com/gander-tools/diff-voyager/commit/107e014e6d2a3a2c8e22035df4ee5f6da6bf6017))
* **frontend:** simplify ofetch type handling for compatibility ([6ee02be](https://github.com/gander-tools/diff-voyager/commit/6ee02be23090016149b25343fae2a3b5d0fffe8a))
* **frontend:** update vue-i18n API usage for v11 compatibility ([bad6de3](https://github.com/gander-tools/diff-voyager/commit/bad6de3f41cd0b5a0a0ef2a3167c6a6cab2a648e))

## [0.1.10](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.9...diff-voyager-frontend-v0.1.10) (2026-01-09)


### Features

* **frontend:** integrate vee-validate with Zod for form validation ([147312a](https://github.com/gander-tools/diff-voyager/commit/147312ae073734107b1b5280eafae4ad3ab74a08))


### Bug Fixes

* **frontend:** correct route parameter names for project views ([ace8491](https://github.com/gander-tools/diff-voyager/commit/ace8491bd414d99cc9ec404e364510517d182af1))
* **frontend:** remove non-null assertion operators ([ed9cd07](https://github.com/gander-tools/diff-voyager/commit/ed9cd0783c684120c7586428c4203f5d4dbcc6f4))

## [0.1.9](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.8...diff-voyager-frontend-v0.1.9) (2026-01-09)


### Features

* **frontend:** add Zod validation schemas for project creation ([ba2ded7](https://github.com/gander-tools/diff-voyager/commit/ba2ded7287b694a216ac44dad01619936f2a7861))
* **frontend:** implement DashboardView with statistics ([98d17cd](https://github.com/gander-tools/diff-voyager/commit/98d17cd180328a2cac765677dbaaa923951617d2))
* **frontend:** implement ProjectCard component ([774ebdb](https://github.com/gander-tools/diff-voyager/commit/774ebdb4339f4aee81b33e1b46cbe4127c2d4f41))
* **frontend:** implement ProjectCreateView with project creation flow ([777445b](https://github.com/gander-tools/diff-voyager/commit/777445bc105b7374b83d6b216fa5c9d66b23411b))
* **frontend:** implement ProjectDetailView with full project information ([f8f1d9b](https://github.com/gander-tools/diff-voyager/commit/f8f1d9b90d6391e2e3d52a181673335bfaddf87c))
* **frontend:** implement ProjectForm with multi-step wizard ([26faf26](https://github.com/gander-tools/diff-voyager/commit/26faf26930839146d1fe055d30662245a2bcbdf9))
* **frontend:** implement ProjectListView with pagination ([5825b22](https://github.com/gander-tools/diff-voyager/commit/5825b22550fede2f5d957c87fff9801644aa5466))
* **frontend:** implement projectsStore with full CRUD operations ([138adc3](https://github.com/gander-tools/diff-voyager/commit/138adc3f74164aa0070856daf23c6a6f8f61d4fb))
* **frontend:** implement ProjectStatistics component ([87ffac6](https://github.com/gander-tools/diff-voyager/commit/87ffac617d11ee804a12988dcd69089138f213de))
* **frontend:** implement ProjectStatusBadge component ([50a5a00](https://github.com/gander-tools/diff-voyager/commit/50a5a006c735ec11493834d5c46e2a19af75a14d))

## [0.1.8](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.7...diff-voyager-frontend-v0.1.8) (2026-01-09)


### Features

* **frontend:** add type-safe Vue Router helpers ([0e9ac2a](https://github.com/gander-tools/diff-voyager/commit/0e9ac2aeda081c1db1361544e65e306807c8de77))
* **frontend:** install @ts-rest/core for type-safe API client ([c7b03a6](https://github.com/gander-tools/diff-voyager/commit/c7b03a641d6bb43120b7b37c40e31a7eb3275aab))
* **frontend:** integrate [@ts-rest](https://github.com/ts-rest) client in API services ([9b8aea1](https://github.com/gander-tools/diff-voyager/commit/9b8aea16777be8826957e535875bfecf59f8f41f))

## [0.1.7](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.6...diff-voyager-frontend-v0.1.7) (2026-01-08)


### Bug Fixes

* **frontend:** add biome-ignore comments for Vue template usage ([ad61c56](https://github.com/gander-tools/diff-voyager/commit/ad61c5667bf0cace429115093d99f02a616ce4d1))
* **frontend:** add missing Vue 3 component imports ([2210817](https://github.com/gander-tools/diff-voyager/commit/2210817d78780004d6828b98d88cafd5af5a8ffb))
* **frontend:** add Naive UI imports to common components ([b35a25c](https://github.com/gander-tools/diff-voyager/commit/b35a25c3c04c392e28768661ad814f863f83ea24))
* **frontend:** install missing @vicons/tabler dependency ([6780008](https://github.com/gander-tools/diff-voyager/commit/67800089de10b9290ba04ca8f652c1388676eadc))

## [0.1.6](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.5...diff-voyager-frontend-v0.1.6) (2026-01-08)


### Bug Fixes

* **frontend:** disable Biome noUnusedVariables/noUnusedImports for Vue files ([c9a4486](https://github.com/gander-tools/diff-voyager/commit/c9a44860ddc5b471a3732c857b96a59fdaefa76c))

## [0.1.5](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.4...diff-voyager-frontend-v0.1.5) (2026-01-08)


### Features

* add common UI components with Naive UI ([1796812](https://github.com/gander-tools/diff-voyager/commit/1796812442d1fc9da647604145a0844a1dead73a))
* add i18n with English and Polish translations ([9dd4ac8](https://github.com/gander-tools/diff-voyager/commit/9dd4ac898a3e81f7b7ebb73601d746397ca90b78))
* **frontend:** configure Vue Router with all application routes ([ea41690](https://github.com/gander-tools/diff-voyager/commit/ea416900f6ab829bab62a3b8d30151cf5b4dbf0b))
* implement layout components with responsive design ([9e8c1e5](https://github.com/gander-tools/diff-voyager/commit/9e8c1e50a3d80098b2085864e6b5f221d5c48149))
* implement Pinia stores for state management ([ff8c176](https://github.com/gander-tools/diff-voyager/commit/ff8c17693579008c94558aa7947f0ef963aed3eb))
* implement typed API client with error handling ([16ca943](https://github.com/gander-tools/diff-voyager/commit/16ca94378dd747482e039ef4e9446e5e4968e6d2))

## [0.1.4](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.3...diff-voyager-frontend-v0.1.4) (2026-01-08)


### Features

* **ci:** add test coverage reporting for all packages ([a8bd155](https://github.com/gander-tools/diff-voyager/commit/a8bd1554c016bb396f25e2784e9bf14bac418238))

## [0.1.3](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.2...diff-voyager-frontend-v0.1.3) (2026-01-08)


### Features

* **frontend:** add TypeScript and build configuration ([5472180](https://github.com/gander-tools/diff-voyager/commit/547218057abb557cf8c8c76e6cf69d95956ca148))
* **frontend:** add Vue 3 dependencies and build scripts ([b4b7d6b](https://github.com/gander-tools/diff-voyager/commit/b4b7d6b614ac00d48fbf3f7998c85b3f6f3a897d))
* **frontend:** implement Vue 3 application skeleton ([f8de748](https://github.com/gander-tools/diff-voyager/commit/f8de748b30583535821a057d335e25f6ba58f4ab))

## [0.1.2](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.1...diff-voyager-frontend-v0.1.2) (2026-01-07)


### Features

* **backend:** implement minimal API structure ([#46](https://github.com/gander-tools/diff-voyager/issues/46)) ([90ee11b](https://github.com/gander-tools/diff-voyager/commit/90ee11b65770a9f4764227926925c3494e8344e9))
* **config:** configure Biome for monorepo structure ([a2befa0](https://github.com/gander-tools/diff-voyager/commit/a2befa0f1d27a50a373fcc49a352b32311289739))


### Bug Fixes

* **lint:** fix TypeScript any type and unused variables ([7403d7a](https://github.com/gander-tools/diff-voyager/commit/7403d7a2dcdbcecd3303457539f377dfb5b41d44))

## [0.1.1](https://github.com/gander-tools/diff-voyager/compare/diff-voyager-frontend-v0.1.0...diff-voyager-frontend-v0.1.1) (2026-01-05)


### Bug Fixes

* **deps:** update dependency pinia to v3 ([254b7a0](https://github.com/gander-tools/diff-voyager/commit/254b7a01e33e94578fd681ef1c27d15a5cbd423d))

## 0.1.0 (2026-01-05)


### Features

* **shared:** add README with package overview and usage ([#30](https://github.com/gander-tools/diff-voyager/issues/30)) ([2612d8a](https://github.com/gander-tools/diff-voyager/commit/2612d8a40380e8b54941ecb183c909a063fd438e))
