// Dependency-free validator for the subset of JSON Schema (draft 2020-12)
// used by the vendored Agent Plugins schemas in schemas/agent-plugins/1.0.0/:
// type, properties, required, additionalProperties, const, enum, pattern,
// minLength, maxLength, items, oneOf, propertyNames, not, and a local
// same-document $ref (`#/$defs/...`). This is not a general JSON Schema
// implementation; extend it only alongside a real schema construct in one of
// the two vendored schemas, not speculatively.

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function resolveRef(root, ref) {
  if (!ref.startsWith('#/')) throw new Error(`unsupported $ref target: ${ref}`);
  return ref
    .slice(2)
    .split('/')
    .reduce((node, segment) => {
      if (node == null || !(segment in node)) throw new Error(`$ref does not resolve: ${ref}`);
      return node[segment];
    }, root);
}

const pathText = (path) => (path.length === 0 ? '(root)' : path.join('.'));

/**
 * Validates `data` against `schema` and returns a list of human-readable
 * error strings. An empty list means `data` conforms.
 */
export function validate(schema, data, root = schema, path = []) {
  if (schema.$ref) return validate(resolveRef(root, schema.$ref), data, root, path);

  const errors = [];
  const report = (message) => errors.push(`${pathText(path)}: ${message}`);

  if (schema.const !== undefined) {
    if (data !== schema.const) report(`must equal ${JSON.stringify(schema.const)}, got ${JSON.stringify(data)}`);
    return errors;
  }
  if (schema.enum) {
    if (!schema.enum.some((allowed) => allowed === data)) {
      report(`must be one of ${JSON.stringify(schema.enum)}, got ${JSON.stringify(data)}`);
    }
    return errors;
  }

  if (schema.type) {
    const actual = typeOf(data);
    const ok = schema.type === 'integer' ? actual === 'number' && Number.isInteger(data) : actual === schema.type;
    if (!ok) {
      report(`must be type ${schema.type}, got ${actual}`);
      return errors;
    }
  }

  if (typeof data === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      report(`must be at least ${schema.minLength} character(s), got ${data.length}`);
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      report(`must be at most ${schema.maxLength} character(s), got ${data.length}`);
    }
    if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(data)) {
      report(`must match pattern ${schema.pattern}, got ${JSON.stringify(data)}`);
    }
  }

  if (Array.isArray(data) && schema.items) {
    data.forEach((item, index) => errors.push(...validate(schema.items, item, root, [...path, index])));
  }

  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    const declared = new Set(Object.keys(schema.properties ?? {}));
    for (const key of schema.required ?? []) {
      if (!(key in data)) report(`missing required property "${key}"`);
    }
    for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
      if (key in data) errors.push(...validate(propSchema, data[key], root, [...path, key]));
    }
    if (schema.additionalProperties !== undefined) {
      for (const key of Object.keys(data)) {
        if (declared.has(key)) continue;
        if (schema.additionalProperties === false) {
          report(`additional property "${key}" is not allowed`);
        } else {
          errors.push(...validate(schema.additionalProperties, data[key], root, [...path, key]));
        }
      }
    }
    if (schema.propertyNames) {
      for (const key of Object.keys(data)) {
        errors.push(...validate(schema.propertyNames, key, root, [...path, `<property name "${key}">`]));
      }
    }
  }

  if (schema.not && validate(schema.not, data, root, path).length === 0) {
    report('must not match the forbidden schema');
  }

  if (schema.oneOf) {
    const perVariant = schema.oneOf.map((variant) => validate(variant, data, root, path));
    const matching = perVariant.filter((variantErrors) => variantErrors.length === 0);
    if (matching.length === 0) {
      report(`matches none of ${schema.oneOf.length} allowed shapes (first mismatch each: ${perVariant.map((v) => v[0]).join(' | ')})`);
    } else if (matching.length > 1) {
      report(`matches more than one allowed shape, which is ambiguous`);
    }
  }

  return errors;
}
