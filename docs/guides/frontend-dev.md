# Frontend Development

This guide covers frontend development workflows for Diff Voyager's Vue 3 + TypeScript frontend.

## Development Commands

```bash
cd packages/frontend
npm install
npm run dev              # Start dev server
npm test                 # Run tests
```

## Common Frontend Issues

### Vue 3 Component Resolution Errors

If you see console errors like:
```
[Vue warn]: Failed to resolve component: NButton
[Vue warn]: Failed to resolve component: DefaultLayout
```

**Root Cause**: Vue 3 requires explicit imports for all components. Components cannot be used in templates without importing them first.

**Solution**: Add explicit imports at the top of the `<script setup>` section:

```typescript
// For Naive UI components
import { NButton, NCard, NLayout } from 'naive-ui';

// For custom components
import DefaultLayout from './components/layouts/DefaultLayout.vue';

// For router components
import { RouterView } from 'vue-router';
```

### Note on @vicons/tabler

Ensure the package is installed:
```bash
npm install @vicons/tabler
```

Available icon names can be found in `node_modules/@vicons/tabler/es/`. Common icons:
- `Dashboard`, `Settings`, `Filter`
- `Folder` (note: `FolderOpen` does not exist)
- `Globe`, `Moon`, `Sun`
- `PlaylistAdd`, `Playlist`

Import icons with exact PascalCase names:
```typescript
import { Dashboard, Filter, Folder } from '@vicons/tabler';
```

## Form Validation with vee-validate

**Status**: ✅ Implemented (January 2026)

