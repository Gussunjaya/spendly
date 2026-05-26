# Skill: Pinia State Management Best Practices

## Context

Guidelines for generating scalable, reactive, and predictable state management using Pinia in Vue 3 applications.

## Rules for Code Generation:

1. **Always Use Setup Stores:** Define stores using the function syntax (`() => { ... }`) rather than the Options API object syntax.
   - _Correct:_ `export const useWalletStore = defineStore('wallet', () => { ... })`
2. **Reactivity Core:** Use `ref()` for state properties and `computed()` for getters.
3. **Strict Mutations:** Do not mutate store state directly inside Vue components. Always create explicit action functions within the store to handle state mutations.
4. **Data Aggregations:** Wrap all financial math calculations, transaction filtering, and balance balance calculations inside `computed()` to leverage caching and global reactivity.
