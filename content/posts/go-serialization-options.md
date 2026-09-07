---
title: "Go Serialization Options"
date: 2025-05-12
tags:
  - golang
description: "How Go types expose custom wire formats with MarshalText, MarshalJSON, and helper-based serialization."
---

## Summary

Go types can expose custom wire formats through `encoding/json` and related packages. The main choices are `MarshalText` / `UnmarshalText`, `MarshalJSON` / `UnmarshalJSON`, or explicit helper functions. Each option trades off convenience, control, and complexity.

## 1. `MarshalText` / `UnmarshalText`

Implements `encoding.TextMarshaler` and `encoding.TextUnmarshaler`.

This converts values to plain text. JSON, XML, and other encoders automatically use it when a custom JSON marshaler is absent.

```go
func (n Name) MarshalText() ([]byte, error) {
	return []byte(n.value), nil
}

func (n *Name) UnmarshalText(data []byte) error {
	n.value = string(data)
	return nil
}
```

## 2. `MarshalJSON` / `UnmarshalJSON`

Implements `json.Marshaler` and `json.Unmarshaler`.

This gives full control over the JSON representation.

```go
func (n Name) MarshalJSON() ([]byte, error) {
	return json.Marshal("prefix-" + n.value)
}

func (n *Name) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	if !strings.HasPrefix(s, "prefix-") {
		return errors.New("invalid format")
	}
	n.value = strings.TrimPrefix(s, "prefix-")
	return nil
}
```

## 3. Helper function (`MarshalName`)

No interface implementation. Useful for tests or custom glue code without exposing marshaler interfaces.

```go
func MarshalName(n Name) ([]byte, error) {
	return []byte(n.value), nil
}
```

## Comparison

| Method          | Interface                | `encoding/json` ready? | Control over JSON | Complexity |
| --------------- | ------------------------ | ---------------------: | ----------------: | ---------: |
| `MarshalText`   | `encoding.TextMarshaler` |                    Yes |           Partial |        Low |
| `MarshalJSON`   | `json.Marshaler`         |                    Yes |              Full |       High |
| Helper function | None                     |                     No |            Manual |        Low |

## Choosing between them

- **`MarshalText`**: ideal for strong types with a simple text representation.
- **`MarshalJSON`**: choose it when the JSON structure itself must be customised.
- **Helper function**: useful for isolated scenarios or tests without changing the type.

## Key detail

`encoding/json` uses `MarshalText` automatically if `MarshalJSON` is not present, so in many cases implementing `MarshalText` is enough.