Diff Voyager uses [vee-validate](https://vee-validate.logaretm.com/) with Zod schemas for declarative form validation in Vue 3.

### Dependencies

- `vee-validate@^4.15.1` - Vue 3 form validation library
- `@vee-validate/zod@^4.15.1` - Zod schema integration
- `zod@^3.25.76` - Schema validation (compatible with @ts-rest and vee-validate)

### Why vee-validate + Zod?

- **Declarative validation**: Define validation rules in Zod schemas, not imperative code
- **Type-safe**: Full TypeScript inference from schemas
- **DRY principle**: Single source of truth for validation and types
- **Better UX**: Built-in support for validation on blur/change/submit
- **Clean code**: No manual error state management

### Example Usage

```typescript
// 1. Define Zod schema in validators.ts
export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  url: z.string().url('Invalid URL format'),
  // ... more fields
});

// 2. Use in Vue component
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

const { handleSubmit, errors, defineField, validate } = useForm({
  validationSchema: toTypedSchema(createProjectSchema),
  initialValues: { name: '', url: '' },
});

// 3. Define form fields
const [name] = defineField('name');
const [url] = defineField('url');

// 4. Handle submission
const onSubmit = handleSubmit((values) => {
  // values is fully typed from schema
  emit('submit', values);
});
```

### Key Features

- **Nested fields**: Use dot notation for nested validation (`viewport.width`)
- **Async validation**: Built-in support for async rules
- **Multi-step forms**: Validate specific fields using `validate()`
- **Integration with Naive UI**: Works seamlessly with NForm components

### Important Notes

- vee-validate requires `zod@^3.x` (not v4) for compatibility
- All form validation should use vee-validate for consistency
- Error messages should be defined in Zod schemas, not in components
- Test async validation with proper awaits: `await wrapper.vm.$nextTick()`

See `packages/frontend/src/components/ProjectForm.vue` for a complete multi-step form example.

## Screenshot Updates

**Status**: ✅ Automated screenshot generation with Heroshot

Diff Voyager uses [Heroshot](https://heroshot.sh/) for automated screenshot generation of all UI views.

### When to Update Screenshots

- After implementing new views or pages
- After making visual changes to existing views
- After UI/UX improvements
- Before committing frontend changes

### How to Update

```bash
# Ensure frontend dev server is running
npm run dev:frontend

# In another terminal, generate screenshots
npm run screenshots
```

### What Happens

1. Heroshot reads configuration from `.heroshot/config.json`
2. Navigates to each configured URL
3. Executes automated actions (form filling, navigation)
4. Captures 13 screenshots (1024x768) as PNG
5. Saves to `docs/screenshots/*.png`

### Screenshot Files

- `01-dashboard.png` - Main dashboard
- `02-projects-list.png` - Project list with pagination
- `03-project-create-step1.png` - Project wizard: Basic Info
- `03-project-create-step2.png` - Project wizard: Crawl Settings
- `03-project-create-step3.png` - Project wizard: Run Profile
- `04-project-detail.png` - Project detail view
- `05-run-create.png` - Run creation form
- `06-run-detail.png` - Run detail and results
- `07-page-detail.png` - Page comparison details
- `08-rules-list.png` - Mute rules list
- `09-rule-create.png` - Rule creation form
- `10-settings.png` - Application settings
- `11-not-found.png` - 404 page

### Key Features

- **Config-based**: Add new screenshots by editing `.heroshot/config.json` (no code changes)
- **Multi-step forms**: Automated navigation through wizard steps with form filling
- **Actions API**: Supports `click`, `type`, `wait`, and other browser interactions
- **Consistent naming**: Follows predictable `{number}-{route-name}.png` pattern

### Important Notes

- Screenshots are **version controlled** in git (included in commits)
- Used in documentation: `roadmap.md`, `CLAUDE.md`, `docs/screenshots/README.md`
- Viewport: 1024x768 (configured in `.heroshot/config.json`)
- Configuration: `.heroshot/config.json`
- See `docs/screenshots/README.md` for complete index

### Troubleshooting

- **Frontend not running**: Start with `npm run dev:frontend` on port 5173
- **Heroshot not found**: Install with `npm install --save-dev heroshot@^0.11.0`
- **Form interactions fail**: Verify selectors in `.heroshot/config.json` with DevTools
- **Incomplete screenshots**: Increase wait times in action sequences

## Common UI Component Patterns

### Naive UI Stepper Component

**Issue Reference**: [#304](https://github.com/gander-tools/diff-voyager/issues/304)

Naive UI's `NSteps` component expects **1-based indexing** for the `:current` prop, while component state typically uses 0-based indexing.

**❌ Incorrect** (causes wrong step highlighting):
```vue
<NSteps :current="currentStep">  <!-- currentStep = 0, 1, 2 -->
  <NStep title="Step 1" />
  <NStep title="Step 2" />
  <NStep title="Step 3" />
</NSteps>
```

**✅ Correct** (convert to 1-based):
```vue
<NSteps :current="currentStep + 1">  <!-- Converts 0,1,2 → 1,2,3 -->
  <NStep title="Step 1" />
  <NStep title="Step 2" />
  <NStep title="Step 3" />
</NSteps>
```

**Key Points**:
- Internal state: Use 0-based indexing (`currentStep = 0, 1, 2`)
- NSteps binding: Convert to 1-based (`currentStep + 1`)
- Always verify visual feedback during development

### Naive UI Breadcrumb Component

**Issue Reference**: [#314](https://github.com/gander-tools/diff-voyager/issues/314)

Breadcrumbs require explicit separator configuration to display properly formatted navigation paths.

**❌ Incorrect** (shows concatenated text):
```vue
<NBreadcrumb>
  <NBreadcrumbItem>Dashboard</NBreadcrumbItem>
  <NBreadcrumbItem>Projects</NBreadcrumbItem>
  <NBreadcrumbItem>{{ projectName }}</NBreadcrumbItem>
</NBreadcrumb>
```

**✅ Correct** (with separators):
```vue
<NBreadcrumb separator=">">
  <NBreadcrumbItem>Dashboard</NBreadcrumbItem>
  <NBreadcrumbItem>Projects</NBreadcrumbItem>
  <NBreadcrumbItem>{{ projectName }}</NBreadcrumbItem>
</NBreadcrumb>
```

**Alternative** (custom separator):
```vue
<NBreadcrumb>
  <template #separator>
    <span class="breadcrumb-separator">›</span>
  </template>
  <NBreadcrumbItem>Dashboard</NBreadcrumbItem>
  <!-- ... -->
</NBreadcrumb>

<style scoped>
.breadcrumb-separator {
  margin: 0 8px;
  color: #999;
}
</style>
```

### Delete Confirmation Dialogs

**Issue Reference**: [#315](https://github.com/gander-tools/diff-voyager/issues/315)

**All destructive operations must show confirmation dialogs** to prevent accidental data loss.

**✅ Required pattern** for delete operations:
```vue
<script setup lang="ts">
import { useDialog } from 'naive-ui';
import { useI18n } from 'vue-i18n';

const dialog = useDialog();
const { t } = useI18n();

const handleDelete = (projectId: string) => {
  dialog.warning({
    title: t('projects.deleteConfirm.title'),
    content: t('projects.deleteConfirm.message'),
    positiveText: t('common.delete'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await projectsStore.deleteProject(projectId);
        message.success(t('projects.deleteSuccess'));
      } catch (error) {
        message.error(t('projects.deleteError'));
      }
    },
  });
};
</script>
```

**Required i18n keys**:
```json
{
  "projects": {
    "deleteConfirm": {
      "title": "Delete Project",
      "message": "Are you sure you want to delete this project? This action cannot be undone."
    },
    "deleteSuccess": "Project deleted successfully",
    "deleteError": "Failed to delete project"
  }
}
```

**Operations requiring confirmation**:
- Project deletion
- Run deletion
- Baseline deletion
- Bulk delete operations
- Any irreversible data changes

## Related Documentation

- [i18n Guide](i18n.md) - Internationalization with Vue I18n
- [Getting Started](getting-started.md) - Initial setup
- [Testing Strategy](testing-strategy.md) - Frontend testing approach
- [Common Regression Points](common-regressions.md) - Known fragile areas to watch
