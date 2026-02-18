# Simple template engine

Lightweight and primitive template engine that ended up not used in the project

### Example usage

```typescript
import { Template } from 'simple-templator';

const template = Template.parse('Hello, {{ name }}!');
if (template.hasVariable('name')) {
  const username = fetchUserName();
  console.log(template.process({
    name: username
  }))
}
```