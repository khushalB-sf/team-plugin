---
name: team-standards
description: This skill applies whenever writing, editing, or reviewing TypeScript or
             JavaScript code — functions, classes, API handlers, services, hooks, or tests.
             Enforces the engineering team's coding standards for error handling, logging,
             naming conventions, and type safety.
version: 1.0.0
---

# Team Coding Standards

Apply these standards to all code you write or edit.

## Error Handling

Use the Result pattern for expected failures. Never throw for domain errors.

```typescript
// Correct — expected failures use Result
type Result<T> = { data: T; error: null } | { data: null; error: Error }

async function getUser(id: string): Promise<Result<User>> {
  const user = await db.users.findById(id)
  if (!user) return { data: null, error: new Error(`User ${id} not found`) }
  return { data: user, error: null }
}

// Correct — callers handle explicitly
const { data: user, error } = await getUser(id)
if (error) return res.status(404).json({ message: error.message })

// Wrong — throwing for expected cases
async function getUser(id: string): Promise<User> {
  const user = await db.users.findById(id)
  if (!user) throw new Error("User not found")  // ← do not do this
  return user
}
```

Reserve `throw` only for truly unexpected failures (programmer errors, broken invariants).

## Logging

Every function that touches external I/O (database, HTTP, file system, queue) must log entry and exit.

```typescript
// Required pattern
async function createOrder(input: CreateOrderInput): Promise<Result<Order>> {
  logger.info("createOrder: start", { userId: input.userId, items: input.items.length })
  
  // ... do work ...
  
  if (error) {
    logger.error("createOrder: failed", { error: error.message, userId: input.userId })
    return { data: null, error }
  }
  
  logger.info("createOrder: complete", { orderId: order.id, duration })
  return { data: order, error: null }
}
```

**Never log:** passwords, tokens, full card numbers, PII (email in errors is OK, full user objects are not).

## Type Safety

- No `any` types. Use `unknown` with runtime narrowing if you must be flexible.
- All external data (API responses, user input, env vars) must be validated with Zod before use.
- All function parameters and return types must be explicitly annotated.

```typescript
// Correct
const schema = z.object({ email: z.string().email(), role: z.enum(["admin", "member"]) })
type InvitePayload = z.infer<typeof schema>

// Wrong
function inviteUser(payload: any) { ... }  // ← never any
```

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `user-service.ts` |
| Functions | camelCase | `getUserById` |
| Classes | PascalCase | `UserService` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| React components | PascalCase | `UserCard.tsx` |
| Hooks | `use` prefix | `useUserData` |

Never abbreviate: `userId` not `uid`, `response` not `res`, `configuration` not `cfg`.

## File Structure

Services live in `src/services/`, API handlers in `src/api/`, shared types in `src/types/`.  
One class or one logical group of functions per file.  
Files over 300 lines should be split.

## Async Patterns

- Always `await` promises. Never fire-and-forget unless explicitly intentional (and comment why).
- Always handle promise rejections — either `try/catch` or `.catch()`.
- Use `Promise.all()` for independent parallel operations, not sequential awaits.

```typescript
// Correct — parallel
const [users, orders] = await Promise.all([fetchUsers(), fetchOrders()])

// Wrong — sequential when parallel is possible
const users = await fetchUsers()
const orders = await fetchOrders()
```
