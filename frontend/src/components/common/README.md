# Common Components

This directory contains reusable components that can be used throughout the application.

## BaseDialog Component

The `BaseDialog` is a fully accessible dialog component that follows modern UX patterns for desktop applications. It supports confirmation dialogs, alerts, and forms.

### Features

- Accessibility compliant with proper ARIA attributes and keyboard navigation
- Focus management (trapping focus within dialog, returning focus on close)
- Support for different visual modes (default, destructive)
- Optional confirmation text input for destructive actions
- Impact points displayed as bullet lists
- Pre-title label option
- Customizable button labels and callbacks

### Props

| Prop                      | Type                       | Description                                         | Default    |
| ------------------------- | -------------------------- | --------------------------------------------------- | ---------- |
| `isOpen`                  | boolean                    | Controls whether the dialog is open                 | (required) |
| `title`                   | string                     | Dialog title displayed in header                    | (required) |
| `body`                    | string                     | Main dialog content text                            | (required) |
| `impactPoints`            | string[]                   | Optional list of impact points displayed as bullets | `[]`       |
| `primaryLabel`            | string                     | Label for primary/confirmation button               | (required) |
| `secondaryLabel`          | string                     | Label for secondary/cancel button                   | "Cancel"   |
| `onPrimary`               | () => void                 | Function called when primary action is confirmed    | (required) |
| `onCancel`                | () => void                 | Function called when dialog is cancelled/closed     | (required) |
| `mode`                    | "default" \| "destructive" | Dialog mode - affects styling and ARIA attributes   | "default"  |
| `requireConfirmationText` | string                     | Optional text user must type to enable confirmation | undefined  |
| `onAfterConfirm`          | () => void                 | Optional callback after confirmation                | undefined  |
| `closeOnBackdropClick`    | boolean                    | Controls whether clicking backdrop closes dialog    | `true`     |
| `preLabel`                | string                     | Optional pre-title label text                       | undefined  |
| `closeOnEsc`              | boolean                    | Whether to allow pressing ESC to close              | `true`     |

### Usage Examples

#### Standard Dialog

```jsx
<BaseDialog
  isOpen={isDialogOpen}
  onCancel={() => setIsDialogOpen(false)}
  title="Update Configuration"
  body="Are you sure you want to update the system configuration?"
  impactPoints={[
    "Configuration changes will be logged",
    "Some services may restart automatically",
  ]}
  primaryLabel="Apply Changes"
  onPrimary={() => {
    // Apply the changes
    setIsDialogOpen(false);
  }}
/>
```

#### Destructive Dialog

```jsx
<BaseDialog
  isOpen={isDeleteDialogOpen}
  onCancel={() => setIsDeleteDialogOpen(false)}
  title="Delete Asset"
  body="Are you sure you want to delete this asset? This action cannot be undone."
  primaryLabel="Delete Asset"
  secondaryLabel="Keep Asset"
  onPrimary={() => {
    // Delete the asset
    setIsDeleteDialogOpen(false);
  }}
  mode="destructive"
  preLabel="Warning"
/>
```

#### Confirmation Text Dialog

```jsx
<BaseDialog
  isOpen={isResetDialogOpen}
  onCancel={() => setIsResetDialogOpen(false)}
  title="Confirm Database Reset"
  body="You are about to reset the database to factory defaults."
  primaryLabel="Reset Database"
  onPrimary={() => {
    // Reset the database
    setIsResetDialogOpen(false);
  }}
  mode="destructive"
  requireConfirmationText="RESET"
/>
```

## DialogExamples Component

The `DialogExamples` component demonstrates different configurations of the BaseDialog. You can use this as a reference for how to implement various dialog types in your application.

To see these examples, import and render the `DialogExamples` component in your application:

```jsx
import { DialogExamples } from "../components/common";

// In your component render method
<DialogExamples />;
```
